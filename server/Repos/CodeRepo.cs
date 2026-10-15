using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Repos;

public interface ICodeRepo
{
    Task<List<CodeDto>?> GetOptionsAsync(string codeType, CancellationToken ct);
}

public class CodeRepo(EocrDbContext db) : ICodeRepo
{
    public async Task<List<CodeDto>?> GetOptionsAsync(string codeType, CancellationToken ct)
    {
        if (codeType != CodeConstants.CodeTypes.SoftwareCategory
            && codeType != CodeConstants.CodeTypes.ApprovalStatus
            && codeType != CodeConstants.CodeTypes.AccessibilityRisk
            && codeType != CodeConstants.CodeTypes.FundingSource
            && codeType != CodeConstants.CodeTypes.Recommendation
            && codeType != CodeConstants.CodeTypes.RequestStatus)
            return null;

        return await db.Codes.AsNoTracking()
            .Where(c => c.CodeType == codeType && c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Label)
            .Select(c => new CodeDto
            {
                CodeId = c.CodeId,
                Value = c.Value,
                Label = c.Label,
            })
            .ToListAsync(ct);
    }
}
