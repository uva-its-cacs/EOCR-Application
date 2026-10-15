using Eocr.Server.Data.Entities;

namespace Eocr.Server.Data;

public static class DevSeeder
{
    public static void Seed(EocrDbContext db)
    {
        SeedUsers(db);
        SeedSoftware(db);
        SeedFundingSources(db);
        SeedRequestIntake(db);
        SeedVersions(db);
        SeedReviews(db);
    }

    // Adds a second administrator (so requests can be reassigned) and, once, an assigned reviewer and a
    // review in progress on the seeded requests under review. Fictional.
    private static void SeedReviews(EocrDbContext db)
    {
        if (!db.Users.Any(u => u.Email == "riley@example.com"))
        {
            var adminRoleId = db.Codes
                .Where(c => c.CodeType == CodeConstants.CodeTypes.UserRole && c.Value == CodeConstants.UserRoles.Admin)
                .Select(c => c.CodeId)
                .Single();
            db.Users.Add(new User { Email = "riley@example.com", Name = "Riley Example", RoleId = adminRoleId });
            db.SaveChanges();
        }
        if (db.Reviews.Any()) return;

        var admin = db.Users.SingleOrDefault(u => u.Email == "admin@example.com");
        var riley = db.Users.Single(u => u.Email == "riley@example.com");
        int Code(string type, string value) => db.Codes
            .Where(c => c.CodeType == type && c.Value == value)
            .Select(c => c.CodeId)
            .Single();

        var buildout = db.VettingRequests.FirstOrDefault(r => r.SoftwareName == "Buildout Pro"
            && r.Status.Value == CodeConstants.RequestStatuses.HumanReview);
        if (buildout is not null && admin is not null)
        {
            buildout.AssignedReviewerId = admin.UserId;
            var now = DateTimeOffset.UtcNow;
            db.Reviews.Add(new Review
            {
                RequestId = buildout.RequestId,
                ReviewerId = admin.UserId,
                ReviewTypeId = Code(CodeConstants.CodeTypes.ReviewType, CodeConstants.ReviewTypes.Human),
                Findings = "Keyboard focus is hard to see in the project editor. (Fictional seed data.)",
                VendorQuestions = "Is a fix for the focus indicator planned for the next release?",
                RiskRatingId = Code(CodeConstants.CodeTypes.AccessibilityRisk, CodeConstants.AccessibilityRisks.Medium),
                ReviewedAt = now.AddDays(-1),
                UpdatedAt = now.AddDays(-1),
            });
        }

        var delphi = db.VettingRequests.FirstOrDefault(r => r.SoftwareName == "Delphi Boards"
            && r.Status.Value == CodeConstants.RequestStatuses.AiReview);
        if (delphi is not null) delphi.AssignedReviewerId = riley.UserId;

        // The seeded "more info needed" request gets the reviewer's question in its history.
        var ember = db.VettingRequests.FirstOrDefault(r => r.SoftwareName == "Ember Forms"
            && r.Status.Value == CodeConstants.RequestStatuses.MoreInfoNeeded);
        if (ember is not null)
        {
            ember.AssignedReviewerId = admin?.UserId ?? riley.UserId;
            var lastChange = db.WorkflowHistory
                .Where(h => h.RequestId == ember.RequestId && h.NewStatusId == ember.StatusId)
                .OrderByDescending(h => h.ChangedAt)
                .FirstOrDefault();
            if (lastChange is not null && lastChange.Comments is null)
            {
                lastChange.ChangedById = ember.AssignedReviewerId.Value;
                lastChange.Comments = "Please attach the vendor's current VPAT for this version, or tell us when "
                    + "the vendor expects to publish one.";
            }
        }
        db.SaveChanges();
    }

