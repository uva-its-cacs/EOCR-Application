namespace Eocr.Server.DTOs;

// A workflow move (start review, request more info, send for EEAAP). Comments are shown in the history
// and, for "more info" and EEAAP, to the requester. UpdatedAt is the request's.
public class RequestActionDto
{
    public string? Comments { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
