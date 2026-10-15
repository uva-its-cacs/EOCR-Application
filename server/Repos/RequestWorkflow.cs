using Eocr.Server.Data;
using Eocr.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Repos;

// The request workflow rules shared by the repos: which admin moves are allowed from each status, and the
// one way to change a request's status (it always writes a Workflow History record).
public static class RequestWorkflow
{
    public static class Actions
    {
        public const string StartAiReview = "start-ai-review";
        public const string StartReview = "start-review";
        public const string RequestInfo = "request-info";
        public const string SendForEeaap = "send-for-eeaap";
        public const string Decide = "decide";
        // Not status moves: who reviews the request, and saving the review form.
        public const string Assign = "assign";
        public const string SaveReview = "save-review";
    }

    // Admin actions by current status (RequestStatus values). "More info needed" and "Awaiting EEAAP" wait
    // on the requester, who resubmits the request (RequestRepo.SubmitAsync) or submits the EEAAP
    // (ExceptionRepo.SubmitAsync); both move it back to human review, where it is decided. Drafts and
    // decided requests allow nothing.
    private static readonly Dictionary<string, string[]> AdminMoves = new()
    {
        [CodeConstants.RequestStatuses.Submitted] = [Actions.Assign, Actions.StartAiReview, Actions.StartReview],
        [CodeConstants.RequestStatuses.AiReview] = [Actions.Assign, Actions.SaveReview, Actions.StartReview],
        [CodeConstants.RequestStatuses.HumanReview] =
            [Actions.Assign, Actions.SaveReview, Actions.RequestInfo, Actions.SendForEeaap, Actions.Decide],
        [CodeConstants.RequestStatuses.MoreInfoNeeded] = [Actions.Assign],
        [CodeConstants.RequestStatuses.AwaitingEeaap] = [Actions.Assign, Actions.SaveReview, Actions.StartReview],
    };

    public static IReadOnlyList<string> AllowedActions(string statusValue) =>
        AdminMoves.TryGetValue(statusValue, out var actions) ? actions : [];

    public static bool IsAllowed(string statusValue, string action) =>
        AllowedActions(statusValue).Contains(action);

    // The status a move leads to (the decision's status comes from its outcome).
    public static string? TargetStatus(string action) => action switch
    {
        Actions.StartAiReview => CodeConstants.RequestStatuses.AiReview,
        Actions.StartReview => CodeConstants.RequestStatuses.HumanReview,
        Actions.RequestInfo => CodeConstants.RequestStatuses.MoreInfoNeeded,
        Actions.SendForEeaap => CodeConstants.RequestStatuses.AwaitingEeaap,
        _ => null,
    };

    // The only way to change a request's status: it always writes the history record.
    public static async Task ChangeStatusAsync(EocrDbContext db, Request request, string newStatusValue,
        int changedById, DateTimeOffset now, string? comments, CancellationToken ct)
    {
        var previousId = request.StatusId;
        var newId = await StatusIdAsync(db, newStatusValue, ct);
        request.StatusId = newId;
        request.UpdatedAt = now;
        AddHistory(db, request, previousId, newId, changedById, now, comments);
    }

    public static void AddHistory(EocrDbContext db, Request request, int? previousStatusId, int newStatusId,
        int changedById, DateTimeOffset now, string? comments)
    {
        db.WorkflowHistory.Add(new WorkflowHistory
        {
            Request = request,
            PreviousStatusId = previousStatusId,
            NewStatusId = newStatusId,
            ChangedById = changedById,
            ChangedAt = now,
            Comments = string.IsNullOrWhiteSpace(comments) ? null : comments.Trim(),
        });
    }

    public static Task<int> StatusIdAsync(EocrDbContext db, string value, CancellationToken ct) => db.Codes
        .Where(c => c.CodeType == CodeConstants.CodeTypes.RequestStatus && c.Value == value)
        .Select(c => c.CodeId)
        .SingleAsync(ct);

    // Saves only if no one else changed the request since it was loaded (UpdatedAt is its concurrency
    // token).
    public static async Task<bool> SaveCheckingConcurrencyAsync(EocrDbContext db, Request request,
        DateTimeOffset loadedUpdatedAt, CancellationToken ct)
    {
        db.Entry(request).Property(r => r.UpdatedAt).OriginalValue = loadedUpdatedAt;
        db.Entry(request).Property(r => r.UpdatedAt).IsModified = true;
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
}
