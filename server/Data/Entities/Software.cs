namespace Eocr.Server.Data.Entities;

public class Software
{
    public int SoftwareId { get; set; }

    public string SoftwareName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    // Each catalog row is one version of a product (e.g. 2.3a approved, 3.4 under review).
    public string Version { get; set; } = string.Empty;
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

    // The conditions of an "approved with conditions" decision.
    public string? Conditions { get; set; }
    public string? Notes { get; set; }

    public ICollection<AccessibilityException> Exceptions { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
