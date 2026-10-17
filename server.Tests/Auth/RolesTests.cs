using Eocr.Server.Auth;
using Xunit;

namespace Eocr.Server.Tests.Auth;

public class RolesTests
{
    [Theory]
    [InlineData("Admin", true)]
    [InlineData("SysAdmin", true)]
    [InlineData("SuperAdmin", true)]
    [InlineData("User", false)]
    [InlineData("admin", false)] // role codes compare exactly: no case folding
    [InlineData("3", false)] // never an id
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsStaff_matches_exactly_the_staff_roles(string? roleCode, bool expected) =>
        Assert.Equal(expected, Roles.IsStaff(roleCode));

    [Theory]
    [InlineData("Admin", false)] // read-only
    [InlineData("SysAdmin", true)]
    [InlineData("SuperAdmin", true)]
    [InlineData("User", false)]
    [InlineData("sysadmin", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void CanWrite_is_limited_to_sys_admin_and_super_admin(string? roleCode, bool expected) =>
        Assert.Equal(expected, Roles.CanWrite(roleCode));

    [Theory]
    [InlineData("SuperAdmin", true)]
    [InlineData("SysAdmin", false)]
    [InlineData("Admin", false)]
    [InlineData("User", false)]
    [InlineData(null, false)]
    public void IsSuperAdmin_is_only_super_admin(string? roleCode, bool expected) =>
        Assert.Equal(expected, Roles.IsSuperAdmin(roleCode));

    [Fact]
    public void Every_writer_is_staff()
    {
        foreach (var role in Roles.WriterRoles)
            Assert.True(Roles.IsStaff(role), role);
    }
}
