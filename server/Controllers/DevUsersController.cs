using Eocr.Server.Auth;
using Eocr.Server.DTOs;
using Eocr.Server.Repos;
using Microsoft.AspNetCore.Mvc;

namespace Eocr.Server.Controllers;

// The development user switcher: list the seeded users and choose which one DevCurrentUser acts as
// (a cookie). Every action is "not found" outside Development.
[ApiController]
[Route("api/dev/users")]
public class DevUsersController(IWebHostEnvironment env, IDevUserRepo devUserRepo) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<DevUserDto>>> GetUsers(CancellationToken ct)
    {
        if (!env.IsDevelopment()) return NotFound();
        return Ok(await devUserRepo.GetUsersAsync(ct));
    }

    [HttpPost("switch")]
    public async Task<IActionResult> Switch(SwitchDevUserDto input, CancellationToken ct)
    {
        if (!env.IsDevelopment()) return NotFound();

        var email = input.Email?.Trim() ?? string.Empty;
        if (email.Length == 0 || !await devUserRepo.ExistsAsync(email, ct))
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(input.Email)] = ["Choose one of the seeded users."],
            })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Unknown user.",
            });

        Response.Cookies.Append(DevCurrentUser.SwitchCookie, email, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            IsEssential = true,
        });
        return NoContent();
    }

    // Back to DevAuth:Email.
    [HttpDelete("switch")]
    public IActionResult Reset()
    {
        if (!env.IsDevelopment()) return NotFound();
        Response.Cookies.Delete(DevCurrentUser.SwitchCookie, new CookieOptions { Path = "/" });
        return NoContent();
    }
}
