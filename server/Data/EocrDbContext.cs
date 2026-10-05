using Eocr.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eocr.Server.Data;

public sealed class EocrDbContext(DbContextOptions<EocrDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<VettingRequest> VettingRequests => Set<VettingRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.Name).HasMaxLength(200);
            e.Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(50);
        });

        modelBuilder.Entity<VettingRequest>(e =>
        {
            e.Property(r => r.SoftwareName).HasMaxLength(200);
            e.Property(r => r.Vendor).HasMaxLength(200);
            e.Property(r => r.Status)
                .HasConversion<string>()
                .HasMaxLength(50);
            e.HasOne(r => r.Requestor)
                .WithMany(u => u.VettingRequests)
                .HasForeignKey(r => r.RequestorId);
        });
    }
}
