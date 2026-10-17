using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.Data.Entities;
using Eocr.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Repos;

public interface IReviewRepo
{
    Task<List<AdminRequestSummaryDto>> GetQueueAsync(CancellationToken ct);
    Task<AdminRequestDetailDto?> GetDetailAsync(int requestId, CancellationToken ct);
    Task<List<ReviewerOptionDto>> GetReviewersAsync(CancellationToken ct);
    Task<AdminWriteResultDto> AssignAsync(int adminId, int requestId, AssignRequestDto input, CancellationToken ct);
    Task<AdminWriteResultDto> SaveReviewAsync(int adminId, int requestId, SaveReviewDto input, CancellationToken ct);
    Task<AdminWriteResultDto> MoveAsync(
        int adminId, int requestId, string action, RequestActionDto input, CancellationToken ct);
    Task<AdminWriteResultDto> DecideAsync(int adminId, int requestId, DecideRequestDto input, CancellationToken ct);
}

// The admin side of the workflow: the review queue, assignment, the summary review and the status moves
// up to the decision (which also updates the catalog).
public class ReviewRepo(EocrDbContext db) : IReviewRepo
{
    private const int MaxText = 4000;

    // Decision outcomes (RequestStatus values) and the catalog approval status each one sets.
    private static readonly Dictionary<string, string> OutcomeApprovalStatus = new()
    {
        [CodeConstants.RequestStatuses.Approved] = CodeConstants.ApprovalStatuses.Approved,
        [CodeConstants.RequestStatuses.ApprovedWithConditions] = CodeConstants.ApprovalStatuses.ApprovedWithConditions,
        [CodeConstants.RequestStatuses.Denied] = CodeConstants.ApprovalStatuses.Denied,
    };

    // Drafts belong to the requester until they are submitted, so the queue leaves them out.
    public Task<List<AdminRequestSummaryDto>> GetQueueAsync(CancellationToken ct) =>
        db.VettingRequests.AsNoTracking()
            .Where(r => r.Status.Value != CodeConstants.RequestStatuses.Draft)
            .OrderByDescending(r => r.UpdatedAt).ThenBy(r => r.RequestId)
            .Select(r => new AdminRequestSummaryDto
            {
                RequestId = r.RequestId,
                SoftwareName = r.SoftwareName,
                Vendor = r.Vendor,
                Version = r.Version,
                RequestorName = r.Requestor.Name,
                StatusCode = r.Status.Value,
                StatusLabel = r.Status.Label,
                AssignedReviewerId = r.AssignedReviewerId,
                AssignedReviewerName = r.AssignedReviewer == null ? null : r.AssignedReviewer.Name,
                SubmittedAt = r.SubmittedAt,
                UpdatedAt = r.UpdatedAt,
            })
            .ToListAsync(ct);

