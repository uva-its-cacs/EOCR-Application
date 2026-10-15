using Eocr.Server.Data;
using Eocr.Server.Data.Entities;
using Eocr.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Repos;

public interface IExceptionRepo
{
    Task<ExceptionWriteResultDto> SaveAsync(
        int requestorId, int requestId, SaveExceptionDto input, CancellationToken ct);
    Task<ExceptionWriteResultDto> SubmitAsync(
        int requestorId, int requestId, SubmitExceptionDto input, CancellationToken ct);
}

// The requester's side of an EEAAP exception: writing the plan the reviewer asked for and submitting it.
// Only the requester's own request, and only while the plan is waiting on them.
public class ExceptionRepo(EocrDbContext db, IRequestRepo requestRepo) : IExceptionRepo
{
    private const int MaxText = 4000;

    public async Task<ExceptionWriteResultDto> SaveAsync(
        int requestorId, int requestId, SaveExceptionDto input, CancellationToken ct)
    {
        var (exception, failure) = await LoadRequestedAsync(requestorId, requestId, input.UpdatedAt, ct);
        if (failure is not null) return failure;

        var result = new ExceptionWriteResultDto();
        CheckLength(result, nameof(input.BusinessJustification), input.BusinessJustification);
        CheckLength(result, nameof(input.AccessibilityImpact), input.AccessibilityImpact);
        CheckLength(result, nameof(input.MitigationPlan), input.MitigationPlan);
        if (result.Errors.Count > 0) return result;

        exception!.BusinessJustification = Clean(input.BusinessJustification);
        exception.AccessibilityImpact = Clean(input.AccessibilityImpact);
        exception.MitigationPlan = Clean(input.MitigationPlan);
        exception.UpdatedAt = DateTimeOffset.UtcNow;

        if (!await SaveCheckingConcurrencyAsync(exception, input.UpdatedAt, ct))
            return new ExceptionWriteResultDto { Conflict = true };
        result.Request = await requestRepo.GetMyRequestAsync(requestorId, requestId, ct);
        return result;
    }

    // Submits the saved plan: the exception waits on the decision and the request goes back to the
    // reviewer (a status change, so it writes history).
    public async Task<ExceptionWriteResultDto> SubmitAsync(
        int requestorId, int requestId, SubmitExceptionDto input, CancellationToken ct)
    {
        var (exception, failure) = await LoadRequestedAsync(requestorId, requestId, input.UpdatedAt, ct);
        if (failure is not null) return failure;

        var result = new ExceptionWriteResultDto();
        if (string.IsNullOrWhiteSpace(exception!.BusinessJustification))
            result.Errors[nameof(SaveExceptionDto.BusinessJustification)] = ["Explain why your team needs this software."];
        if (string.IsNullOrWhiteSpace(exception.AccessibilityImpact))
            result.Errors[nameof(SaveExceptionDto.AccessibilityImpact)] = ["Describe who is affected and how."];
        if (string.IsNullOrWhiteSpace(exception.MitigationPlan))
            result.Errors[nameof(SaveExceptionDto.MitigationPlan)] = ["Describe how people will get equally effective access."];
        if (result.Errors.Count > 0) return result;

        var now = DateTimeOffset.UtcNow;
        exception.StatusId = await ExceptionStatusIdAsync(CodeConstants.ExceptionStatuses.Submitted, ct);
        exception.SubmittedAt = now;
        exception.UpdatedAt = now;
        await RequestWorkflow.ChangeStatusAsync(db, exception.Request, CodeConstants.RequestStatuses.HumanReview,
            requestorId, now, "EEAAP submitted for review.", ct);

        if (!await SaveCheckingConcurrencyAsync(exception, input.UpdatedAt, ct))
            return new ExceptionWriteResultDto { Conflict = true };
        result.Request = await requestRepo.GetMyRequestAsync(requestorId, requestId, ct);
        return result;
    }

    // ----------------------------------------------------------------------

    // The requester's exception, if it is waiting on them; otherwise the result to return.
    private async Task<(AccessibilityException?, ExceptionWriteResultDto?)> LoadRequestedAsync(
        int requestorId, int requestId, DateTimeOffset updatedAt, CancellationToken ct)
    {
        var request = await db.VettingRequests
            .Include(r => r.Status)
            .Include(r => r.Exception).ThenInclude(x => x!.Status)
            .SingleOrDefaultAsync(r => r.RequestId == requestId && r.RequestorId == requestorId, ct);
        if (request is null) return (null, new ExceptionWriteResultDto { NotFound = true });
        var exception = request.Exception;
        if (exception is null
            || request.Status.Value != CodeConstants.RequestStatuses.AwaitingEeaap
            || exception.Status.Value != CodeConstants.ExceptionStatuses.Requested)
            return (null, new ExceptionWriteResultDto { NotRequested = true });
        if (updatedAt != exception.UpdatedAt) return (null, new ExceptionWriteResultDto { Conflict = true });
        return (exception, null);
    }

    private async Task<bool> SaveCheckingConcurrencyAsync(AccessibilityException exception,
        DateTimeOffset loadedUpdatedAt, CancellationToken ct)
    {
        db.Entry(exception).Property(x => x.UpdatedAt).OriginalValue = loadedUpdatedAt;
        try
        {
            await db.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }

    private Task<int> ExceptionStatusIdAsync(string value, CancellationToken ct) => db.Codes
        .Where(c => c.CodeType == CodeConstants.CodeTypes.ExceptionStatus && c.Value == value)
        .Select(c => c.CodeId)
        .SingleAsync(ct);

    private static void CheckLength(ExceptionWriteResultDto result, string field, string? value)
    {
        if ((value?.Trim().Length ?? 0) > MaxText) result.Errors[field] = [$"Use {MaxText} characters or fewer."];
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
