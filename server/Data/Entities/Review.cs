namespace Eocr.Server.Data.Entities;

// The reviewer's summary review of a request (the Airtable Reviews table). One per request, saved as the
// reviewer works; the decision itself is a request status change.
public class Review
{
    public int ReviewId { get; set; }
    public int RequestId { get; set; }
    public Request Request { get; set; } = null!;
    public int ReviewerId { get; set; }
    public User Reviewer { get; set; } = null!;
    public int ReviewTypeId { get; set; }
    public Code ReviewType { get; set; } = null!;
    public string? VendorQuestions { get; set; }
    public string? OverallAssessment { get; set; }
    public string? Findings { get; set; }
    public int? RiskRatingId { get; set; }
    public Code? RiskRating { get; set; }
    public int? RecommendationId { get; set; }
    public Code? Recommendation { get; set; }
    public string? Conditions { get; set; }
    public DateTimeOffset ReviewedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
