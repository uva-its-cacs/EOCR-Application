using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eocr.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftwareVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VettingRequests_Users_RequestorId",
                table: "VettingRequests");

            migrationBuilder.AddColumn<string>(
                name: "Version",
                table: "VettingRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Version",
                table: "Software",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Software_SoftwareName_VendorName_Version",
                table: "Software",
                columns: new[] { "SoftwareName", "VendorName", "Version" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_VettingRequests_Users_RequestorId",
                table: "VettingRequests",
                column: "RequestorId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VettingRequests_Users_RequestorId",
                table: "VettingRequests");

            migrationBuilder.DropIndex(
                name: "IX_Software_SoftwareName_VendorName_Version",
                table: "Software");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Software");

            migrationBuilder.AddForeignKey(
                name: "FK_VettingRequests_Users_RequestorId",
                table: "VettingRequests",
                column: "RequestorId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
