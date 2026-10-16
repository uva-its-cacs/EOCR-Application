using Eocr.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Auth;

// Development stand-in for real sign-in. Acts as the user named by the development switcher's cookie
// (only in Development, and only when it names an existing user), otherwise as DevAuth:Email.
public class DevCurrentUser : ICurrentUser
{
    // Set by DevUsersController; read here.
    public const string SwitchCookie = "eocr-dev-user";

    private readonly EocrDbContext _db;
    private readonly string _defaultEmail;
    private readonly string? _switchedEmail;

    public DevCurrentUser(EocrDbContext db, IConfiguration config, IHttpContextAccessor http,
        IWebHostEnvironment env)
    {
        _db = db;
        _defaultEmail = config["DevAuth:Email"]
            ?? throw new InvalidOperationException("DevAuth:Email is not configured.");
        _switchedEmail = env.IsDevelopment() ? http.HttpContext?.Request.Cookies[SwitchCookie] : null;
    }

    public async Task<CurrentUserContext?> GetAsync(CancellationToken ct = default)
    {
        if (!string.IsNullOrWhiteSpace(_switchedEmail))
        {
            var switched = await FindAsync(_switchedEmail, ct);
            if (switched is not null) return switched;
        }
        return await FindAsync(_defaultEmail, ct);
    }

    private async Task<CurrentUserContext?> FindAsync(string email, CancellationToken ct)
    {
        var user = await _db.Users
            .Where(u => u.Email == email)
            .Select(u => new { u.UserId, RoleCode = u.Role.Value })
            .FirstOrDefaultAsync(ct);

        return user is null
            ? null
            : new CurrentUserContext { UserId = user.UserId, RoleCode = user.RoleCode };
    }
}