    public async Task<AdminRequestDetailDto?> GetDetailAsync(int requestId, CancellationToken ct)
    {
        var detail = await db.VettingRequests.AsNoTracking()
            .Where(r => r.RequestId == requestId && r.Status.Value != CodeConstants.RequestStatuses.Draft)
            .Select(r => new AdminRequestDetailDto
            {
                RequestorName = r.Requestor.Name,
                RequestorEmail = r.Requestor.Email,
                AssignedReviewerId = r.AssignedReviewerId,
                AssignedReviewerName = r.AssignedReviewer == null ? null : r.AssignedReviewer.Name,
                Review = r.Review == null ? null : new ReviewDto
                {
                    ReviewId = r.Review.ReviewId,
                    ReviewerName = r.Review.Reviewer.Name,
                    ReviewTypeCode = r.Review.ReviewType.Value,
                    ReviewTypeLabel = r.Review.ReviewType.Label,
                    VendorQuestions = r.Review.VendorQuestions,
                    OverallAssessment = r.Review.OverallAssessment,
                    Findings = r.Review.Findings,
                    RiskRatingId = r.Review.RiskRatingId,
                    RiskRatingCode = r.Review.RiskRating == null ? null : r.Review.RiskRating.Value,
                    RiskRatingLabel = r.Review.RiskRating == null ? null : r.Review.RiskRating.Label,
                    RecommendationId = r.Review.RecommendationId,
                    RecommendationCode = r.Review.Recommendation == null ? null : r.Review.Recommendation.Value,
                    RecommendationLabel = r.Review.Recommendation == null ? null : r.Review.Recommendation.Label,
                    Conditions = r.Review.Conditions,
                    ReviewedAt = r.Review.ReviewedAt,
                    UpdatedAt = r.Review.UpdatedAt,
                },
            })
            .SingleOrDefaultAsync(ct);
        if (detail is null) return null;

        detail.Request = await db.VettingRequests.AsNoTracking()
            .Where(r => r.RequestId == requestId)
            .Select(RequestRepo.DetailProjection)
            .SingleAsync(ct);
        detail.AllowedActions = [.. RequestWorkflow.AllowedActions(detail.Request.StatusCode)];

        // Every catalog version of the same product, so the reviewer can see what was decided before.
        var name = detail.Request.SoftwareName;
        var vendor = detail.Request.Vendor;
        detail.CatalogVersions = await db.Software.AsNoTracking()
            .Where(s => s.SoftwareName == name && s.VendorName == vendor)
            .OrderBy(s => s.Version).ThenBy(s => s.SoftwareId)
            .Select(SoftwareRepo.CatalogProjection)
            .ToListAsync(ct);
        return detail;
    }

    public Task<List<ReviewerOptionDto>> GetReviewersAsync(CancellationToken ct) =>
        db.Users.AsNoTracking()
            .Where(u => Roles.WriterRoles.Contains(u.Role.Value))
            .OrderBy(u => u.Name).ThenBy(u => u.UserId)
            .Select(u => new ReviewerOptionDto { UserId = u.UserId, Name = u.Name })
            .ToListAsync(ct);

    // Assigns the request to an admin (the caller when no reviewer is given). It is not a status change, so
    // it writes no history record.
    public async Task<AdminWriteResultDto> AssignAsync(
        int adminId, int requestId, AssignRequestDto input, CancellationToken ct)
    {
        var request = await LoadAsync(requestId, ct);
        if (request is null) return new AdminWriteResultDto { NotFound = true };
        if (!RequestWorkflow.IsAllowed(request.Status.Value, RequestWorkflow.Actions.Assign))
            return new AdminWriteResultDto { InvalidTransition = true };
        if (input.UpdatedAt != request.UpdatedAt) return new AdminWriteResultDto { Conflict = true };

        var reviewerId = input.ReviewerId ?? adminId;
        if (!await db.Users.AnyAsync(u => u.UserId == reviewerId
                && Roles.WriterRoles.Contains(u.Role.Value), ct))
            return WithError(nameof(input.ReviewerId), "Select a Sys Admin or Super Admin.");

        request.AssignedReviewerId = reviewerId;
        request.UpdatedAt = DateTimeOffset.UtcNow;
        return await SaveAsync(request, input.UpdatedAt, ct);
    }

