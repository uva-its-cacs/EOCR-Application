namespace Eocr.Server.DTOs;

// Assign a request to an admin (null assigns it to the caller). UpdatedAt is the request's.
public class AssignRequestDto
{
    public int? ReviewerId { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
