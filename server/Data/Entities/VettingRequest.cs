namespace Eocr.Server.Data.Entities;

public sealed class VettingRequest
{
    public int Id { get; set; }
    public int RequestorId { get; set; }
    public User Requestor { get; set; } = null!;
    public string SoftwareName { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public RequestStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
