using System.Linq.Expressions;
using Eocr.Server.Data;
using Eocr.Server.Data.Entities;
using Eocr.Server.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Repos;

public interface ISoftwareRepo
{
    Task<List<SoftwareDto>> GetAllAsync(CancellationToken ct);
    Task<List<SoftwareOwnerOptionDto>> GetOwnersAsync(CancellationToken ct);
    Task<SoftwareUpdateResultDto> UpdateAsync(int softwareId, UpdateSoftwareDto input, CancellationToken ct);
}

public class SoftwareRepo(EocrDbContext db) : ISoftwareRepo
{
    private static readonly Expression<Func<Software, SoftwareDto>> Projection = s => new SoftwareDto
    {
        SoftwareId = s.SoftwareId,
        SoftwareName = s.SoftwareName,
        VendorName = s.VendorName,
        PublisherWebsite = s.PublisherWebsite,
        SoftwareCategoryId = s.SoftwareCategoryId,
        SoftwareCategoryCode = s.SoftwareCategory == null ? null : s.SoftwareCategory.Value,
        SoftwareCategoryLabel = s.SoftwareCategory == null ? null : s.SoftwareCategory.Label,
        BusinessOwnerId = s.BusinessOwnerId,
        BusinessOwnerName = s.BusinessOwner == null ? null : s.BusinessOwner.Name,
        TechnicalOwnerId = s.TechnicalOwnerId,
        TechnicalOwnerName = s.TechnicalOwner == null ? null : s.TechnicalOwner.Name,
        CurrentApprovalStatusId = s.CurrentApprovalStatusId,
        CurrentApprovalStatusCode = s.CurrentApprovalStatus.Value,
        CurrentApprovalStatusLabel = s.CurrentApprovalStatus.Label,
        AccessibilityRiskId = s.AccessibilityRiskId,
        AccessibilityRiskCode = s.AccessibilityRisk == null ? null : s.AccessibilityRisk.Value,
        AccessibilityRiskLabel = s.AccessibilityRisk == null ? null : s.AccessibilityRisk.Label,
        ApprovalDate = s.ApprovalDate,
        ApprovalExpirationDate = s.ApprovalExpirationDate,
        Notes = s.Notes,
        CreatedAt = s.CreatedAt,
        UpdatedAt = s.UpdatedAt,
    };

    public Task<List<SoftwareDto>> GetAllAsync(CancellationToken ct) =>
        db.Software.AsNoTracking()
            .OrderBy(s => s.SoftwareName).ThenBy(s => s.SoftwareId)
            .Select(Projection).ToListAsync(ct);

    public Task<List<SoftwareOwnerOptionDto>> GetOwnersAsync(CancellationToken ct) =>
        db.Users.AsNoTracking()
            .OrderBy(u => u.Name).ThenBy(u => u.UserId)
            .Select(u => new SoftwareOwnerOptionDto { UserId = u.UserId, Name = u.Name })
            .ToListAsync(ct);

