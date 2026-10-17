using Eocr.Server.Data;
using Eocr.Server.Data.Entities;

namespace Eocr.Server.Tests.Infrastructure;

// Seed helpers. Everything here is fictional. The system codes (roles, statuses, approval statuses) are
// already in the database from the model's HasData.
public static class TestData
{
    // One user per role.
    public const string UserEmail = "user@test.example";
    public const string AdminEmail = "admin@test.example";
    public const string SysAdminEmail = "sysadmin@test.example";
    public const string SuperAdminEmail = "superadmin@test.example";

    public static readonly (string Email, string RoleCode)[] Users =
    [
        (UserEmail, CodeConstants.UserRoles.User),
        (AdminEmail, CodeConstants.UserRoles.Admin),
        (SysAdminEmail, CodeConstants.UserRoles.SysAdmin),
        (SuperAdminEmail, CodeConstants.UserRoles.SuperAdmin),
    ];

    public static int CodeId(EocrDbContext db, string codeType, string value) => db.Codes
        .Where(c => c.CodeType == codeType && c.Value == value)
        .Select(c => c.CodeId)
        .Single();

    // Adds the four role users (once per database).
    public static void SeedRoleUsers(EocrDbContext db)
    {
        foreach (var (email, roleCode) in Users)
        {
            if (db.Users.Any(u => u.Email == email)) continue;

            db.Users.Add(new User
            {
                Email = email,
                Name = email[..email.IndexOf('@')],
                RoleId = CodeId(db, CodeConstants.CodeTypes.UserRole, roleCode),
            });
        }
        db.SaveChanges();
    }

    // A catalog row, with a unique name so a test can edit it without touching another test's data.
    public static Software AddSoftware(EocrDbContext db, string softwareName)
    {
        var now = DateTimeOffset.UtcNow;
        var software = new Software
        {
            SoftwareName = softwareName,
            VendorName = "Test Vendor",
            Version = "1.0",
            CurrentApprovalStatusId = CodeId(
                db, CodeConstants.CodeTypes.ApprovalStatus, CodeConstants.ApprovalStatuses.NotReviewed),
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.Software.Add(software);
        db.SaveChanges();
        return software;
    }

    // A submitted request in the given status, from the User.
    public static Request AddRequest(EocrDbContext db, string statusCode)
    {
        var now = DateTimeOffset.UtcNow;
        var request = new Request
        {
            Requestor = db.Users.Single(u => u.Email == UserEmail),
            SoftwareName = "Test Suite",
            Vendor = "Test Vendor",
            Version = "1.0",
            Department = "Test Department",
            BusinessNeed = "Testing.",
            StatusId = CodeId(db, CodeConstants.CodeTypes.RequestStatus, statusCode),
            SubmittedAt = now,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.VettingRequests.Add(request);
        db.SaveChanges();
        return request;
    }
}
