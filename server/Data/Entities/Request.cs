namespace Eocr.Server.Data.Entities;

public class Request
{
    public int RequestId { get; set; }
    public int RequestorId { get; set; }
    public User Requestor { get; set; } = null!;
    public string SoftwareName { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string BusinessNeed { get; set; } = string.Empty;
    public int? FundingSourceId { get; set; }
    public Code? FundingSource { get; set; }
    public string? Url { get; set; }
    public bool VpatSubmitted { get; set; }
    // Set when the request is for software already in the catalog (chosen during intake).
    public int? SoftwareId { get; set; }
    public Software? Software { get; set; }
    public int? AssignedReviewerId { get; set; }
    public User? AssignedReviewer { get; set; }
    public Review? Review { get; set; }
    public AccessibilityException? Exception { get; set; }
    public int StatusId { get; set; }
    public Code Status { get; set; } = null!;
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<WorkflowHistory> History { get; set; } = [];
}
