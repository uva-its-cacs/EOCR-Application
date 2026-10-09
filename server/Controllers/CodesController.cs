using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Eocr.Server.Repos;
using Microsoft.AspNetCore.Mvc;

namespace Eocr.Server.Controllers;

[ApiController]
[Route("api/codes")]
public class CodesController(ICurrentUser currentUser, ICodeRepo codeRepo) : ControllerBase
{
    [HttpGet("{codeType}")]
    public async Task<ActionResult<List<CodeDto>>> GetOptions(string codeType, CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();
        if (user.RoleCode != CodeConstants.UserRoles.Admin)
            return StatusCode(StatusCodes.Status403Forbidden);

        var options = await codeRepo.GetOptionsAsync(codeType, ct);
        return options is null ? NotFound() : Ok(options);
    }
}
