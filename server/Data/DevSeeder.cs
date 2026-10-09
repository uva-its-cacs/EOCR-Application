using Eocr.Server.Data.Entities;

namespace Eocr.Server.Data;

public static class DevSeeder
{
    public static void Seed(EocrDbContext db)
    {
        SeedUsers(db);
        SeedSoftware(db);
    }

    private static void SeedUsers(EocrDbContext db)
    {
        if (db.Users.Any()) return;

        var userRoleId = db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.UserRole && c.Value == CodeConstants.UserRoles.User)
            .Select(c => c.CodeId)
            .Single();

        var adminRoleId = db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.UserRole && c.Value == CodeConstants.UserRoles.Admin)
            .Select(c => c.CodeId)
            .Single();

        var statusIds = db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.RequestStatus)
            .Select(c => new { c.Value, c.CodeId })
            .ToDictionary(c => c.Value, c => c.CodeId);

        int StatusId(string value) => statusIds[value];

        var dana = new User { Email = "dana@example.com", Name = "Dana Example", RoleId = userRoleId };
        var sam = new User { Email = "sam@example.com", Name = "Sam Example", RoleId = userRoleId };
        var adminUser = new User { Email = "admin@example.com", Name = "Admin Example", RoleId = adminRoleId };

        db.Users.AddRange(dana, sam, adminUser);

        var now = DateTimeOffset.UtcNow;

        db.VettingRequests.AddRange(
            new Request { Requestor = dana, SoftwareName = "Acme Suite",        Vendor = "Acme Corp",      StatusId = StatusId(CodeConstants.RequestStatuses.Approved),              CreatedAt = now.AddDays(-30), UpdatedAt = now.AddDays(-5) },
            new Request { Requestor = dana, SoftwareName = "Buildout Pro",      Vendor = "Buildout Inc",   StatusId = StatusId(CodeConstants.RequestStatuses.HumanReview),           CreatedAt = now.AddDays(-20), UpdatedAt = now.AddDays(-2) },
            new Request { Requestor = dana, SoftwareName = "Clover Analytics",  Vendor = "Clover Tech",    StatusId = StatusId(CodeConstants.RequestStatuses.Submitted),             CreatedAt = now.AddDays(-15), UpdatedAt = now.AddDays(-15) },
            new Request { Requestor = dana, SoftwareName = "Delphi Boards",     Vendor = "Delphi Systems", StatusId = StatusId(CodeConstants.RequestStatuses.AiReview),              CreatedAt = now.AddDays(-10), UpdatedAt = now.AddDays(-10) },
            new Request { Requestor = dana, SoftwareName = "Ember Forms",       Vendor = "Ember LLC",      StatusId = StatusId(CodeConstants.RequestStatuses.MoreInfoNeeded),        CreatedAt = now.AddDays(-8),  UpdatedAt = now.AddDays(-1) },
            new Request { Requestor = dana, SoftwareName = "Flux Reporter",     Vendor = "Flux Co",        StatusId = StatusId(CodeConstants.RequestStatuses.Draft),                 CreatedAt = now.AddDays(-3),  UpdatedAt = now.AddDays(-3) },
            new Request { Requestor = dana, SoftwareName = "Granite Maps",      Vendor = "Granite GIS",    StatusId = StatusId(CodeConstants.RequestStatuses.Denied),                CreatedAt = now.AddDays(-60), UpdatedAt = now.AddDays(-45) },
            new Request { Requestor = dana, SoftwareName = "Harbor Docs",       Vendor = "Harbor Group",   StatusId = StatusId(CodeConstants.RequestStatuses.ApprovedWithConditions), CreatedAt = now.AddDays(-90), UpdatedAt = now.AddDays(-20) },
            // Sam's requests — must not appear in Dana's dashboard
            new Request { Requestor = sam,  SoftwareName = "Iris Tools",        Vendor = "Iris Dev",       StatusId = StatusId(CodeConstants.RequestStatuses.Submitted),             CreatedAt = now.AddDays(-5),  UpdatedAt = now.AddDays(-5) },
            new Request { Requestor = sam,  SoftwareName = "Jasper CMS",        Vendor = "Jasper Web",     StatusId = StatusId(CodeConstants.RequestStatuses.Draft),                 CreatedAt = now.AddDays(-1),  UpdatedAt = now.AddDays(-1) }
        );

        db.SaveChanges();
    }

    private static void SeedSoftware(EocrDbContext db)
    {
        if (db.Software.Any()) return;

        // Seed SoftwareCategory codes (IsSystem = false, not via HasData).
        // Look up by (CodeType, Value) to avoid duplicates on re-seed.
        var categoryValues = new[]
        {
            ("Productivity",    "Productivity tools"),
            ("Communication",   "Communication and collaboration"),
            ("DataAnalytics",   "Data and analytics"),
            ("DeveloperTools",  "Developer tools and platforms"),
        };

        var existingCategories = db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.SoftwareCategory)
            .Select(c => c.Value)
            .ToHashSet();

        int sortOrder = 1;
        foreach (var (value, label) in categoryValues)
        {
            if (!existingCategories.Contains(value))
            {
                db.Codes.Add(new Code
                {
                    CodeType    = CodeConstants.CodeTypes.SoftwareCategory,
                    Value       = value,
                    Label       = label,
                    SortOrder   = sortOrder,
                    IsActive    = true,
                    IsSystem    = false,
                });
            }
            sortOrder++;
        }
        db.SaveChanges();

        // Look up all needed codes by (CodeType, Value).
        int ApprovalStatusId(string value) => db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.ApprovalStatus && c.Value == value)
            .Select(c => c.CodeId)
            .Single();

        int RiskId(string value) => db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.AccessibilityRisk && c.Value == value)
            .Select(c => c.CodeId)
            .Single();

        int CategoryId(string value) => db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.SoftwareCategory && c.Value == value)
            .Select(c => c.CodeId)
            .Single();

        int? UserId(string email) => db.Users
            .Where(u => u.Email == email)
            .Select(u => (int?)u.UserId)
            .FirstOrDefault();

        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(now.UtcDateTime);

        db.Software.AddRange(
            // 1. Approved — expires in ~90 days
            new Software
            {
                SoftwareName             = "Northstar Collaborate",
                VendorName               = "Northstar Technologies",
                PublisherWebsite         = "https://northstar.example.com",
                SoftwareCategoryId       = CategoryId("Communication"),
                BusinessOwnerId          = UserId("dana@example.com"),
                TechnicalOwnerId         = UserId("admin@example.com"),
                CurrentApprovalStatusId  = ApprovalStatusId(CodeConstants.ApprovalStatuses.Approved),
                AccessibilityRiskId      = RiskId(CodeConstants.AccessibilityRisks.Low),
                ApprovalDate             = today.AddDays(-275),
                ApprovalExpirationDate   = today.AddDays(90),
                Notes                    = "Reviewed against VPAT v2.4. Minor issues documented.",
                CreatedAt                = now.AddDays(-280),
                UpdatedAt                = now.AddDays(-275),
            },
            // 2. Approved with conditions
            new Software
            {
                SoftwareName             = "Driftwood Analytics",
                VendorName               = "Driftwood Data Inc",
                SoftwareCategoryId       = CategoryId("DataAnalytics"),
                BusinessOwnerId          = UserId("sam@example.com"),
                TechnicalOwnerId         = UserId("admin@example.com"),
                CurrentApprovalStatusId  = ApprovalStatusId(CodeConstants.ApprovalStatuses.ApprovedWithConditions),
                AccessibilityRiskId      = RiskId(CodeConstants.AccessibilityRisks.Medium),
                ApprovalDate             = today.AddDays(-180),
                ApprovalExpirationDate   = today.AddDays(185),
                Notes                    = "Approved with condition: vendor must provide remediation plan by Q2.",
                CreatedAt                = now.AddDays(-185),
                UpdatedAt                = now.AddDays(-180),
            },
            // 3. Expired — expiration in the past
            new Software
            {
                SoftwareName             = "Ember Workflow",
                VendorName               = "Ember Systems LLC",
                SoftwareCategoryId       = CategoryId("Productivity"),
                BusinessOwnerId          = UserId("dana@example.com"),
                CurrentApprovalStatusId  = ApprovalStatusId(CodeConstants.ApprovalStatuses.Expired),
                AccessibilityRiskId      = RiskId(CodeConstants.AccessibilityRisks.Medium),
                ApprovalDate             = today.AddDays(-400),
                ApprovalExpirationDate   = today.AddDays(-35),
                Notes                    = "Annual renewal overdue. Renewal vetting request pending.",
                CreatedAt                = now.AddDays(-405),
                UpdatedAt                = now.AddDays(-35),
            },
            // 4. Denied — no expiration date
            new Software
            {
                SoftwareName             = "Cairn DevOps",
                VendorName               = "Cairn Software Co",
                SoftwareCategoryId       = CategoryId("DeveloperTools"),
                TechnicalOwnerId         = UserId("admin@example.com"),
                CurrentApprovalStatusId  = ApprovalStatusId(CodeConstants.ApprovalStatuses.Denied),
                AccessibilityRiskId      = RiskId(CodeConstants.AccessibilityRisks.High),
                ApprovalDate             = null,
                ApprovalExpirationDate   = null,
                Notes                    = "Denied: VPAT indicates significant barriers for keyboard-only users.",
                CreatedAt                = now.AddDays(-120),
                UpdatedAt                = now.AddDays(-110),
            },
            // 5. Under review — no approval dates
            new Software
            {
                SoftwareName             = "Ridgeline Project Tracker",
                VendorName               = "Ridgeline Corp",
                SoftwareCategoryId       = CategoryId("Productivity"),
                BusinessOwnerId          = UserId("sam@example.com"),
                CurrentApprovalStatusId  = ApprovalStatusId(CodeConstants.ApprovalStatuses.UnderReview),
                AccessibilityRiskId      = RiskId(CodeConstants.AccessibilityRisks.Medium),
                Notes                    = "Waiting on vendor VPAT submission.",
                CreatedAt                = now.AddDays(-14),
                UpdatedAt                = now.AddDays(-3),
            },
            // 6. Not reviewed — no approval dates
            new Software
            {
                SoftwareName             = "Fieldstone Docs",
                VendorName               = "Fieldstone Publishing",
                SoftwareCategoryId       = CategoryId("Productivity"),
                CurrentApprovalStatusId  = ApprovalStatusId(CodeConstants.ApprovalStatuses.NotReviewed),
                AccessibilityRiskId      = null,
                Notes                    = null,
                CreatedAt                = now.AddDays(-2),
                UpdatedAt                = now.AddDays(-2),
            }
        );

        db.SaveChanges();
    }
}
