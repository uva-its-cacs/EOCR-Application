using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eocr.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRequestIntake : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BusinessNeed",
                table: "VettingRequests",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "VettingRequests",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "FundingSourceId",
                table: "VettingRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SoftwareId",
                table: "VettingRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "SubmittedAt",
                table: "VettingRequests",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Url",
                table: "VettingRequests",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "VpatSubmitted",
                table: "VettingRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "WorkflowHistory",
                columns: table => new
                {
                    WorkflowHistoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestId = table.Column<int>(type: "int", nullable: false),
                    PreviousStatusId = table.Column<int>(type: "int", nullable: true),
                    NewStatusId = table.Column<int>(type: "int", nullable: false),
                    ChangedById = table.Column<int>(type: "int", nullable: false),
                    ChangedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowHistory", x => x.WorkflowHistoryId);
                    table.ForeignKey(
                        name: "FK_WorkflowHistory_Codes_NewStatusId",
                        column: x => x.NewStatusId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkflowHistory_Codes_PreviousStatusId",
                        column: x => x.PreviousStatusId,
                        principalTable: "Codes",
                        principalColumn: "CodeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkflowHistory_Users_ChangedById",
                        column: x => x.ChangedById,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkflowHistory_VettingRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "VettingRequests",
                        principalColumn: "RequestId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VettingRequests_FundingSourceId",
                table: "VettingRequests",
                column: "FundingSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_VettingRequests_SoftwareId",
                table: "VettingRequests",
                column: "SoftwareId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowHistory_ChangedById",
                table: "WorkflowHistory",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowHistory_NewStatusId",
                table: "WorkflowHistory",
                column: "NewStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowHistory_PreviousStatusId",
                table: "WorkflowHistory",
                column: "PreviousStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowHistory_RequestId_ChangedAt",
                table: "WorkflowHistory",
                columns: new[] { "RequestId", "ChangedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_VettingRequests_Codes_FundingSourceId",
                table: "VettingRequests",
                column: "FundingSourceId",
                principalTable: "Codes",
                principalColumn: "CodeId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VettingRequests_Software_SoftwareId",
                table: "VettingRequests",
                column: "SoftwareId",
                principalTable: "Software",
                principalColumn: "SoftwareId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VettingRequests_Codes_FundingSourceId",
                table: "VettingRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_VettingRequests_Software_SoftwareId",
                table: "VettingRequests");

            migrationBuilder.DropTable(
                name: "WorkflowHistory");

            migrationBuilder.DropIndex(
                name: "IX_VettingRequests_FundingSourceId",
                table: "VettingRequests");

            migrationBuilder.DropIndex(
                name: "IX_VettingRequests_SoftwareId",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "BusinessNeed",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "FundingSourceId",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "SoftwareId",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "Url",
                table: "VettingRequests");

            migrationBuilder.DropColumn(
                name: "VpatSubmitted",
                table: "VettingRequests");
        }
    }
}
