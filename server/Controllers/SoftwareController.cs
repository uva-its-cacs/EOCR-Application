using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Eocr.Server.Repos;
using Microsoft.AspNetCore.Mvc;

namespace Eocr.Server.Controllers;

[ApiController]
[Route("api/software")]
public class SoftwareController(ICurrentUser currentUser, ISoftwareRepo softwareRepo) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<SoftwareDto>>> GetAll(CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();
        if (user.RoleCode != CodeConstants.UserRoles.Admin)
            return StatusCode(StatusCodes.Status403Forbidden);

        return Ok(await softwareRepo.GetAllAsync(ct));
    }

    [HttpGet("owners")]
    public async Task<ActionResult<List<SoftwareOwnerOptionDto>>> GetOwners(CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();
        if (user.RoleCode != CodeConstants.UserRoles.Admin)
            return StatusCode(StatusCodes.Status403Forbidden);

        return Ok(await softwareRepo.GetOwnersAsync(ct));
    }

    [HttpPut("{softwareId:int}")]
    public async Task<ActionResult<SoftwareDto>> Update(
        int softwareId, UpdateSoftwareDto input, CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();
        if (user.RoleCode != CodeConstants.UserRoles.Admin)
            return StatusCode(StatusCodes.Status403Forbidden);

        var result = await softwareRepo.UpdateAsync(softwareId, input, ct);
        if (result.NotFound) return NotFound();
        if (result.Errors.Count > 0)
            return BadRequest(new ValidationProblemDetails(result.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Check the software fields.",
            });
        if (result.Conflict)
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "This software was changed by another administrator.",
                Detail = "Cancel, refresh the list, and reopen the editor before saving.",
            });

        return Ok(result.Software);
    }
}
