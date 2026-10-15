namespace Eocr.Server.DTOs;

// Outcome of an admin write, mapped to HTTP status codes by the controller.
public class AdminWriteResultDto
{
    public AdminRequestDetailDto? Detail { get; set; }
    public Dictionary<string, string[]> Errors { get; set; } = [];
    public bool NotFound { get; set; }
    // The request or review changed since it was loaded (stale UpdatedAt).
    public bool Conflict { get; set; }
    // The move is not allowed from the request's current status.
    public bool InvalidTransition { get; set; }
}
