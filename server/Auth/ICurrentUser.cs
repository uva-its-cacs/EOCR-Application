using Eocr.Server.Data.Entities;

namespace Eocr.Server.Auth;

public sealed record CurrentUserContext(int Id, UserRole Role);

public interface ICurrentUser
{
    Task<CurrentUserContext?> GetAsync(CancellationToken ct = default);
}
