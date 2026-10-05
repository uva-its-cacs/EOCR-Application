using Eocr.Server.Auth;
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

        var requests = await requestRepo.GetMyRequestsAsync(user.Id, ct);
        return Ok(requests);
    }
}
