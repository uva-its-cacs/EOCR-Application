namespace Eocr.Server.DTOs;

// The decision: Approved, ApprovedWithConditions or Denied (RequestStatus values). It also updates the
// catalog row for the request's name, vendor and version (created if new).
public class DecideRequestDto
{
    public string Outcome { get; set; } = string.Empty;
    public DateOnly? ApprovalExpirationDate { get; set; }
    public int? AccessibilityRiskId { get; set; }
    public string? Conditions { get; set; }
    public string? Comments { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
