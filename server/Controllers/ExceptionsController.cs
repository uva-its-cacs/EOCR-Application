using Eocr.Server.Auth;
using Eocr.Server.DTOs;
using Eocr.Server.Repos;
using Microsoft.AspNetCore.Mvc;

namespace Eocr.Server.Controllers;

// The requester's EEAAP exception on their own request (another user's request is "not found").
[ApiController]
[Route("api/requests/{requestId:int}/exception")]
public class ExceptionsController(ICurrentUser currentUser, IExceptionRepo exceptionRepo) : ControllerBase
{
    [HttpPut]
    public async Task<ActionResult<RequestDetailDto>> Save(
        int requestId, SaveExceptionDto input, CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();

        return ToResult(await exceptionRepo.SaveAsync(user.UserId, requestId, input, ct));
    }

    [HttpPost("submit")]
    public async Task<ActionResult<RequestDetailDto>> Submit(
        int requestId, SubmitExceptionDto input, CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();

        return ToResult(await exceptionRepo.SubmitAsync(user.UserId, requestId, input, ct));
    }

    private ActionResult<RequestDetailDto> ToResult(ExceptionWriteResultDto result)
    {
        if (result.NotFound) return NotFound();
        if (result.Errors.Count > 0)
            return BadRequest(new ValidationProblemDetails(result.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Check the EEAAP fields.",
            });
        if (result.NotRequested)
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "No EEAAP is waiting on you for this request.",
                Detail = "It may already be submitted. Reload the request to see its current status.",
            });
        if (result.Conflict)
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "This EEAAP was changed somewhere else.",
                Detail = "Reload the request to see the latest version, then make your changes again.",
            });
        return Ok(result.Request);
    }
}
