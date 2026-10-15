namespace Eocr.Server.DTOs;

public class SoftwareCatalogDto
{
    public int SoftwareId { get; set; }
    public string SoftwareName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string? SoftwareCategoryLabel { get; set; }
    public string CurrentApprovalStatusCode { get; set; } = string.Empty;
    public string CurrentApprovalStatusLabel { get; set; } = string.Empty;
    public string? AccessibilityRiskLabel { get; set; }
    public DateOnly? ApprovalExpirationDate { get; set; }
    public string? Conditions { get; set; }
    // The latest approved EEAAP exception for this version, if any.
    public DateOnly? ExceptionExpirationDate { get; set; }
    // Computed, not stored.
    public bool ExceptionExpired =>
        ExceptionExpirationDate is { } expires && expires < DateOnly.FromDateTime(DateTime.UtcNow);
    public DateTimeOffset CreatedAt { get; set; }
}
