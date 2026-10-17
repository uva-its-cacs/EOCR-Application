using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Eocr.Server.Repos;
using Microsoft.AspNetCore.Mvc;

namespace Eocr.Server.Controllers;

// The review queue and the review workflow. Staff read (Admin, SysAdmin, SuperAdmin); only SysAdmin and
// SuperAdmin change anything (see Auth/Roles.cs).
[ApiController]
[Route("api/admin")]
public class AdminRequestsController(ICurrentUser currentUser, IReviewRepo reviewRepo) : ControllerBase
{
    [HttpGet("requests")]
    public async Task<ActionResult<List<AdminRequestSummaryDto>>> GetQueue(CancellationToken ct)
    {
        var (_, _, denied) = await RequireStaffAsync(ct);
        if (denied is not null) return denied;

        return Ok(await reviewRepo.GetQueueAsync(ct));
    }

    [HttpGet("requests/{requestId:int}")]
    public async Task<ActionResult<AdminRequestDetailDto>> Get(int requestId, CancellationToken ct)
    {
        var (_, canWrite, denied) = await RequireStaffAsync(ct);
        if (denied is not null) return denied;

        var detail = await reviewRepo.GetDetailAsync(requestId, ct);
        if (detail is null) return NotFound();

        // A read-only Admin sees the request but is offered no workflow steps.
        if (!canWrite) detail.AllowedActions = [];
        return Ok(detail);
    }

    [HttpGet("reviewers")]
    public async Task<ActionResult<List<ReviewerOptionDto>>> GetReviewers(CancellationToken ct)
    {
        var (_, _, denied) = await RequireStaffAsync(ct);
        if (denied is not null) return denied;

        return Ok(await reviewRepo.GetReviewersAsync(ct));
    }

    [HttpPost("requests/{requestId:int}/assign")]
    public async Task<ActionResult<AdminRequestDetailDto>> Assign(
        int requestId, AssignRequestDto input, CancellationToken ct)
    {
        var (adminId, denied) = await RequireWriterAsync(ct);
        if (denied is not null) return denied;

        return ToResult(await reviewRepo.AssignAsync(adminId, requestId, input, ct));
    }

    [HttpPut("requests/{requestId:int}/review")]
    public async Task<ActionResult<AdminRequestDetailDto>> SaveReview(
        int requestId, SaveReviewDto input, CancellationToken ct)
    {
        var (adminId, denied) = await RequireWriterAsync(ct);
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
        var (adminId, denied) = await RequireWriterAsync(ct);
        if (denied is not null) return denied;

        return ToResult(await reviewRepo.DecideAsync(adminId, requestId, input, ct));
    }

    // ----------------------------------------------------------------------

    private async Task<ActionResult<AdminRequestDetailDto>> MoveAsync(
        int requestId, string action, RequestActionDto input, CancellationToken ct)
    {
        var (adminId, denied) = await RequireWriterAsync(ct);
        if (denied is not null) return denied;

        return ToResult(await reviewRepo.MoveAsync(adminId, requestId, action, input, ct));
    }

    // Staff (Admin, SysAdmin, SuperAdmin) may read. Returns the caller's user ID and whether they may write,
    // or the 401/403 to return instead.
    private async Task<(int AdminId, bool CanWrite, ActionResult? Denied)> RequireStaffAsync(CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null) return (0, false, Unauthorized());
        if (!Roles.IsStaff(user.RoleCode))
            return (0, false, StatusCode(StatusCodes.Status403Forbidden));
        return (user.UserId, Roles.CanWrite(user.RoleCode), null);
    }

    // Only SysAdmin and SuperAdmin may change data or run the workflow; a read-only Admin gets 403.
    private async Task<(int AdminId, ActionResult? Denied)> RequireWriterAsync(CancellationToken ct)
    {
        var (userId, canWrite, denied) = await RequireStaffAsync(ct);
        if (denied is not null) return (0, denied);
        if (!canWrite) return (0, StatusCode(StatusCodes.Status403Forbidden));
        return (userId, null);
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
