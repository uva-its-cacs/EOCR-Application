namespace Eocr.Server.DTOs;

// Intake fields for creating or updating a draft. A draft needs only a software name; the rest is
// checked on submit. UpdatedAt is required on update (stale values answer 409).
public class SaveRequestDto
{
    public string SoftwareName { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string BusinessNeed { get; set; } = string.Empty;
    public int? FundingSourceId { get; set; }
    public string? Url { get; set; }
    public bool VpatSubmitted { get; set; }
    public int? SoftwareId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
