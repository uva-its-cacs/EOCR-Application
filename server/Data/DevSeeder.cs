using Eocr.Server.Data.Entities;

namespace Eocr.Server.Data;

public static class DevSeeder
{
    public static void Seed(EocrDbContext db)
    {
        if (db.Users.Any()) return;

        var dana = new User { Email = "dana@example.com", Name = "Dana Example", Role = UserRole.User };
        var sam = new User { Email = "sam@example.com", Name = "Sam Example", Role = UserRole.User };
        var adminUser = new User { Email = "admin@example.com", Name = "Admin Example", Role = UserRole.Admin };

        db.Users.AddRange(dana, sam, adminUser);

        var now = DateTimeOffset.UtcNow;

        db.VettingRequests.AddRange(
            new VettingRequest
            {
                Requestor = dana,
                SoftwareName = "Acme Suite",
                Vendor = "Acme Corp",
                Status = RequestStatus.Approved,
                CreatedAt = now.AddDays(-30),
                UpdatedAt = now.AddDays(-5),
            },
            new VettingRequest
            {
                Requestor = dana,
                SoftwareName = "Buildout Pro",
                Vendor = "Buildout Inc",
                Status = RequestStatus.HumanReview,
                CreatedAt = now.AddDays(-20),
                UpdatedAt = now.AddDays(-2),
            },
            new VettingRequest
            {
                Requestor = dana,
                SoftwareName = "Clover Analytics",
                Vendor = "Clover Tech",
                Status = RequestStatus.Submitted,
                CreatedAt = now.AddDays(-15),
                UpdatedAt = now.AddDays(-15),
            },
            new VettingRequest
            {
                Requestor = dana,
                SoftwareName = "Delphi Boards",
                Vendor = "Delphi Systems",
                Status = RequestStatus.AiReview,
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now.AddDays(-10),
            },
            new VettingRequest
            {
                Requestor = dana,
                SoftwareName = "Ember Forms",
                Vendor = "Ember LLC",
                Status = RequestStatus.MoreInfoNeeded,
                CreatedAt = now.AddDays(-8),
                UpdatedAt = now.AddDays(-1),
            },
            new VettingRequest
            {
                Requestor = dana,
                SoftwareName = "Flux Reporter",
                Vendor = "Flux Co",
                Status = RequestStatus.Draft,
                CreatedAt = now.AddDays(-3),
                UpdatedAt = now.AddDays(-3),
            },
            new VettingRequest
            {
                Requestor = dana,
                SoftwareName = "Granite Maps",
                Vendor = "Granite GIS",
                Status = RequestStatus.Denied,
                CreatedAt = now.AddDays(-60),
                UpdatedAt = now.AddDays(-45),
            },
            new VettingRequest
            {
                Requestor = dana,
                SoftwareName = "Harbor Docs",
                Vendor = "Harbor Group",
                Status = RequestStatus.ApprovedWithConditions,
                CreatedAt = now.AddDays(-90),
                UpdatedAt = now.AddDays(-20),
            },
            // Sam's requests — must not appear in Dana's dashboard
            new VettingRequest
            {
                Requestor = sam,
                SoftwareName = "Iris Tools",
                Vendor = "Iris Dev",
                Status = RequestStatus.Submitted,
                CreatedAt = now.AddDays(-5),
                UpdatedAt = now.AddDays(-5),
            },
            new VettingRequest
            {
                Requestor = sam,
                SoftwareName = "Jasper CMS",
                Vendor = "Jasper Web",
                Status = RequestStatus.Draft,
                CreatedAt = now.AddDays(-1),
                UpdatedAt = now.AddDays(-1),
            }
        );

        db.SaveChanges();
    }
}