    // Gives the seeded software and requests fictional versions (once: while any software has none), and
    // adds a second Northstar Collaborate version so the catalog shows one product with two versions.
    private static void SeedVersions(EocrDbContext db)
    {
        var unversioned = db.Software.Where(s => s.Version == "").OrderBy(s => s.SoftwareId).ToList();
        if (unversioned.Count == 0) return;

        var versions = new[] { "4.2", "2026.1", "3.0", "1.8", "5.5", "2.3a" };
        for (var i = 0; i < unversioned.Count; i++)
            unversioned[i].Version = versions[i % versions.Length];

        foreach (var request in db.VettingRequests.Where(r => r.Version == "").ToList())
            request.Version = $"{1 + request.RequestId % 5}.{request.RequestId % 3}";

        var underReviewId = db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.ApprovalStatus
                && c.Value == CodeConstants.ApprovalStatuses.UnderReview)
            .Select(c => c.CodeId)
            .Single();
        var northstar = unversioned.FirstOrDefault(s => s.SoftwareName == "Northstar Collaborate");
        if (northstar is not null)
        {
            var now = DateTimeOffset.UtcNow;
            db.Software.Add(new Software
            {
                SoftwareName = northstar.SoftwareName,
                VendorName = northstar.VendorName,
                Version = "5.0",
                PublisherWebsite = northstar.PublisherWebsite,
                SoftwareCategoryId = northstar.SoftwareCategoryId,
                BusinessOwnerId = northstar.BusinessOwnerId,
                TechnicalOwnerId = northstar.TechnicalOwnerId,
                CurrentApprovalStatusId = underReviewId,
                Notes = "New major version; review in progress. (Fictional seed data.)",
                CreatedAt = now.AddDays(-4),
                UpdatedAt = now.AddDays(-4),
            });
        }
        db.SaveChanges();
    }

    // Funding source codes (IsSystem = false, admin-managed later). Added by (CodeType, Value) so it is
    // safe on an existing database.
    private static void SeedFundingSources(EocrDbContext db)
    {
        var values = new[]
        {
            ("DepartmentBudget", "Department budget"),
            ("Grant",            "Grant"),
            ("CentralIt",        "Central IT"),
            ("Other",            "Other"),
        };

        var existing = db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.FundingSource)
            .Select(c => c.Value)
            .ToHashSet();

        var sortOrder = 1;
        foreach (var (value, label) in values)
        {
            if (!existing.Contains(value))
            {
                db.Codes.Add(new Code
                {
                    CodeType  = CodeConstants.CodeTypes.FundingSource,
                    Value     = value,
                    Label     = label,
                    SortOrder = sortOrder,
                    IsActive  = true,
                    IsSystem  = false,
                });
            }
            sortOrder++;
        }
        db.SaveChanges();
    }

    // Gives the seeded requests fictional intake fields and a workflow history (once: only while no
    // history exists). Drafts get their start record; submitted requests also get Submitted and, past
    // that, a change to their current status.
    private static void SeedRequestIntake(EocrDbContext db)
    {
        if (db.WorkflowHistory.Any()) return;

        var statuses = db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.RequestStatus)
            .ToDictionary(c => c.Value, c => c.CodeId);
        var fundingIds = db.Codes
            .Where(c => c.CodeType == CodeConstants.CodeTypes.FundingSource)
            .OrderBy(c => c.SortOrder)
            .Select(c => c.CodeId)
            .ToList();
        var departments = new[] { "Library", "School of Nursing", "Facilities", "Student Affairs" };

        var requests = db.VettingRequests.OrderBy(r => r.RequestId).ToList();
        var index = 0;
        foreach (var request in requests)
        {
            var isDraft = request.StatusId == statuses[CodeConstants.RequestStatuses.Draft];

            if (string.IsNullOrEmpty(request.Department))
            {
                request.Department = departments[index % departments.Length];
                request.BusinessNeed = $"Our team needs {request.SoftwareName} for day-to-day work. (Fictional seed data.)";
                request.FundingSourceId = isDraft ? null : fundingIds[index % fundingIds.Count];
                request.Url = $"https://{request.Vendor.ToLowerInvariant().Replace(' ', '-')}.example.com";
                request.VpatSubmitted = index % 2 == 0;
            }

            db.WorkflowHistory.Add(new WorkflowHistory
            {
                RequestId = request.RequestId,
                PreviousStatusId = null,
                NewStatusId = statuses[CodeConstants.RequestStatuses.Draft],
                ChangedById = request.RequestorId,
                ChangedAt = request.CreatedAt,
                Comments = "Request started.",
            });

            if (!isDraft)
            {
                var submittedAt = request.CreatedAt.AddHours(1);
                request.SubmittedAt ??= submittedAt;
                db.WorkflowHistory.Add(new WorkflowHistory
                {
                    RequestId = request.RequestId,
                    PreviousStatusId = statuses[CodeConstants.RequestStatuses.Draft],
                    NewStatusId = statuses[CodeConstants.RequestStatuses.Submitted],
                    ChangedById = request.RequestorId,
                    ChangedAt = submittedAt,
                    Comments = "Request submitted for review.",
                });

                if (request.StatusId != statuses[CodeConstants.RequestStatuses.Submitted])
                {
                    db.WorkflowHistory.Add(new WorkflowHistory
                    {
                        RequestId = request.RequestId,
                        PreviousStatusId = statuses[CodeConstants.RequestStatuses.Submitted],
                        NewStatusId = request.StatusId,
                        ChangedById = request.RequestorId,
                        ChangedAt = request.UpdatedAt,
                        Comments = null,
                    });
                }
            }
            index++;
        }
        db.SaveChanges();
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
