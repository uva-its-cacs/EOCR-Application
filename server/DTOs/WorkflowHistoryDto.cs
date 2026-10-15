namespace Eocr.Server.DTOs;

public class WorkflowHistoryDto
{
    public int WorkflowHistoryId { get; set; }
    public string? PreviousStatusCode { get; set; }
    public string? PreviousStatusLabel { get; set; }
    public string NewStatusCode { get; set; } = string.Empty;
    public string NewStatusLabel { get; set; } = string.Empty;
    public string ChangedByName { get; set; } = string.Empty;
    public DateTimeOffset ChangedAt { get; set; }
    public string? Comments { get; set; }
}
