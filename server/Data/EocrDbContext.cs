using Eocr.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Data;

public class EocrDbContext(DbContextOptions<EocrDbContext> options) : DbContext(options)
{
    public DbSet<Code> Codes => Set<Code>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Request> VettingRequests => Set<Request>();
    public DbSet<Software> Software => Set<Software>();

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
                new Code { CodeId = 303, CodeType = CodeConstants.CodeTypes.AccessibilityRisk, Value = CodeConstants.AccessibilityRisks.High,                 Label = "High",                     SortOrder = 3, IsActive = true, IsSystem = true }
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
            e.HasOne(r => r.Status)
                .WithMany()
                .HasForeignKey(r => r.StatusId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Requestor)
                .WithMany(u => u.VettingRequests)
                .HasForeignKey(r => r.RequestorId);
        });

        modelBuilder.Entity<Software>(e =>
        {
            e.Property(s => s.SoftwareName).HasMaxLength(200).IsRequired();
            e.Property(s => s.VendorName).HasMaxLength(200).IsRequired();
            e.Property(s => s.PublisherWebsite).HasMaxLength(2000);
            e.Property(s => s.Notes).HasMaxLength(4000);
            e.Property(s => s.ApprovalDate).HasColumnType("date");
            e.Property(s => s.ApprovalExpirationDate).HasColumnType("date");

            e.HasIndex(s => s.SoftwareName);

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
