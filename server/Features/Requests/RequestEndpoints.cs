using Eocr.Server.Auth;

namespace Eocr.Server.Features.Requests;

public static class RequestEndpoints
{
    public static void MapRoutes(WebApplication app)
    {
        var group = app.MapGroup("/api/requests");

        group.MapGet("/mine", GetMine);
    }

    private static async Task<IResult> GetMine(
        ICurrentUser currentUser,
        IRequestService requestService,
        CancellationToken ct)
    {
        var user = await currentUser.GetAsync(ct);
        if (user is null)
            return Results.Unauthorized();

        var requests = await requestService.GetMyRequestsAsync(user.Id, ct);
        return Results.Ok(requests);
    }
}
