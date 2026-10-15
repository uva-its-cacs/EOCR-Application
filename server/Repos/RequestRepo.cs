using System.Linq.Expressions;
using Eocr.Server.Data;
using Eocr.Server.Data.Entities;
using Eocr.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Repos;

public interface IRequestRepo
{
    Task<IEnumerable<RequestSummaryDto>> GetMyRequestsAsync(int requestorId, CancellationToken ct);
    Task<RequestDetailDto?> GetMyRequestAsync(int requestorId, int requestId, CancellationToken ct);
    Task<RequestWriteResultDto> CreateDraftAsync(int requestorId, SaveRequestDto input, CancellationToken ct);
    Task<RequestWriteResultDto> UpdateDraftAsync(
        int requestorId, int requestId, SaveRequestDto input, CancellationToken ct);
    Task<RequestWriteResultDto> SubmitAsync(
        int requestorId, int requestId, SubmitRequestDto input, CancellationToken ct);
}

public class RequestRepo(EocrDbContext db) : IRequestRepo
{
    // The request as its details page shows it (shared with the admin review page).
    public static readonly Expression<Func<Request, RequestDetailDto>> DetailProjection = r => new RequestDetailDto
    {
        RequestId = r.RequestId,
        SoftwareName = r.SoftwareName,
        Vendor = r.Vendor,
        Version = r.Version,
        Department = r.Department,
        BusinessNeed = r.BusinessNeed,
        FundingSourceId = r.FundingSourceId,
        FundingSourceCode = r.FundingSource == null ? null : r.FundingSource.Value,
        FundingSourceLabel = r.FundingSource == null ? null : r.FundingSource.Label,
        Url = r.Url,
        VpatSubmitted = r.VpatSubmitted,
        SoftwareId = r.SoftwareId,
        StatusCode = r.Status.Value,
        StatusLabel = r.Status.Label,
        SubmittedAt = r.SubmittedAt,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt,
        History = r.History
            .OrderBy(h => h.ChangedAt)
            .ThenBy(h => h.WorkflowHistoryId)
            .Select(h => new WorkflowHistoryDto
            {
                WorkflowHistoryId = h.WorkflowHistoryId,
                PreviousStatusCode = h.PreviousStatus == null ? null : h.PreviousStatus.Value,
                PreviousStatusLabel = h.PreviousStatus == null ? null : h.PreviousStatus.Label,
                NewStatusCode = h.NewStatus.Value,
                NewStatusLabel = h.NewStatus.Label,
                ChangedByName = h.ChangedBy.Name,
                ChangedAt = h.ChangedAt,
                Comments = h.Comments,
            })
            .ToList(),
        Exception = r.Exception == null ? null : new ExceptionDto
        {
            ExceptionId = r.Exception.ExceptionId,
            StatusCode = r.Exception.Status.Value,
            StatusLabel = r.Exception.Status.Label,
            BusinessJustification = r.Exception.BusinessJustification,
            AccessibilityImpact = r.Exception.AccessibilityImpact,
            MitigationPlan = r.Exception.MitigationPlan,
            SubmittedAt = r.Exception.SubmittedAt,
            ApprovalDate = r.Exception.ApprovalDate,
            ExpirationDate = r.Exception.ExpirationDate,
            UpdatedAt = r.Exception.UpdatedAt,
        },
    };

    // The requester can edit a request while it is a draft or when the reviewer asked for more information.
    private static bool IsEditable(string statusValue) =>
        statusValue is CodeConstants.RequestStatuses.Draft or CodeConstants.RequestStatuses.MoreInfoNeeded;

