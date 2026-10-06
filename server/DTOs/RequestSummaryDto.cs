namespace Eocr.Server.DTOs;

public class RequestSummaryDto
{
    public int RequestId { get; set; }
    public string SoftwareName { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string StatusCode { get; set; } = string.Empty;
    public string StatusLabel { get; set; } = string.Empty;
    public DateTimeOffset UpdatedAt { get; set; }
}
