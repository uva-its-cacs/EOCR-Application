namespace Eocr.Server.DTOs;

public class SoftwareUpdateResultDto
{
    public SoftwareDto? Software { get; set; }
    public Dictionary<string, string[]> Errors { get; set; } = [];
    public bool NotFound { get; set; }
    public bool Conflict { get; set; }
}
