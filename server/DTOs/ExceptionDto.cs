using Eocr.Server.Data;

namespace Eocr.Server.DTOs;

// A request's EEAAP exception.
public class ExceptionDto
{
    public int ExceptionId { get; set; }
    public string StatusCode { get; set; } = string.Empty;
    public string StatusLabel { get; set; } = string.Empty;
    public string? BusinessJustification { get; set; }
    public string? AccessibilityImpact { get; set; }
    public string? MitigationPlan { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateOnly? ApprovalDate { get; set; }
    public DateOnly? ExpirationDate { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    // Computed, not stored: an approved exception past its expiration date.
    public bool IsExpired =>
        StatusCode == CodeConstants.ExceptionStatuses.Approved
        && ExpirationDate is { } expires
        && expires < DateOnly.FromDateTime(DateTime.UtcNow);
}
