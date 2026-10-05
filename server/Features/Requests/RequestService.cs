using Eocr.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Features.Requests;

public interface IRequestService
{
    Task<IEnumerable<RequestSummaryDto>> GetMyRequestsAsync(int requestorId, CancellationToken ct);
}

public sealed class RequestService(EocrDbContext db) : IRequestService
{
    public async Task<IEnumerable<RequestSummaryDto>> GetMyRequestsAsync(
        int requestorId,
        CancellationToken ct)
    {
        return await db.VettingRequests
            .Where(r => r.RequestorId == requestorId)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => new RequestSummaryDto(
                r.Id,
                r.SoftwareName,
                r.Vendor,
                r.Status.ToString(),
                r.UpdatedAt
            ))
            .ToListAsync(ct);
    }
}
