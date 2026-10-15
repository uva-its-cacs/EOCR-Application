namespace Eocr.Server.DTOs;

// Outcome of a request write, mapped to HTTP status codes by the controller.
public class RequestWriteResultDto
{
    public RequestDetailDto? Request { get; set; }
    public Dictionary<string, string[]> Errors { get; set; } = [];
    public bool NotFound { get; set; }
    // The request changed since it was loaded (stale UpdatedAt).
    public bool Conflict { get; set; }
    // The request is not a draft or waiting on the requester, so it cannot be edited or submitted.
    public bool NotDraft { get; set; }
}
