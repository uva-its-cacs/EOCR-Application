using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.Features.Requests;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<EocrDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<ICurrentUser, DevCurrentUser>();
builder.Services.AddScoped<IRequestService, RequestService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<EocrDbContext>();
    db.Database.Migrate();
    DevSeeder.Seed(db);
}

app.UseHttpsRedirection();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

app.MapGet("/api/me", async (ICurrentUser currentUser, EocrDbContext db, CancellationToken ct) =>
{
    var ctx = await currentUser.GetAsync(ct);
    if (ctx is null)
        return Results.Unauthorized();

    var user = await db.Users
        .Where(u => u.Id == ctx.Id)
        .Select(u => new { u.Id, u.Name, u.Email, Role = u.Role.ToString() })
        .FirstOrDefaultAsync(ct);

    return user is null ? Results.Unauthorized() : Results.Ok(user);
});

RequestEndpoints.MapRoutes(app);

app.Run();
