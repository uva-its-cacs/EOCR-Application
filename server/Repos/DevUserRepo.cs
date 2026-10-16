using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Repos;

public interface IDevUserRepo
{
    Task<List<DevUserDto>> GetUsersAsync(CancellationToken ct);
    Task<bool> ExistsAsync(string email, CancellationToken ct);
}

// The users the development switcher offers (Development only; see DevUsersController).
public class DevUserRepo(EocrDbContext db) : IDevUserRepo
{
    public Task<List<DevUserDto>> GetUsersAsync(CancellationToken ct) =>
        db.Users.AsNoTracking()
            .OrderBy(u => u.Role.SortOrder).ThenBy(u => u.Name).ThenBy(u => u.UserId)
            .Select(u => new DevUserDto
            {
                UserId = u.UserId,
                Name = u.Name,
                Email = u.Email,
                RoleCode = u.Role.Value,
                RoleLabel = u.Role.Label,
            })
            .ToListAsync(ct);

    public Task<bool> ExistsAsync(string email, CancellationToken ct) =>
        db.Users.AnyAsync(u => u.Email == email, ct);
}
