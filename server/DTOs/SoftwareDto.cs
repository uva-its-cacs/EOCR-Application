namespace Eocr.Server.DTOs;

public class SoftwareDto
{
    public int SoftwareId { get; set; }
    public string SoftwareName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string? PublisherWebsite { get; set; }
    public int? SoftwareCategoryId { get; set; }
    public string? SoftwareCategoryCode { get; set; }
    public string? SoftwareCategoryLabel { get; set; }
    public int? BusinessOwnerId { get; set; }
    public string? BusinessOwnerName { get; set; }
    public int? TechnicalOwnerId { get; set; }
    public string? TechnicalOwnerName { get; set; }
    public int CurrentApprovalStatusId { get; set; }
    public string CurrentApprovalStatusCode { get; set; } = string.Empty;
    public string CurrentApprovalStatusLabel { get; set; } = string.Empty;
    public int? AccessibilityRiskId { get; set; }
    public string? AccessibilityRiskCode { get; set; }
    public string? AccessibilityRiskLabel { get; set; }
    public DateOnly? ApprovalDate { get; set; }
    public DateOnly? ApprovalExpirationDate { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
