namespace Eocr.Server.DTOs;

// The requester's EEAAP answers. UpdatedAt is the exception's (stale values answer 409).
public class SaveExceptionDto
{
    public string? BusinessJustification { get; set; }
    public string? AccessibilityImpact { get; set; }
    public string? MitigationPlan { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
