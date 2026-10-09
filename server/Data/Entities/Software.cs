namespace Eocr.Server.Data.Entities;

public class Software
{
    public int SoftwareId { get; set; }

    public string SoftwareName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string? PublisherWebsite { get; set; }

    public int? SoftwareCategoryId { get; set; }
    public Code? SoftwareCategory { get; set; }

    public int? BusinessOwnerId { get; set; }
    public User? BusinessOwner { get; set; }

    public int? TechnicalOwnerId { get; set; }
    public User? TechnicalOwner { get; set; }

    public int CurrentApprovalStatusId { get; set; }
    public Code CurrentApprovalStatus { get; set; } = null!;

    public int? AccessibilityRiskId { get; set; }
    public Code? AccessibilityRisk { get; set; }

    public DateOnly? ApprovalDate { get; set; }
    public DateOnly? ApprovalExpirationDate { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
