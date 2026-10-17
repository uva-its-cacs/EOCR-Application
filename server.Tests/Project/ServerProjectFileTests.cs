using System.Xml.Linq;
using Xunit;

namespace Eocr.Server.Tests.Project;

// Guards server/Eocr.Server.csproj against a stale save. An editor or IDE that held an old copy of the file
// overwrote it twice (commits a8653f8 and 96f64a2), silently dropping the settings below. dotnet test, and
// the deploy workflow that runs it, now fail the moment any of them goes missing.
public class ServerProjectFileTests
{
    private static readonly XDocument Project = Load();

    private static XDocument Load()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "EOCR.slnx")))
            dir = dir.Parent;

        Assert.True(dir is not null, "Could not find the repo root (EOCR.slnx) above the test output.");

        var path = Path.Combine(dir.FullName, "server", "Eocr.Server.csproj");
        Assert.True(File.Exists(path), $"Missing {path}");
        return XDocument.Load(path);
    }

    private static string? PackageVersion(string package) => Project.Descendants("PackageReference")
        .FirstOrDefault(p => string.Equals((string?)p.Attribute("Include"), package, StringComparison.OrdinalIgnoreCase))
        ?.Attribute("Version")?.Value;

    [Fact]
    public void Has_a_user_secrets_id_so_dev_secrets_are_loaded()
    {
        var id = Project.Descendants("UserSecretsId").FirstOrDefault()?.Value;

        Assert.False(string.IsNullOrWhiteSpace(id),
            "server/Eocr.Server.csproj lost its <UserSecretsId>; dotnet user-secrets values are no longer loaded.");
    }

    [Theory]
    [InlineData("Azure.Storage.Blobs")]
    [InlineData("Azure.Identity")]
    public void References_the_blob_storage_packages(string package) =>
        Assert.False(string.IsNullOrWhiteSpace(PackageVersion(package)),
            $"server/Eocr.Server.csproj lost its reference to {package}; the blob storage code no longer compiles.");

    [Fact]
    public void Keeps_the_patched_Pkcs_pin_for_the_SqlClient_CVEs()
    {
        // Pins the transitive dependency of Microsoft.Data.SqlClient (CVE-2026-84008, CVE-2026-70162).
        var version = PackageVersion("System.Security.Cryptography.Pkcs");

        Assert.False(string.IsNullOrWhiteSpace(version),
            "server/Eocr.Server.csproj lost the System.Security.Cryptography.Pkcs pin (CVE-2026-84008, CVE-2026-70162).");
        Assert.True(Version.Parse(version) >= new Version(10, 0, 13),
            $"System.Security.Cryptography.Pkcs is {version}; it must stay at 10.0.13 or later.");
    }
}
