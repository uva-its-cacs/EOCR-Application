using Eocr.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Data;

public class EocrDbContext(DbContextOptions<EocrDbContext> options) : DbContext(options)
{
    public DbSet<Code> Codes => Set<Code>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Request> VettingRequests => Set<Request>();
    public DbSet<Software> Software => Set<Software>();
    public DbSet<WorkflowHistory> WorkflowHistory => Set<WorkflowHistory>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<AccessibilityException> Exceptions => Set<AccessibilityException>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Code>(e =>
        {
            e.Property(c => c.CodeType).HasMaxLength(50);
            e.Property(c => c.Value).HasMaxLength(100);
            e.Property(c => c.Label).HasMaxLength(200);
            e.Property(c => c.Description).HasMaxLength(500);
            e.HasIndex(c => new { c.CodeType, c.Value }).IsUnique();
            e.HasData(
                new Code { CodeId = 1,   CodeType = CodeConstants.CodeTypes.UserRole,       Value = CodeConstants.UserRoles.User,                              Label = "User",                     SortOrder = 1, IsActive = true, IsSystem = true },
                new Code { CodeId = 2,   CodeType = CodeConstants.CodeTypes.UserRole,       Value = CodeConstants.UserRoles.Admin,                             Label = "Admin",                    SortOrder = 2, IsActive = true, IsSystem = true },
                new Code { CodeId = 101, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.Draft,                       Label = "Draft",                    SortOrder = 1, IsActive = true, IsSystem = true },
                new Code { CodeId = 102, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.Submitted,                   Label = "Submitted",                SortOrder = 2, IsActive = true, IsSystem = true },
                new Code { CodeId = 103, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.AiReview,                    Label = "AI Review",                SortOrder = 3, IsActive = true, IsSystem = true },
                new Code { CodeId = 104, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.HumanReview,                 Label = "Human Review",             SortOrder = 4, IsActive = true, IsSystem = true },
                new Code { CodeId = 105, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.MoreInfoNeeded,              Label = "More Info Needed",         SortOrder = 5, IsActive = true, IsSystem = true },
                new Code { CodeId = 106, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.AwaitingEeaap,               Label = "Awaiting EEAAP",           SortOrder = 6, IsActive = true, IsSystem = true },
                new Code { CodeId = 107, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.Approved,                    Label = "Approved",                 SortOrder = 7, IsActive = true, IsSystem = true },
                new Code { CodeId = 108, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.ApprovedWithConditions,      Label = "Approved with Conditions", SortOrder = 8, IsActive = true, IsSystem = true },
                new Code { CodeId = 109, CodeType = CodeConstants.CodeTypes.RequestStatus,  Value = CodeConstants.RequestStatuses.Denied,                      Label = "Denied",                   SortOrder = 9, IsActive = true, IsSystem = true },
                // ApprovalStatus — Ids 201-206
                new Code { CodeId = 201, CodeType = CodeConstants.CodeTypes.ApprovalStatus, Value = CodeConstants.ApprovalStatuses.NotReviewed,               Label = "Not reviewed",             SortOrder = 1, IsActive = true, IsSystem = true },
                new Code { CodeId = 202, CodeType = CodeConstants.CodeTypes.ApprovalStatus, Value = CodeConstants.ApprovalStatuses.UnderReview,               Label = "Under review",             SortOrder = 2, IsActive = true, IsSystem = true },
                new Code { CodeId = 203, CodeType = CodeConstants.CodeTypes.ApprovalStatus, Value = CodeConstants.ApprovalStatuses.Approved,                  Label = "Approved",                 SortOrder = 3, IsActive = true, IsSystem = true },
                new Code { CodeId = 204, CodeType = CodeConstants.CodeTypes.ApprovalStatus, Value = CodeConstants.ApprovalStatuses.ApprovedWithConditions,    Label = "Approved with conditions", SortOrder = 4, IsActive = true, IsSystem = true },
                new Code { CodeId = 205, CodeType = CodeConstants.CodeTypes.ApprovalStatus, Value = CodeConstants.ApprovalStatuses.Denied,                    Label = "Denied",                   SortOrder = 5, IsActive = true, IsSystem = true },
                new Code { CodeId = 206, CodeType = CodeConstants.CodeTypes.ApprovalStatus, Value = CodeConstants.ApprovalStatuses.Expired,                   Label = "Expired",                  SortOrder = 6, IsActive = true, IsSystem = true },
                // AccessibilityRisk — Ids 301-303
                new Code { CodeId = 301, CodeType = CodeConstants.CodeTypes.AccessibilityRisk, Value = CodeConstants.AccessibilityRisks.Low,                  Label = "Low",                      SortOrder = 1, IsActive = true, IsSystem = true },
                new Code { CodeId = 302, CodeType = CodeConstants.CodeTypes.AccessibilityRisk, Value = CodeConstants.AccessibilityRisks.Medium,               Label = "Medium",                   SortOrder = 2, IsActive = true, IsSystem = true },
                new Code { CodeId = 303, CodeType = CodeConstants.CodeTypes.AccessibilityRisk, Value = CodeConstants.AccessibilityRisks.High,                 Label = "High",                     SortOrder = 3, IsActive = true, IsSystem = true },
                // ReviewType — Ids 401-402
                new Code { CodeId = 401, CodeType = CodeConstants.CodeTypes.ReviewType,     Value = CodeConstants.ReviewTypes.Ai,                         Label = "AI review",                SortOrder = 1, IsActive = true, IsSystem = true },
                new Code { CodeId = 402, CodeType = CodeConstants.CodeTypes.ReviewType,     Value = CodeConstants.ReviewTypes.Human,                      Label = "Human review",             SortOrder = 2, IsActive = true, IsSystem = true },
                // Recommendation — Ids 501-504
                new Code { CodeId = 501, CodeType = CodeConstants.CodeTypes.Recommendation, Value = CodeConstants.Recommendations.Approve,                 Label = "Approve",                  SortOrder = 1, IsActive = true, IsSystem = true },
                new Code { CodeId = 502, CodeType = CodeConstants.CodeTypes.Recommendation, Value = CodeConstants.Recommendations.ApproveWithConditions,   Label = "Approve with conditions",  SortOrder = 2, IsActive = true, IsSystem = true },
                new Code { CodeId = 503, CodeType = CodeConstants.CodeTypes.Recommendation, Value = CodeConstants.Recommendations.Deny,                    Label = "Deny",                     SortOrder = 3, IsActive = true, IsSystem = true },
                new Code { CodeId = 504, CodeType = CodeConstants.CodeTypes.Recommendation, Value = CodeConstants.Recommendations.ExceptionNeeded,         Label = "Exception (EEAAP) needed", SortOrder = 4, IsActive = true, IsSystem = true },
                // ExceptionStatus — Ids 601-605
                new Code { CodeId = 601, CodeType = CodeConstants.CodeTypes.ExceptionStatus, Value = CodeConstants.ExceptionStatuses.Requested, Label = "Requested", SortOrder = 1, IsActive = true, IsSystem = true },
                new Code { CodeId = 602, CodeType = CodeConstants.CodeTypes.ExceptionStatus, Value = CodeConstants.ExceptionStatuses.Submitted, Label = "Submitted", SortOrder = 2, IsActive = true, IsSystem = true },
                new Code { CodeId = 603, CodeType = CodeConstants.CodeTypes.ExceptionStatus, Value = CodeConstants.ExceptionStatuses.Approved,  Label = "Approved",  SortOrder = 3, IsActive = true, IsSystem = true },
                new Code { CodeId = 604, CodeType = CodeConstants.CodeTypes.ExceptionStatus, Value = CodeConstants.ExceptionStatuses.Denied,    Label = "Denied",    SortOrder = 4, IsActive = true, IsSystem = true },
                new Code { CodeId = 605, CodeType = CodeConstants.CodeTypes.ExceptionStatus, Value = CodeConstants.ExceptionStatuses.Withdrawn, Label = "Withdrawn", SortOrder = 5, IsActive = true, IsSystem = true }
            );
        });

