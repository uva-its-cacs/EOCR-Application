namespace Eocr.Server.Features.Requests;

public sealed record RequestSummaryDto(
    int Id,
    string SoftwareName,
    string Vendor,
    string Status,
    DateTimeOffset UpdatedAt
);
