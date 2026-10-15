using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Eocr.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddExceptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Exceptions",
                columns: table => new
                {
                    ExceptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestId = table.Column<int>(type: "int", nullable: false),
                    SoftwareId = table.Column<int>(type: "int", nullable: true),
                    RequestorId = table.Column<int>(type: "int", nullable: false),
                    BusinessJustification = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    AccessibilityImpact = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    MitigationPlan = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    SubmittedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApprovalDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpirationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exceptions", x => x.ExceptionId);
                    table.ForeignKey(
                        name: "FK_Exceptions_Codes_StatusId",
                        column: x => x.StatusId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Exceptions_Software_SoftwareId",
                        column: x => x.SoftwareId,
                        principalTable: "Software",
                        principalColumn: "SoftwareId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Exceptions_Users_RequestorId",
                        column: x => x.RequestorId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Exceptions_VettingRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "VettingRequests",
                        principalColumn: "RequestId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Codes",
                columns: new[] { "CodeId", "CodeType", "Description", "IsActive", "IsSystem", "Label", "SortOrder", "Value" },
                values: new object[,]
                {
                    { 601, "ExceptionStatus", null, true, true, "Requested", 1, "Requested" },
                    { 602, "ExceptionStatus", null, true, true, "Submitted", 2, "Submitted" },
                    { 603, "ExceptionStatus", null, true, true, "Approved", 3, "Approved" },
                    { 604, "ExceptionStatus", null, true, true, "Denied", 4, "Denied" },
                    { 605, "ExceptionStatus", null, true, true, "Withdrawn", 5, "Withdrawn" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Exceptions_RequestId",
                table: "Exceptions",
                column: "RequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Exceptions_RequestorId",
                table: "Exceptions",
                column: "RequestorId");

            migrationBuilder.CreateIndex(
                name: "IX_Exceptions_SoftwareId",
                table: "Exceptions",
                column: "SoftwareId");

            migrationBuilder.CreateIndex(
                name: "IX_Exceptions_StatusId",
                table: "Exceptions",
                column: "StatusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Exceptions");

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 601);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 602);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 603);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 604);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 605);
        }
    }
}
