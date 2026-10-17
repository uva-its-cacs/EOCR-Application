using Eocr.Server.Data;

namespace Eocr.Server.Auth;

// The User Roles matrix in one place. Controllers and repos ask these helpers instead of comparing role
// codes inline.
//   User        own requests only.
//   Admin       read-only staff: sees the queue, reviews, catalog and code lists, changes nothing.
//   SysAdmin    staff with full CRUD (the review workflow, software edit, code lists).
//   SuperAdmin  everything SysAdmin has, plus (later) email templates and role management.
public static class Roles
{
    // Role codes that may change data and run the review workflow. Arrays so EF queries can use Contains.
    public static readonly string[] WriterRoles = [CodeConstants.UserRoles.SysAdmin, CodeConstants.UserRoles.SuperAdmin];

    public static readonly string[] StaffRoles = [CodeConstants.UserRoles.Admin, .. WriterRoles];

    // May read staff data (the queue, reviews, the full software list, code lists).
    public static bool IsStaff(string? roleCode) => roleCode is not null && StaffRoles.Contains(roleCode);

    // May change data and run the workflow.
    public static bool CanWrite(string? roleCode) => roleCode is not null && WriterRoles.Contains(roleCode);

    public static bool IsSuperAdmin(string? roleCode) => roleCode == CodeConstants.UserRoles.SuperAdmin;
}
