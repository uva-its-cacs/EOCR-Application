using Eocr.Server.Auth;
using Eocr.Server.Data;
using Eocr.Server.Repos;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<EocrDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddControllers();

builder.Services.AddScoped<ICurrentUser, DevCurrentUser>();
builder.Services.AddScoped<IRequestRepo, RequestRepo>();
builder.Services.AddScoped<ISoftwareRepo, SoftwareRepo>();
builder.Services.AddScoped<ICodeRepo, CodeRepo>();

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

app.MapControllers();

app.Run();
