using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Repos;

public interface IRequestRepo
{
    Task<IEnumerable<RequestSummaryDto>> GetMyRequestsAsync(int requestorId, CancellationToken ct);
}

public class RequestRepo(EocrDbContext db) : IRequestRepo
{
    public async Task<IEnumerable<RequestSummaryDto>> GetMyRequestsAsync(
        int requestorId,
        CancellationToken ct)
    {
        return await db.VettingRequests
            .Where(r => r.RequestorId == requestorId)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => new RequestSummaryDto
            {
                RequestId = r.RequestId,
                SoftwareName = r.SoftwareName,
                Vendor = r.Vendor,
                StatusCode = r.Status.Value,
                StatusLabel = r.Status.Label,
                UpdatedAt = r.UpdatedAt,
            })
            .ToListAsync(ct);
    }
}
