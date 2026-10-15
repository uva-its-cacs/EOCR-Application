namespace Eocr.Server.DTOs;

// The summary review form. UpdatedAt is the review's (null for the first save; stale values answer 409).
public class SaveReviewDto
{
    public string? VendorQuestions { get; set; }
    public string? OverallAssessment { get; set; }
    public string? Findings { get; set; }
    public int? RiskRatingId { get; set; }
    public int? RecommendationId { get; set; }
    public string? Conditions { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
