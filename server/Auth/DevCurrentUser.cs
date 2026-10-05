using Eocr.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Auth;

public class DevCurrentUser : ICurrentUser
{
    private readonly EocrDbContext _db;
    private readonly string _email;

    public DevCurrentUser(EocrDbContext db, IConfiguration config)
    {
        _db = db;
        _email = config["DevAuth:Email"]
            ?? throw new InvalidOperationException("DevAuth:Email is not configured.");
    }

    public async Task<CurrentUserContext?> GetAsync(CancellationToken ct = default)
    {
        var user = await _db.Users
            .Where(u => u.Email == _email)
            .Select(u => new { u.Id, RoleCode = u.Role.Value })
            .FirstOrDefaultAsync(ct);

        return user is null
            ? null
            : new CurrentUserContext { Id = user.Id, RoleCode = user.RoleCode };
    }
}
