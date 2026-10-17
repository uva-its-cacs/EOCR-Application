using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Eocr.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Codes",
                columns: new[] { "CodeId", "CodeType", "Description", "IsActive", "IsSystem", "Label", "SortOrder", "Value" },
                values: new object[,]
                {
                    { 3, "UserRole", null, true, true, "Sys Admin", 3, "SysAdmin" },
                    { 4, "UserRole", null, true, true, "Super Admin", 4, "SuperAdmin" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 4);
        }
    }
}
