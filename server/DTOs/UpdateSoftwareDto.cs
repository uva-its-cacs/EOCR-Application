using System.ComponentModel.DataAnnotations;

namespace Eocr.Server.DTOs;

public class UpdateSoftwareDto
{
    [Required, StringLength(200)]
    public string SoftwareName { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string VendorName { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? PublisherWebsite { get; set; }

    public int? SoftwareCategoryId { get; set; }
    public int? BusinessOwnerId { get; set; }
    public int? TechnicalOwnerId { get; set; }

    [Range(1, int.MaxValue)]
    public int CurrentApprovalStatusId { get; set; }

    public int? AccessibilityRiskId { get; set; }
    public DateOnly? ApprovalDate { get; set; }
    public DateOnly? ApprovalExpirationDate { get; set; }

    [StringLength(4000)]
    public string? Notes { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
