namespace Eocr.Server.Data.Entities;

// One record per request status change (written only by the repo layer).
public class WorkflowHistory
{
    public int WorkflowHistoryId { get; set; }
    public int RequestId { get; set; }
    public Request Request { get; set; } = null!;
    // Null for the record that creates the request.
    public int? PreviousStatusId { get; set; }
    public Code? PreviousStatus { get; set; }
    public int NewStatusId { get; set; }
    public Code NewStatus { get; set; } = null!;
    public int ChangedById { get; set; }
    public User ChangedBy { get; set; } = null!;
    public DateTimeOffset ChangedAt { get; set; }
    public string? Comments { get; set; }
}
