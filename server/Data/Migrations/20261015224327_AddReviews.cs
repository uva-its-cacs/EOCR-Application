using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Eocr.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedReviewerId",
                table: "VettingRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Conditions",
                table: "Software",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    ReviewId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestId = table.Column<int>(type: "int", nullable: false),
                    ReviewerId = table.Column<int>(type: "int", nullable: false),
                    ReviewTypeId = table.Column<int>(type: "int", nullable: false),
                    VendorQuestions = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    OverallAssessment = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Findings = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RiskRatingId = table.Column<int>(type: "int", nullable: true),
                    RecommendationId = table.Column<int>(type: "int", nullable: true),
                    Conditions = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.ReviewId);
                    table.ForeignKey(
                        name: "FK_Reviews_Codes_RecommendationId",
                        column: x => x.RecommendationId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Codes_ReviewTypeId",
                        column: x => x.ReviewTypeId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Codes_RiskRatingId",
                        column: x => x.RiskRatingId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_VettingRequests_RequestId",
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
                    { 401, "ReviewType", null, true, true, "AI review", 1, "Ai" },
                    { 402, "ReviewType", null, true, true, "Human review", 2, "Human" },
                    { 501, "Recommendation", null, true, true, "Approve", 1, "Approve" },
                    { 502, "Recommendation", null, true, true, "Approve with conditions", 2, "ApproveWithConditions" },
                    { 503, "Recommendation", null, true, true, "Deny", 3, "Deny" },
                    { 504, "Recommendation", null, true, true, "Exception (EEAAP) needed", 4, "ExceptionNeeded" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_VettingRequests_AssignedReviewerId",
                table: "VettingRequests",
                column: "AssignedReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_RecommendationId",
                table: "Reviews",
                column: "RecommendationId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_RequestId",
                table: "Reviews",
                column: "RequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewerId",
                table: "Reviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewTypeId",
                table: "Reviews",
                column: "ReviewTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_RiskRatingId",
                table: "Reviews",
                column: "RiskRatingId");

            migrationBuilder.AddForeignKey(
                name: "FK_VettingRequests_Users_AssignedReviewerId",
                table: "VettingRequests",
                column: "AssignedReviewerId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VettingRequests_Users_AssignedReviewerId",
                table: "VettingRequests");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_VettingRequests_AssignedReviewerId",
                table: "VettingRequests");

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 401);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 402);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 501);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 502);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 503);

            migrationBuilder.DeleteData(
                table: "Codes",
                keyColumn: "CodeId",
                keyValue: 504);

            migrationBuilder.DropColumn(
                name: "AssignedReviewerId",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "Conditions",
                table: "Software");
        }
    }
}
