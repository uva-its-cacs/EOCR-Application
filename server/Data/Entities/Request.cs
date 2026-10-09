namespace Eocr.Server.Data.Entities;

public class Request
{
    public int RequestId { get; set; }
    public int RequestorId { get; set; }
    public User Requestor { get; set; } = null!;
    public string SoftwareName { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public int StatusId { get; set; }
    public Code Status { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
