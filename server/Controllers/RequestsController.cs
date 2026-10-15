using Eocr.Server.Auth;
using Eocr.Server.DTOs;
using Eocr.Server.Repos;
using Microsoft.AspNetCore.Mvc;

namespace Eocr.Server.Controllers;

[ApiController]
[Route("api/requests")]
public class RequestsController(ICurrentUser currentUser, IRequestRepo requestRepo) : ControllerBase
{
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null)
            return Unauthorized();

        var requests = await requestRepo.GetMyRequestsAsync(user.UserId, ct);
        return Ok(requests);
    }

    // Users only ever see their own requests: another user's request is "not found".
    [HttpGet("{requestId:int}")]
    public async Task<ActionResult<RequestDetailDto>> Get(int requestId, CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();

        var request = await requestRepo.GetMyRequestAsync(user.UserId, requestId, ct);
        return request is null ? NotFound() : Ok(request);
    }

    [HttpPost]
    public async Task<ActionResult<RequestDetailDto>> Create(SaveRequestDto input, CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();

        var result = await requestRepo.CreateDraftAsync(user.UserId, input, ct);
        if (ToError(result) is { } error) return error;
        return CreatedAtAction(nameof(Get), new { requestId = result.Request!.RequestId }, result.Request);
    }

    [HttpPut("{requestId:int}")]
    public async Task<ActionResult<RequestDetailDto>> Update(
        int requestId, SaveRequestDto input, CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();

        var result = await requestRepo.UpdateDraftAsync(user.UserId, requestId, input, ct);
        return ToError(result) ?? Ok(result.Request);
    }

    [HttpPost("{requestId:int}/submit")]
    public async Task<ActionResult<RequestDetailDto>> Submit(
        int requestId, SubmitRequestDto input, CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return Unauthorized();

        var result = await requestRepo.SubmitAsync(user.UserId, requestId, input, ct);
        return ToError(result) ?? Ok(result.Request);
    }

    private ActionResult? ToError(RequestWriteResultDto result)
    {
        if (result.NotFound) return NotFound();
        if (result.Errors.Count > 0)
            return BadRequest(new ValidationProblemDetails(result.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Check the request fields.",
            });
        if (result.NotDraft)
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "This request has already been submitted.",
                Detail = "Submitted requests can no longer be edited.",
            });
        if (result.Conflict)
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "This request was changed somewhere else.",
                Detail = "Reload the request to see the latest version, then make your changes again.",
            });
        return null;
    }
}
