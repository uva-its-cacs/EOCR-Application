using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Eocr.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Codes",
                columns: table => new
                {
                    CodeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsSystem = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Codes", x => x.CodeId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Users_Codes_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VettingRequests",
                columns: table => new
                {
                    RequestId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestorId = table.Column<int>(type: "int", nullable: false),
                    SoftwareName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Vendor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StatusId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VettingRequests", x => x.RequestId);
                    table.ForeignKey(
                        name: "FK_VettingRequests_Codes_StatusId",
                        column: x => x.StatusId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VettingRequests_Users_RequestorId",
                        column: x => x.RequestorId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Codes",
                columns: new[] { "CodeId", "CodeType", "Description", "IsActive", "IsSystem", "Label", "SortOrder", "Value" },
                values: new object[,]
                {
                    { 1, "UserRole", null, true, true, "User", 1, "User" },
                    { 2, "UserRole", null, true, true, "Admin", 2, "Admin" },
                    { 101, "RequestStatus", null, true, true, "Draft", 1, "Draft" },
                    { 102, "RequestStatus", null, true, true, "Submitted", 2, "Submitted" },
                    { 103, "RequestStatus", null, true, true, "AI Review", 3, "AiReview" },
                    { 104, "RequestStatus", null, true, true, "Human Review", 4, "HumanReview" },
                    { 105, "RequestStatus", null, true, true, "More Info Needed", 5, "MoreInfoNeeded" },
                    { 106, "RequestStatus", null, true, true, "Awaiting EEAAP", 6, "AwaitingEeaap" },
                    { 107, "RequestStatus", null, true, true, "Approved", 7, "Approved" },
                    { 108, "RequestStatus", null, true, true, "Approved with Conditions", 8, "ApprovedWithConditions" },
                    { 109, "RequestStatus", null, true, true, "Denied", 9, "Denied" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Codes_CodeType_Value",
                table: "Codes",
                columns: new[] { "CodeType", "Value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_VettingRequests_RequestorId",
                table: "VettingRequests",
                column: "RequestorId");

            migrationBuilder.CreateIndex(
                name: "IX_VettingRequests_StatusId",
                table: "VettingRequests",
                column: "StatusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VettingRequests");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Codes");
        }
    }
}
