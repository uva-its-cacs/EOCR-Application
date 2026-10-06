namespace Eocr.Server.Data.Entities;

public class User
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public Code Role { get; set; } = null!;
    public ICollection<Request> VettingRequests { get; set; } = [];
}
