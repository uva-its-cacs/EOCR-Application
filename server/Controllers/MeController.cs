using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Controllers;

[ApiController]
[Route("api/me")]
public class MeController(ICurrentUser currentUser, EocrDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var ctx = await currentUser.GetAsync(ct);
        if (ctx is null)
            return Unauthorized();

        var dto = await db.Users
            .Where(u => u.UserId == ctx.UserId)
            .Select(u => new MeDto
            {
                UserId = u.UserId,
                Name = u.Name,
                Email = u.Email,
                RoleCode = u.Role.Value,
                RoleLabel = u.Role.Label,
            })
            .FirstOrDefaultAsync(ct);

        return dto is null ? Unauthorized() : Ok(dto);
    }
}
