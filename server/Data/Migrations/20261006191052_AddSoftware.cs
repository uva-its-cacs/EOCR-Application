using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Eocr.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftware : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Software",
                columns: table => new
                {
                    SoftwareId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SoftwareName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    VendorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PublisherWebsite = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SoftwareCategoryId = table.Column<int>(type: "int", nullable: true),
                    BusinessOwnerId = table.Column<int>(type: "int", nullable: true),
                    TechnicalOwnerId = table.Column<int>(type: "int", nullable: true),
                    CurrentApprovalStatusId = table.Column<int>(type: "int", nullable: false),
                    AccessibilityRiskId = table.Column<int>(type: "int", nullable: true),
                    ApprovalDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ApprovalExpirationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Software", x => x.SoftwareId);
                    table.ForeignKey(
                        name: "FK_Software_Codes_AccessibilityRiskId",
                        column: x => x.AccessibilityRiskId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Software_Codes_CurrentApprovalStatusId",
                        column: x => x.CurrentApprovalStatusId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Software_Codes_SoftwareCategoryId",
                        column: x => x.SoftwareCategoryId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Software_Users_BusinessOwnerId",
                        column: x => x.BusinessOwnerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Software_Users_TechnicalOwnerId",
                        column: x => x.TechnicalOwnerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Codes",
                columns: new[] { "CodeId", "CodeType", "Description", "IsActive", "IsSystem", "Label", "SortOrder", "Value" },
                values: new object[,]
                {
                    { 201, "ApprovalStatus", null, true, true, "Not reviewed", 1, "NotReviewed" },
                    { 202, "ApprovalStatus", null, true, true, "Under review", 2, "UnderReview" },
                    { 203, "ApprovalStatus", null, true, true, "Approved", 3, "Approved" },
                    { 204, "ApprovalStatus", null, true, true, "Approved with conditions", 4, "ApprovedWithConditions" },
                    { 205, "ApprovalStatus", null, true, true, "Denied", 5, "Denied" },
                    { 206, "ApprovalStatus", null, true, true, "Expired", 6, "Expired" },
                    { 301, "AccessibilityRisk", null, true, true, "Low", 1, "Low" },
                    { 302, "AccessibilityRisk", null, true, true, "Medium", 2, "Medium" },
                    { 303, "AccessibilityRisk", null, true, true, "High", 3, "High" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Software_AccessibilityRiskId",
                table: "Software",
                column: "AccessibilityRiskId");

            migrationBuilder.CreateIndex(
                name: "IX_Software_BusinessOwnerId",
                table: "Software",
                column: "BusinessOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Software_CurrentApprovalStatusId",
                table: "Software",
                column: "CurrentApprovalStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_Software_SoftwareCategoryId",
                table: "Software",
                column: "SoftwareCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Software_SoftwareName",
                table: "Software",
                column: "SoftwareName");

            migrationBuilder.CreateIndex(
                name: "IX_Software_TechnicalOwnerId",
                table: "Software",
                column: "TechnicalOwnerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Software");

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 201);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 202);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 203);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 204);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 205);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 206);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 301);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 302);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 303);
        }
    }
}
