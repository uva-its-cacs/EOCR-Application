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
    public DateTimeOffset CreatedAt { get; set; }
}
