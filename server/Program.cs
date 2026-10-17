using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.Repos;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddOpenApi();

builder.Services.AddDbContext<EocrDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<ICurrentUser, DevCurrentUser>();
builder.Services.AddScoped<IRequestRepo, RequestRepo>();
builder.Services.AddScoped<ISoftwareRepo, SoftwareRepo>();
builder.Services.AddScoped<ICodeRepo, CodeRepo>();
builder.Services.AddScoped<IReviewRepo, ReviewRepo>();
builder.Services.AddScoped<IExceptionRepo, ExceptionRepo>();
builder.Services.AddScoped<IDevUserRepo, DevUserRepo>();
builder.Services.AddScoped<IDevBlobRepo, DevBlobRepo>();

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<EocrDbContext>();
    db.Database.Migrate();
    DevSeeder.Seed(db);
}

app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

// ServiceDefaults maps /health in Development only; App Service's health check needs it everywhere.
if (!app.Environment.IsDevelopment())
{
    app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
}

app.MapControllers();

// Unknown API paths are a 404, not the SPA.
app.MapFallback("/api/{**path}", () => Results.NotFound());

app.MapFallbackToFile("index.html");

app.Run();

// Lets the test project's WebApplicationFactory<Program> see this top-level program.
public partial class Program { }