        modelBuilder.Entity<User>(e =>
        {
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.Name).HasMaxLength(200);
            e.HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Request>(e =>
        {
            e.Property(r => r.SoftwareName).HasMaxLength(200);
            e.Property(r => r.Vendor).HasMaxLength(200);
            e.Property(r => r.Version).HasMaxLength(50);
            e.Property(r => r.Department).HasMaxLength(200);
            e.Property(r => r.BusinessNeed).HasMaxLength(4000);
            e.Property(r => r.Url).HasMaxLength(2000);
            // Draft edits and submit check it, so a stale form cannot overwrite a newer change.
            e.Property(r => r.UpdatedAt).IsConcurrencyToken();
            e.HasOne(r => r.FundingSource)
                .WithMany()
                .HasForeignKey(r => r.FundingSourceId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Software)
                .WithMany()
                .HasForeignKey(r => r.SoftwareId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Status)
                .WithMany()
                .HasForeignKey(r => r.StatusId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.AssignedReviewer)
                .WithMany()
                .HasForeignKey(r => r.AssignedReviewerId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Requestor)
                .WithMany(u => u.VettingRequests)
                .HasForeignKey(r => r.RequestorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AccessibilityException>(e =>
        {
            e.ToTable("Exceptions");
            e.HasKey(x => x.ExceptionId);
            e.Property(x => x.BusinessJustification).HasMaxLength(4000);
            e.Property(x => x.AccessibilityImpact).HasMaxLength(4000);
            e.Property(x => x.MitigationPlan).HasMaxLength(4000);
            e.Property(x => x.ApprovalDate).HasColumnType("date");
            e.Property(x => x.ExpirationDate).HasColumnType("date");
            // A stale EEAAP form cannot overwrite a newer save.
            e.Property(x => x.UpdatedAt).IsConcurrencyToken();
            e.HasIndex(x => x.RequestId).IsUnique();
            e.HasIndex(x => x.SoftwareId);
            e.HasOne(x => x.Request)
                .WithOne(r => r.Exception)
                .HasForeignKey<AccessibilityException>(x => x.RequestId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Software)
                .WithMany(s => s.Exceptions)
                .HasForeignKey(x => x.SoftwareId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Requestor)
                .WithMany()
                .HasForeignKey(x => x.RequestorId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Status)
                .WithMany()
                .HasForeignKey(x => x.StatusId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Review>(e =>
        {
            e.Property(v => v.VendorQuestions).HasMaxLength(4000);
            e.Property(v => v.OverallAssessment).HasMaxLength(4000);
            e.Property(v => v.Findings).HasMaxLength(4000);
            e.Property(v => v.Conditions).HasMaxLength(4000);
            // A stale review form cannot overwrite a newer save.
            e.Property(v => v.UpdatedAt).IsConcurrencyToken();
            e.HasIndex(v => v.RequestId).IsUnique();
            e.HasOne(v => v.Request)
                .WithOne(r => r.Review)
                .HasForeignKey<Review>(v => v.RequestId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.Reviewer)
                .WithMany()
                .HasForeignKey(v => v.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.ReviewType)
                .WithMany()
                .HasForeignKey(v => v.ReviewTypeId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.RiskRating)
                .WithMany()
                .HasForeignKey(v => v.RiskRatingId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.Recommendation)
                .WithMany()
                .HasForeignKey(v => v.RecommendationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WorkflowHistory>(e =>
        {
            e.Property(h => h.Comments).HasMaxLength(4000);
            e.HasIndex(h => new { h.RequestId, h.ChangedAt });
            e.HasOne(h => h.Request)
                .WithMany(r => r.History)
                .HasForeignKey(h => h.RequestId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(h => h.PreviousStatus)
                .WithMany()
                .HasForeignKey(h => h.PreviousStatusId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(h => h.NewStatus)
                .WithMany()
                .HasForeignKey(h => h.NewStatusId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(h => h.ChangedBy)
                .WithMany()
                .HasForeignKey(h => h.ChangedById)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Software>(e =>
        {
            e.Property(s => s.SoftwareName).HasMaxLength(200).IsRequired();
            e.Property(s => s.VendorName).HasMaxLength(200).IsRequired();
            e.Property(s => s.Version).HasMaxLength(50).IsRequired();
            e.Property(s => s.PublisherWebsite).HasMaxLength(2000);
            e.Property(s => s.Notes).HasMaxLength(4000);
            e.Property(s => s.Conditions).HasMaxLength(4000);
            e.Property(s => s.ApprovalDate).HasColumnType("date");
            e.Property(s => s.ApprovalExpirationDate).HasColumnType("date");

            e.HasIndex(s => s.SoftwareName);
            // One catalog row per product version.
            e.HasIndex(s => new { s.SoftwareName, s.VendorName, s.Version }).IsUnique();

            e.HasOne(s => s.SoftwareCategory)
                .WithMany()
                .HasForeignKey(s => s.SoftwareCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.CurrentApprovalStatus)
                .WithMany()
                .HasForeignKey(s => s.CurrentApprovalStatusId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.AccessibilityRisk)
                .WithMany()
                .HasForeignKey(s => s.AccessibilityRiskId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.BusinessOwner)
                .WithMany()
                .HasForeignKey(s => s.BusinessOwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(s => s.TechnicalOwner)
                .WithMany()
                .HasForeignKey(s => s.TechnicalOwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
