using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Eocr.Server.Repos;
using Microsoft.AspNetCore.Mvc;

namespace Eocr.Server.Controllers;

// The review queue and the review workflow. Admins only.
[ApiController]
[Route("api/admin")]
public class AdminRequestsController(ICurrentUser currentUser, IReviewRepo reviewRepo) : ControllerBase
{
    [HttpGet("requests")]
    public async Task<ActionResult<List<AdminRequestSummaryDto>>> GetQueue(CancellationToken ct)
    {
        var (_, denied) = await RequireAdminAsync(ct);
        if (denied is not null) return denied;

        return Ok(await reviewRepo.GetQueueAsync(ct));
    }

    [HttpGet("requests/{requestId:int}")]
    public async Task<ActionResult<AdminRequestDetailDto>> Get(int requestId, CancellationToken ct)
    {
        var (_, denied) = await RequireAdminAsync(ct);
        if (denied is not null) return denied;

        var detail = await reviewRepo.GetDetailAsync(requestId, ct);
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpGet("reviewers")]
    public async Task<ActionResult<List<ReviewerOptionDto>>> GetReviewers(CancellationToken ct)
    {
        var (_, denied) = await RequireAdminAsync(ct);
        if (denied is not null) return denied;

        return Ok(await reviewRepo.GetReviewersAsync(ct));
    }

    [HttpPost("requests/{requestId:int}/assign")]
    public async Task<ActionResult<AdminRequestDetailDto>> Assign(
        int requestId, AssignRequestDto input, CancellationToken ct)
    {
        var (adminId, denied) = await RequireAdminAsync(ct);
        if (denied is not null) return denied;

        return ToResult(await reviewRepo.AssignAsync(adminId, requestId, input, ct));
    }

    [HttpPut("requests/{requestId:int}/review")]
    public async Task<ActionResult<AdminRequestDetailDto>> SaveReview(
        int requestId, SaveReviewDto input, CancellationToken ct)
    {
        var (adminId, denied) = await RequireAdminAsync(ct);
        if (denied is not null) return denied;

        return ToResult(await reviewRepo.SaveReviewAsync(adminId, requestId, input, ct));
    }

    [HttpPost("requests/{requestId:int}/start-ai-review")]
    public Task<ActionResult<AdminRequestDetailDto>> StartAiReview(
        int requestId, RequestActionDto input, CancellationToken ct) =>
        MoveAsync(requestId, RequestWorkflow.Actions.StartAiReview, input, ct);

    [HttpPost("requests/{requestId:int}/start-review")]
    public Task<ActionResult<AdminRequestDetailDto>> StartReview(
        int requestId, RequestActionDto input, CancellationToken ct) =>
        MoveAsync(requestId, RequestWorkflow.Actions.StartReview, input, ct);

    [HttpPost("requests/{requestId:int}/request-info")]
    public Task<ActionResult<AdminRequestDetailDto>> RequestInfo(
        int requestId, RequestActionDto input, CancellationToken ct) =>
        MoveAsync(requestId, RequestWorkflow.Actions.RequestInfo, input, ct);

    [HttpPost("requests/{requestId:int}/send-for-eeaap")]
    public Task<ActionResult<AdminRequestDetailDto>> SendForEeaap(
        int requestId, RequestActionDto input, CancellationToken ct) =>
        MoveAsync(requestId, RequestWorkflow.Actions.SendForEeaap, input, ct);

    [HttpPost("requests/{requestId:int}/decide")]
    public async Task<ActionResult<AdminRequestDetailDto>> Decide(
        int requestId, DecideRequestDto input, CancellationToken ct)
    {
        var (adminId, denied) = await RequireAdminAsync(ct);
        if (denied is not null) return denied;

        return ToResult(await reviewRepo.DecideAsync(adminId, requestId, input, ct));
    }

    // ----------------------------------------------------------------------

    private async Task<ActionResult<AdminRequestDetailDto>> MoveAsync(
        int requestId, string action, RequestActionDto input, CancellationToken ct)
    {
        var (adminId, denied) = await RequireAdminAsync(ct);
        if (denied is not null) return denied;

        return ToResult(await reviewRepo.MoveAsync(adminId, requestId, action, input, ct));
    }

    // The caller's user ID, or the 401/403 to return instead.
    private async Task<(int AdminId, ActionResult? Denied)> RequireAdminAsync(CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return (0, Unauthorized());
        if (user.RoleCode != CodeConstants.UserRoles.Admin)
            return (0, StatusCode(StatusCodes.Status403Forbidden));
        return (user.UserId, null);
    }

    private ActionResult<AdminRequestDetailDto> ToResult(AdminWriteResultDto result)
    {
        if (result.NotFound) return NotFound();
        if (result.Errors.Count > 0)
            return BadRequest(new ValidationProblemDetails(result.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Check the review fields.",
            });
        if (result.InvalidTransition)
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "This step is not available for the request's current status.",
                Detail = "Reload the request to see its current status.",
            });
        if (result.Conflict)
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "This request was changed by someone else.",
                Detail = "Reload the request to see the latest version, then try again.",
            });
        return Ok(result.Detail);
    }
}