    public async Task<IEnumerable<RequestSummaryDto>> GetMyRequestsAsync(
        int requestorId,
        CancellationToken ct)
    {
        return await db.VettingRequests
            .Where(r => r.RequestorId == requestorId)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => new RequestSummaryDto
            {
                RequestId = r.RequestId,
                SoftwareName = r.SoftwareName,
                Vendor = r.Vendor,
                Version = r.Version,
                StatusCode = r.Status.Value,
                StatusLabel = r.Status.Label,
                UpdatedAt = r.UpdatedAt,
            })
            .ToListAsync(ct);
    }

    // Only the requestor's own request (anything else is "not found" to the caller).
    public async Task<RequestDetailDto?> GetMyRequestAsync(
        int requestorId, int requestId, CancellationToken ct)
    {
        return await db.VettingRequests.AsNoTracking()
            .Where(r => r.RequestId == requestId && r.RequestorId == requestorId)
            .Select(DetailProjection)
            .SingleOrDefaultAsync(ct);
    }

    public async Task<RequestWriteResultDto> CreateDraftAsync(
        int requestorId, SaveRequestDto input, CancellationToken ct)
    {
        var result = new RequestWriteResultDto();
        await ValidateDraftAsync(input, result, ct);
        if (result.Errors.Count > 0) return result;

        var now = DateTimeOffset.UtcNow;
        var draftId = await RequestWorkflow.StatusIdAsync(db, CodeConstants.RequestStatuses.Draft, ct);
        var request = new Request
        {
            RequestorId = requestorId,
            StatusId = draftId,
            CreatedAt = now,
            UpdatedAt = now,
        };
        Apply(request, input);
        db.VettingRequests.Add(request);
        RequestWorkflow.AddHistory(db, request, null, draftId, requestorId, now, "Request started.");

        await db.SaveChangesAsync(ct);
        result.Request = await GetMyRequestAsync(requestorId, request.RequestId, ct);
        return result;
    }

    public async Task<RequestWriteResultDto> UpdateDraftAsync(
        int requestorId, int requestId, SaveRequestDto input, CancellationToken ct)
    {
        var request = await db.VettingRequests
            .Include(r => r.Status)
            .SingleOrDefaultAsync(r => r.RequestId == requestId && r.RequestorId == requestorId, ct);
        if (request is null) return new RequestWriteResultDto { NotFound = true };
        if (!IsEditable(request.Status.Value)) return new RequestWriteResultDto { NotDraft = true };
        if (input.UpdatedAt != request.UpdatedAt) return new RequestWriteResultDto { Conflict = true };

        var result = new RequestWriteResultDto();
        await ValidateDraftAsync(input, result, ct);
        if (result.Errors.Count > 0) return result;

        Apply(request, input);
        request.UpdatedAt = DateTimeOffset.UtcNow;

        if (!await RequestWorkflow.SaveCheckingConcurrencyAsync(db, request, input.UpdatedAt.Value, ct))
            return new RequestWriteResultDto { Conflict = true };

        result.Request = await GetMyRequestAsync(requestorId, requestId, ct);
        return result;
    }

    public async Task<RequestWriteResultDto> SubmitAsync(
        int requestorId, int requestId, SubmitRequestDto input, CancellationToken ct)
    {
        var request = await db.VettingRequests
            .Include(r => r.Status)
            .SingleOrDefaultAsync(r => r.RequestId == requestId && r.RequestorId == requestorId, ct);
        if (request is null) return new RequestWriteResultDto { NotFound = true };
        if (!IsEditable(request.Status.Value)) return new RequestWriteResultDto { NotDraft = true };
        if (input.UpdatedAt != request.UpdatedAt) return new RequestWriteResultDto { Conflict = true };

        // Required to submit (a draft may be saved without them).
        var result = new RequestWriteResultDto();
        if (string.IsNullOrWhiteSpace(request.SoftwareName))
            result.Errors[nameof(SaveRequestDto.SoftwareName)] = ["Enter the software name."];
        if (string.IsNullOrWhiteSpace(request.Vendor))
            result.Errors[nameof(SaveRequestDto.Vendor)] = ["Enter the vendor."];
        if (string.IsNullOrWhiteSpace(request.Version))
            result.Errors[nameof(SaveRequestDto.Version)] = ["Enter the version you need."];
        if (string.IsNullOrWhiteSpace(request.Department))
            result.Errors[nameof(SaveRequestDto.Department)] = ["Enter your department."];
        if (string.IsNullOrWhiteSpace(request.BusinessNeed))
            result.Errors[nameof(SaveRequestDto.BusinessNeed)] = ["Describe the business need."];
        if (request.FundingSourceId is null)
            result.Errors[nameof(SaveRequestDto.FundingSourceId)] = ["Select a funding source."];
        if (result.Errors.Count > 0) return result;

        // A first submission joins the queue; an answer to "more info needed" goes back to the reviewer.
        var now = DateTimeOffset.UtcNow;
        if (request.Status.Value == CodeConstants.RequestStatuses.MoreInfoNeeded)
        {
            await RequestWorkflow.ChangeStatusAsync(db, request, CodeConstants.RequestStatuses.HumanReview,
                requestorId, now, "Requester updated the request and sent it back for review.", ct);
        }
        else
        {
            await RequestWorkflow.ChangeStatusAsync(db, request, CodeConstants.RequestStatuses.Submitted,
                requestorId, now, "Request submitted for review.", ct);
            request.SubmittedAt = now;
        }

        if (!await RequestWorkflow.SaveCheckingConcurrencyAsync(db, request, input.UpdatedAt, ct))
            return new RequestWriteResultDto { Conflict = true };

        result.Request = await GetMyRequestAsync(requestorId, requestId, ct);
        return result;
    }

    // ----------------------------------------------------------------------

    private static void Apply(Request request, SaveRequestDto input)
    {
        request.SoftwareName = input.SoftwareName.Trim();
        request.Vendor = input.Vendor.Trim();
        request.Version = (input.Version ?? string.Empty).Trim();
        request.Department = input.Department.Trim();
        request.BusinessNeed = input.BusinessNeed.Trim();
        request.FundingSourceId = input.FundingSourceId;
        request.Url = string.IsNullOrWhiteSpace(input.Url) ? null : input.Url.Trim();
        request.VpatSubmitted = input.VpatSubmitted;
        request.SoftwareId = input.SoftwareId;
    }

    private async Task ValidateDraftAsync(SaveRequestDto input, RequestWriteResultDto result,
        CancellationToken ct)
    {
        var name = input.SoftwareName?.Trim() ?? string.Empty;
        if (name.Length is 0 or > 200)
            result.Errors[nameof(input.SoftwareName)] = ["Enter a software name of up to 200 characters."];
        if ((input.Vendor?.Trim().Length ?? 0) > 200)
            result.Errors[nameof(input.Vendor)] = ["Use 200 characters or fewer."];
        if ((input.Version?.Trim().Length ?? 0) > 50)
            result.Errors[nameof(input.Version)] = ["Use 50 characters or fewer."];
        if ((input.Department?.Trim().Length ?? 0) > 200)
            result.Errors[nameof(input.Department)] = ["Use 200 characters or fewer."];
        if ((input.BusinessNeed?.Trim().Length ?? 0) > 4000)
            result.Errors[nameof(input.BusinessNeed)] = ["Use 4000 characters or fewer."];

        var url = input.Url?.Trim();
        if (!string.IsNullOrEmpty(url)
            && (url.Length > 2000
                || !Uri.TryCreate(url, UriKind.Absolute, out var uri)
                || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)))
            result.Errors[nameof(input.Url)] = ["Enter a valid HTTP or HTTPS address."];

        if (input.FundingSourceId.HasValue
            && !await db.Codes.AnyAsync(c => c.CodeId == input.FundingSourceId
                && c.CodeType == CodeConstants.CodeTypes.FundingSource && c.IsActive, ct))
            result.Errors[nameof(input.FundingSourceId)] = ["Select an active option from this list."];

        if (input.SoftwareId.HasValue
            && !await db.Software.AnyAsync(s => s.SoftwareId == input.SoftwareId, ct))
            result.Errors[nameof(input.SoftwareId)] = ["Select software from the catalog."];
    }
}
