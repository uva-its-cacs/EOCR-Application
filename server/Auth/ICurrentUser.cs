namespace Eocr.Server.Auth;

public class CurrentUserContext
{
    public int UserId { get; set; }
    public string RoleCode { get; set; } = string.Empty;
}

public interface ICurrentUser
{
    Task<CurrentUserContext?> GetAsync(CancellationToken ct = default);
}
