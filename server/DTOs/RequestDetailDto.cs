namespace Eocr.Server.DTOs;

public class RequestDetailDto
{
    public int RequestId { get; set; }
    // Computed, not stored.
    public string Title => string.IsNullOrWhiteSpace(Vendor) ? SoftwareName : $"{SoftwareName} ({Vendor})";
    public string SoftwareName { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string BusinessNeed { get; set; } = string.Empty;
    public int? FundingSourceId { get; set; }
    public string? FundingSourceCode { get; set; }
    public string? FundingSourceLabel { get; set; }
    public string? Url { get; set; }
    public bool VpatSubmitted { get; set; }
    public int? SoftwareId { get; set; }
    public string StatusCode { get; set; } = string.Empty;
    public string StatusLabel { get; set; } = string.Empty;
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<WorkflowHistoryDto> History { get; set; } = [];
}
