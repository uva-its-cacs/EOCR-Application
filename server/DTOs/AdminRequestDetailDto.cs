namespace Eocr.Server.DTOs;

// A request as the reviewer sees it: the request, who asked, the review so far, the catalog's versions
// of the same product, and the workflow moves allowed from the current status.
public class AdminRequestDetailDto
{
    public RequestDetailDto Request { get; set; } = new();
    public string RequestorName { get; set; } = string.Empty;
    public string RequestorEmail { get; set; } = string.Empty;
    public int? AssignedReviewerId { get; set; }
    public string? AssignedReviewerName { get; set; }
    public ReviewDto? Review { get; set; }
    public List<SoftwareCatalogDto> CatalogVersions { get; set; } = [];
    public List<string> AllowedActions { get; set; } = [];
}
