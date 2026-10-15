namespace Eocr.Server.DTOs;

public class ReviewDto
{
    public int ReviewId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string ReviewTypeCode { get; set; } = string.Empty;
    public string ReviewTypeLabel { get; set; } = string.Empty;
    public string? VendorQuestions { get; set; }
    public string? OverallAssessment { get; set; }
    public string? Findings { get; set; }
    public int? RiskRatingId { get; set; }
    public string? RiskRatingCode { get; set; }
    public string? RiskRatingLabel { get; set; }
    public int? RecommendationId { get; set; }
    public string? RecommendationCode { get; set; }
    public string? RecommendationLabel { get; set; }
    public string? Conditions { get; set; }
    public DateTimeOffset ReviewedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
