namespace Eocr.Server.DTOs;

// A row in the admin review queue.
public class AdminRequestSummaryDto
{
    public int RequestId { get; set; }
    public string SoftwareName { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string RequestorName { get; set; } = string.Empty;
    public string StatusCode { get; set; } = string.Empty;
    public string StatusLabel { get; set; } = string.Empty;
    public int? AssignedReviewerId { get; set; }
    public string? AssignedReviewerName { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
