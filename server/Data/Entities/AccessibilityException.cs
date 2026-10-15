namespace Eocr.Server.Data.Entities;

// An EEAAP (Equally Effective Alternate Access Plan) exception: the Airtable Exceptions table. The requester
// writes the plan when the reviewer asks for one; the request's decision approves or denies it. One per
// request. (Named to avoid System.Exception.)
public class AccessibilityException
{
    public int ExceptionId { get; set; }
    public int RequestId { get; set; }
    public Request Request { get; set; } = null!;
    // The catalog row the decision applied the exception to.
    public int? SoftwareId { get; set; }
    public Software? Software { get; set; }
    public int RequestorId { get; set; }
    public User Requestor { get; set; } = null!;
    public string? BusinessJustification { get; set; }
    public string? AccessibilityImpact { get; set; }
    public string? MitigationPlan { get; set; }
    public int StatusId { get; set; }
    public Code Status { get; set; } = null!;
    public DateTimeOffset? SubmittedAt { get; set; }
    public DateOnly? ApprovalDate { get; set; }
    public DateOnly? ExpirationDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