    // Saves the summary review. The request's own UpdatedAt is left alone so the review form and the
    // workflow buttons do not conflict with each other; the review has its own concurrency token.
    public async Task<AdminWriteResultDto> SaveReviewAsync(
        int adminId, int requestId, SaveReviewDto input, CancellationToken ct)
    {
        var request = await db.VettingRequests
            .Include(r => r.Status)
            .Include(r => r.Review)
            .SingleOrDefaultAsync(r => r.RequestId == requestId, ct);
        if (request is null || request.Status.Value == CodeConstants.RequestStatuses.Draft)
            return new AdminWriteResultDto { NotFound = true };
        if (!RequestWorkflow.IsAllowed(request.Status.Value, RequestWorkflow.Actions.SaveReview))
            return new AdminWriteResultDto { InvalidTransition = true };
        if (input.UpdatedAt != request.Review?.UpdatedAt) return new AdminWriteResultDto { Conflict = true };

        var result = new AdminWriteResultDto();
        CheckLength(result, nameof(input.VendorQuestions), input.VendorQuestions);
        CheckLength(result, nameof(input.OverallAssessment), input.OverallAssessment);
        CheckLength(result, nameof(input.Findings), input.Findings);
        CheckLength(result, nameof(input.Conditions), input.Conditions);
        await CheckCodeAsync(result, nameof(input.RiskRatingId), input.RiskRatingId,
            CodeConstants.CodeTypes.AccessibilityRisk, ct);
        await CheckCodeAsync(result, nameof(input.RecommendationId), input.RecommendationId,
            CodeConstants.CodeTypes.Recommendation, ct);
        if (result.Errors.Count > 0) return result;

        var reviewType = request.Status.Value == CodeConstants.RequestStatuses.AiReview
            ? CodeConstants.ReviewTypes.Ai
            : CodeConstants.ReviewTypes.Human;
        var reviewTypeId = await db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.ReviewType && c.Value == reviewType)
            .Select(c => c.CodeId)
            .SingleAsync(ct);

