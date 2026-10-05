namespace Eocr.Server.Data.Entities;

public sealed class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public ICollection<VettingRequest> VettingRequests { get; set; } = [];
}
