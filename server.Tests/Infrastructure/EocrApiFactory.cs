using Eocr.Server.Auth;
using Eocr.Server.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Eocr.Server.Tests.Infrastructure;

// The API on an in-memory SQLite database (each factory has its own), acting as the user named by the
// X-Test-User header. Runs in the "Testing" environment, so Program.cs neither migrates nor seeds; the
// system codes come from the model's HasData through EnsureCreated, and tests add the rest (TestData).
public class EocrApiFactory : WebApplicationFactory<Program>
{
    public const string UserHeader = "X-Test-User";

    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    public EocrApiFactory()
    {
        // An in-memory SQLite database lives as long as its connection stays open.
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // AddDbContext registers the options, an options configuration (the SQL Server call) and the
            // context itself; all three go so only SQLite is configured.
            services.RemoveAll(typeof(DbContextOptions<EocrDbContext>));
            services.RemoveAll(typeof(IDbContextOptionsConfiguration<EocrDbContext>));
            services.RemoveAll(typeof(EocrDbContext));

            services.AddDbContext<EocrDbContext>(options => options
                .UseSqlite(_connection)
                // SQLite cannot ORDER BY a DateTimeOffset; store them as numbers (tests only).
                .ReplaceService<IModelCustomizer, DateTimeOffsetModelCustomizer>());

            services.RemoveAll(typeof(ICurrentUser));
            services.AddScoped<ICurrentUser, HeaderCurrentUser>();
        });
    }

    // Creates the schema (and the seeded system codes) once, then hands a scope to the caller.
    public void Seed(Action<EocrDbContext> seed)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EocrDbContext>();
        db.Database.EnsureCreated();
        seed(db);
        db.SaveChanges();
    }

    public HttpClient CreateClientFor(string email)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(UserHeader, email);
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

// Gives every DateTimeOffset property a numeric column in SQLite so ordering and comparing work.
internal class DateTimeOffsetModelCustomizer(ModelCustomizerDependencies dependencies)
    : ModelCustomizer(dependencies)
{
    public override void Customize(ModelBuilder modelBuilder, DbContext context)
    {
        base.Customize(modelBuilder, context);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties()
                .Where(p => p.ClrType == typeof(DateTimeOffset) || p.ClrType == typeof(DateTimeOffset?)))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property(property.Name)
                    .HasConversion(new DateTimeOffsetToBinaryConverter());
            }
        }
    }
}

// The test stand-in for sign-in: the user named by the X-Test-User header, or nobody (401).
internal class HeaderCurrentUser(EocrDbContext db, IHttpContextAccessor http) : ICurrentUser
{
    public async Task<CurrentUserContext?> GetAsync(CancellationToken ct = default)
    {
        var email = http.HttpContext?.Request.Headers[EocrApiFactory.UserHeader].ToString();
        if (string.IsNullOrWhiteSpace(email)) return null;

        var user = await db.Users
            .Where(u => u.Email == email)
            .Select(u => new { u.UserId, RoleCode = u.Role.Value })
            .FirstOrDefaultAsync(ct);

        return user is null
            ? null
            : new CurrentUserContext { UserId = user.UserId, RoleCode = user.RoleCode };
    }
}