    public async Task<SoftwareUpdateResultDto> UpdateAsync(
        int softwareId, UpdateSoftwareDto input, CancellationToken ct)
    {
        var existing = await db.Software.AsNoTracking()
            .Where(s => s.SoftwareId == softwareId).Select(Projection).FirstOrDefaultAsync(ct);
        if (existing is null)
            return new SoftwareUpdateResultDto { NotFound = true };

        var result = new SoftwareUpdateResultDto();
        var name = input.SoftwareName.Trim();
        var vendor = input.VendorName.Trim();
        var website = string.IsNullOrWhiteSpace(input.PublisherWebsite) ? null : input.PublisherWebsite.Trim();
        var notes = string.IsNullOrWhiteSpace(input.Notes) ? null : input.Notes.Trim();

        if (name.Length == 0 || name.Length > 200)
            result.Errors[nameof(input.SoftwareName)] = ["Enter a software name of up to 200 characters."];
        if (vendor.Length == 0 || vendor.Length > 200)
            result.Errors[nameof(input.VendorName)] = ["Enter a vendor name of up to 200 characters."];
        if (website is not null && (website.Length > 2000
            || !Uri.TryCreate(website, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)))
            result.Errors[nameof(input.PublisherWebsite)] = ["Enter a valid HTTP or HTTPS website."];
        if (notes?.Length > 4000)
            result.Errors[nameof(input.Notes)] = ["Notes must be 4000 characters or fewer."];
        if (input.ApprovalDate.HasValue && input.ApprovalExpirationDate < input.ApprovalDate)
            result.Errors[nameof(input.ApprovalExpirationDate)] = ["Expiration cannot be before the approval date."];

        await ValidateCodeAsync(input.SoftwareCategoryId, existing.SoftwareCategoryId,
            CodeConstants.CodeTypes.SoftwareCategory, nameof(input.SoftwareCategoryId), result, ct);
        await ValidateCodeAsync(input.CurrentApprovalStatusId, existing.CurrentApprovalStatusId,
            CodeConstants.CodeTypes.ApprovalStatus, nameof(input.CurrentApprovalStatusId), result, ct);
        await ValidateCodeAsync(input.AccessibilityRiskId, existing.AccessibilityRiskId,
            CodeConstants.CodeTypes.AccessibilityRisk, nameof(input.AccessibilityRiskId), result, ct);
        await ValidateOwnerAsync(input.BusinessOwnerId, nameof(input.BusinessOwnerId), result, ct);
        await ValidateOwnerAsync(input.TechnicalOwnerId, nameof(input.TechnicalOwnerId), result, ct);

        if (result.Errors.Count > 0)
            return result;

        // Compare and update atomically so an older dialog cannot overwrite another admin's edit.
        var updatedAt = DateTimeOffset.UtcNow;
        var affected = await db.Software
            .Where(s => s.SoftwareId == softwareId && s.UpdatedAt == input.UpdatedAt)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(s => s.SoftwareName, name)
                .SetProperty(s => s.VendorName, vendor)
                .SetProperty(s => s.PublisherWebsite, website)
                .SetProperty(s => s.SoftwareCategoryId, input.SoftwareCategoryId)
                .SetProperty(s => s.BusinessOwnerId, input.BusinessOwnerId)
                .SetProperty(s => s.TechnicalOwnerId, input.TechnicalOwnerId)
                .SetProperty(s => s.CurrentApprovalStatusId, input.CurrentApprovalStatusId)
                .SetProperty(s => s.AccessibilityRiskId, input.AccessibilityRiskId)
                .SetProperty(s => s.ApprovalDate, input.ApprovalDate)
                .SetProperty(s => s.ApprovalExpirationDate, input.ApprovalExpirationDate)
                .SetProperty(s => s.Notes, notes)
                .SetProperty(s => s.UpdatedAt, updatedAt), ct);
        if (affected == 0)
            return new SoftwareUpdateResultDto { Conflict = true };

        result.Software = await db.Software.AsNoTracking()
            .Where(s => s.SoftwareId == softwareId).Select(Projection).SingleAsync(ct);
        return result;
    }

    private async Task ValidateCodeAsync(int? id, int? existingId, string codeType,
        string field, SoftwareUpdateResultDto result, CancellationToken ct)
    {
        if (!id.HasValue) return;
        var valid = await db.Codes.AnyAsync(c => c.CodeId == id && c.CodeType == codeType
            && (c.IsActive || c.CodeId == existingId), ct);
        if (!valid)
            result.Errors[field] = ["Select an active option from this list."];
    }

    private async Task ValidateOwnerAsync(int? id, string field,
        SoftwareUpdateResultDto result, CancellationToken ct)
    {
        if (id.HasValue && !await db.Users.AnyAsync(u => u.UserId == id, ct))
            result.Errors[field] = ["Select an existing owner."];
    }
}
