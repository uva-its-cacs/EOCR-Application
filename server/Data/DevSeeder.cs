using Eocr.Server.Data.Entities;

namespace Eocr.Server.Data;

public static class DevSeeder
{
    public static void Seed(EocrDbContext db)
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
            new Request
            {
                Requestor = dana,
                SoftwareName = "Acme Suite",
                Vendor = "Acme Corp",
                StatusId = StatusId(CodeConstants.RequestStatuses.Approved),
                CreatedAt = now.AddDays(-30),
                UpdatedAt = now.AddDays(-5),
            },
            new Request
            {
                Requestor = dana,
                SoftwareName = "Buildout Pro",
                Vendor = "Buildout Inc",
                StatusId = StatusId(CodeConstants.RequestStatuses.HumanReview),
                CreatedAt = now.AddDays(-20),
                UpdatedAt = now.AddDays(-2),
            },
            new Request
            {
                Requestor = dana,
                SoftwareName = "Clover Analytics",
                Vendor = "Clover Tech",
                StatusId = StatusId(CodeConstants.RequestStatuses.Submitted),
                CreatedAt = now.AddDays(-15),
                UpdatedAt = now.AddDays(-15),
            },
            new Request
            {
                Requestor = dana,
                SoftwareName = "Delphi Boards",
                Vendor = "Delphi Systems",
                StatusId = StatusId(CodeConstants.RequestStatuses.AiReview),
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now.AddDays(-10),
            },
            new Request
            {
                Requestor = dana,
                SoftwareName = "Ember Forms",
                Vendor = "Ember LLC",
                StatusId = StatusId(CodeConstants.RequestStatuses.MoreInfoNeeded),
                CreatedAt = now.AddDays(-8),
                UpdatedAt = now.AddDays(-1),
            },
            new Request
            {
                Requestor = dana,
                SoftwareName = "Flux Reporter",
                Vendor = "Flux Co",
                StatusId = StatusId(CodeConstants.RequestStatuses.Draft),
                CreatedAt = now.AddDays(-3),
                UpdatedAt = now.AddDays(-3),
            },
            new Request
            {
                Requestor = dana,
                SoftwareName = "Granite Maps",
                Vendor = "Granite GIS",
                StatusId = StatusId(CodeConstants.RequestStatuses.Denied),
                CreatedAt = now.AddDays(-60),
                UpdatedAt = now.AddDays(-45),
            },
            new Request
            {
                Requestor = dana,
                SoftwareName = "Harbor Docs",
                Vendor = "Harbor Group",
                StatusId = StatusId(CodeConstants.RequestStatuses.ApprovedWithConditions),
                CreatedAt = now.AddDays(-90),
                UpdatedAt = now.AddDays(-20),
            },
            // Sam's requests — must not appear in Dana's dashboard
            new Request
            {
                Requestor = sam,
                SoftwareName = "Iris Tools",
                Vendor = "Iris Dev",
                StatusId = StatusId(CodeConstants.RequestStatuses.Submitted),
                CreatedAt = now.AddDays(-5),
                UpdatedAt = now.AddDays(-5),
            },
            new Request
            {
                Requestor = sam,
                SoftwareName = "Jasper CMS",
                Vendor = "Jasper Web",
                StatusId = StatusId(CodeConstants.RequestStatuses.Draft),
                CreatedAt = now.AddDays(-1),
                UpdatedAt = now.AddDays(-1),
            }
        );

        db.SaveChanges();
    }
}