        var now = DateTimeOffset.UtcNow;
        var review = request.Review;
        if (review is null)
        {
            review = new Review { RequestId = request.RequestId, ReviewedAt = now };
            db.Reviews.Add(review);
        }
        else
        {
            db.Entry(review).Property(v => v.UpdatedAt).OriginalValue = input.UpdatedAt!.Value;
        }
        review.ReviewerId = adminId;
        review.ReviewTypeId = reviewTypeId;
        review.VendorQuestions = Clean(input.VendorQuestions);
        review.OverallAssessment = Clean(input.OverallAssessment);
        review.Findings = Clean(input.Findings);
        review.RiskRatingId = input.RiskRatingId;
        review.RecommendationId = input.RecommendationId;
        review.Conditions = Clean(input.Conditions);
        review.UpdatedAt = now;

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // A stale token, or another admin saved the first review at the same moment (unique RequestId).
            return new AdminWriteResultDto { Conflict = true };
        }
        result.Detail = await GetDetailAsync(requestId, ct);
        return result;
    }

    // A status move other than the decision: start AI or human review, request more information, or send
    // the request for an EEAAP exception. Starting a review assigns an unassigned request to the caller.
    public async Task<AdminWriteResultDto> MoveAsync(
        int adminId, int requestId, string action, RequestActionDto input, CancellationToken ct)
    {
        var request = await LoadAsync(requestId, ct);
        if (request is null) return new AdminWriteResultDto { NotFound = true };
        var target = RequestWorkflow.TargetStatus(action);
        if (target is null || !RequestWorkflow.IsAllowed(request.Status.Value, action))
            return new AdminWriteResultDto { InvalidTransition = true };
        if (input.UpdatedAt != request.UpdatedAt) return new AdminWriteResultDto { Conflict = true };

        var result = new AdminWriteResultDto();
        CheckLength(result, nameof(input.Comments), input.Comments);
        if (action == RequestWorkflow.Actions.RequestInfo && string.IsNullOrWhiteSpace(input.Comments))
            result.Errors[nameof(input.Comments)] = ["Tell the requester what information you need."];
        if (action == RequestWorkflow.Actions.SendForEeaap && string.IsNullOrWhiteSpace(input.Comments))
            result.Errors[nameof(input.Comments)] = ["Tell the requester what the EEAAP needs to cover."];
        if (result.Errors.Count > 0) return result;

        if (action is RequestWorkflow.Actions.StartAiReview or RequestWorkflow.Actions.StartReview)
            request.AssignedReviewerId ??= adminId;

        var now = DateTimeOffset.UtcNow;
        if (action == RequestWorkflow.Actions.SendForEeaap)
        {
            // A new EEAAP, or a submitted one sent back for changes: it waits on the requester again.
            var requestedId = await ExceptionStatusIdAsync(CodeConstants.ExceptionStatuses.Requested, ct);
            if (request.Exception is null)
            {
                db.Exceptions.Add(new AccessibilityException
                {
                    Request = request,
                    RequestorId = request.RequestorId,
                    StatusId = requestedId,
                    CreatedAt = now,
                    UpdatedAt = now,
                });
            }
            else
            {
                request.Exception.StatusId = requestedId;
                request.Exception.UpdatedAt = now;
            }
        }
        else if (action == RequestWorkflow.Actions.StartReview
            && request.Exception?.Status.Value == CodeConstants.ExceptionStatuses.Requested)
        {
            // Back to review before the requester submitted the EEAAP: the request for one is withdrawn.
            request.Exception.StatusId = await ExceptionStatusIdAsync(CodeConstants.ExceptionStatuses.Withdrawn, ct);
            request.Exception.UpdatedAt = now;
        }

        await RequestWorkflow.ChangeStatusAsync(db, request, target, adminId, now, input.Comments, ct);
        return await SaveAsync(request, input.UpdatedAt, ct);
    }

    // The decision: sets the request's final status and records the outcome on the catalog row for the
    // request's name, vendor and version (created when that version is new to the catalog).
    public async Task<AdminWriteResultDto> DecideAsync(
        int adminId, int requestId, DecideRequestDto input, CancellationToken ct)
    {
        var request = await LoadAsync(requestId, ct);
        if (request is null) return new AdminWriteResultDto { NotFound = true };
        if (!RequestWorkflow.IsAllowed(request.Status.Value, RequestWorkflow.Actions.Decide))
            return new AdminWriteResultDto { InvalidTransition = true };
        if (input.UpdatedAt != request.UpdatedAt) return new AdminWriteResultDto { Conflict = true };

        var result = new AdminWriteResultDto();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var outcome = input.Outcome ?? string.Empty;
        var isApproval = outcome is CodeConstants.RequestStatuses.Approved
            or CodeConstants.RequestStatuses.ApprovedWithConditions;
        if (!OutcomeApprovalStatus.ContainsKey(outcome))
            result.Errors[nameof(input.Outcome)] = ["Select a decision."];
        if (isApproval && input.ApprovalExpirationDate is null)
            result.Errors[nameof(input.ApprovalExpirationDate)] = ["Enter the date this approval expires."];
        else if (isApproval && input.ApprovalExpirationDate <= today)
            result.Errors[nameof(input.ApprovalExpirationDate)] = ["Enter a date after today."];
        if (outcome == CodeConstants.RequestStatuses.ApprovedWithConditions
            && string.IsNullOrWhiteSpace(input.Conditions))
            result.Errors[nameof(input.Conditions)] = ["Enter the conditions of this approval."];
        // A submitted EEAAP is decided with the request: approved with conditions or denied.
        var exception = request.Exception?.Status.Value == CodeConstants.ExceptionStatuses.Submitted
            ? request.Exception
            : null;
        if (exception is not null && outcome == CodeConstants.RequestStatuses.Approved)
            result.Errors[nameof(input.Outcome)] =
                ["An EEAAP was submitted: approve with conditions, or deny."];
        CheckLength(result, nameof(input.Conditions), input.Conditions);
        CheckLength(result, nameof(input.Comments), input.Comments);
        await CheckCodeAsync(result, nameof(input.AccessibilityRiskId), input.AccessibilityRiskId,
            CodeConstants.CodeTypes.AccessibilityRisk, ct);
        if (result.Errors.Count > 0) return result;

        var now = DateTimeOffset.UtcNow;
        var approvalStatusValue = OutcomeApprovalStatus[outcome];
        var approvalStatusId = await db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.ApprovalStatus && c.Value == approvalStatusValue)
            .Select(c => c.CodeId)
            .SingleAsync(ct);

        var software = await db.Software.SingleOrDefaultAsync(s => s.SoftwareName == request.SoftwareName
            && s.VendorName == request.Vendor && s.Version == request.Version, ct);
        if (software is null)
        {
            software = new Software
            {
                SoftwareName = request.SoftwareName,
                VendorName = request.Vendor,
                Version = request.Version,
                PublisherWebsite = request.Url,
                CreatedAt = now,
            };
            db.Software.Add(software);
        }
        software.CurrentApprovalStatusId = approvalStatusId;
        software.ApprovalDate = isApproval ? today : null;
        software.ApprovalExpirationDate = isApproval ? input.ApprovalExpirationDate : null;
        software.Conditions = outcome == CodeConstants.RequestStatuses.ApprovedWithConditions
            ? Clean(input.Conditions)
            : null;
        if (input.AccessibilityRiskId.HasValue) software.AccessibilityRiskId = input.AccessibilityRiskId;
        software.UpdatedAt = now;
        request.Software = software;

        if (exception is not null)
        {
            var approved = outcome == CodeConstants.RequestStatuses.ApprovedWithConditions;
            exception.StatusId = await ExceptionStatusIdAsync(
                approved ? CodeConstants.ExceptionStatuses.Approved : CodeConstants.ExceptionStatuses.Denied, ct);
            exception.Software = software;
            exception.ApprovalDate = approved ? today : null;
            exception.ExpirationDate = approved ? input.ApprovalExpirationDate : null;
            exception.UpdatedAt = now;
        }

        await RequestWorkflow.ChangeStatusAsync(db, request, outcome, adminId, now, input.Comments, ct);
        return await SaveAsync(request, input.UpdatedAt, ct);
    }

    // ----------------------------------------------------------------------

    // A submitted request with its exception (drafts are the requester's and are "not found" here).
    private async Task<Request?> LoadAsync(int requestId, CancellationToken ct)
    {
        var request = await db.VettingRequests
            .Include(r => r.Status)
            .Include(r => r.Exception).ThenInclude(x => x!.Status)
            .SingleOrDefaultAsync(r => r.RequestId == requestId, ct);
        return request is null || request.Status.Value == CodeConstants.RequestStatuses.Draft ? null : request;
    }

    private async Task<AdminWriteResultDto> SaveAsync(Request request, DateTimeOffset loadedUpdatedAt,
        CancellationToken ct)
    {
        if (!await RequestWorkflow.SaveCheckingConcurrencyAsync(db, request, loadedUpdatedAt, ct))
            return new AdminWriteResultDto { Conflict = true };
        return new AdminWriteResultDto { Detail = await GetDetailAsync(request.RequestId, ct) };
    }

    private async Task CheckCodeAsync(AdminWriteResultDto result, string field, int? codeId, string codeType,
        CancellationToken ct)
    {
        if (codeId.HasValue
            && !await db.Codes.AnyAsync(c => c.CodeId == codeId && c.CodeType == codeType && c.IsActive, ct))
            result.Errors[field] = ["Select an active option from this list."];
    }

    private static void CheckLength(AdminWriteResultDto result, string field, string? value)
    {
        if ((value?.Trim().Length ?? 0) > MaxText) result.Errors[field] = [$"Use {MaxText} characters or fewer."];
    }

    private static AdminWriteResultDto WithError(string field, string message) =>
        new() { Errors = { [field] = [message] } };

    private Task<int> ExceptionStatusIdAsync(string value, CancellationToken ct) => db.Codes
        .Where(c => c.CodeType == CodeConstants.CodeTypes.ExceptionStatus && c.Value == value)
        .Select(c => c.CodeId)
        .SingleAsync(ct);

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
