namespace Eocr.Server.DTOs;

// Outcome of a requester's EEAAP write, mapped to HTTP status codes by the controller.
public class ExceptionWriteResultDto
{
    public RequestDetailDto? Request { get; set; }
    public Dictionary<string, string[]> Errors { get; set; } = [];
    public bool NotFound { get; set; }
    // The exception changed since it was loaded (stale UpdatedAt).
    public bool Conflict { get; set; }
    // No EEAAP is waiting on the requester (the request is not awaiting one, or it was already submitted).
    public bool NotRequested { get; set; }
}
