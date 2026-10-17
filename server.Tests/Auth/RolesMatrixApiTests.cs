using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Eocr.Server.Data;
using Eocr.Server.DTOs;
using Eocr.Server.Tests.Infrastructure;
using Xunit;

namespace Eocr.Server.Tests.Auth;

// The User Roles matrix (issue #23) through the real controllers: User sees only their own data, Admin is
// read-only staff, SysAdmin and SuperAdmin have full CRUD.
public class RolesMatrixApiTests(SeededApiFactory factory) : IClassFixture<SeededApiFactory>
{
    private readonly SeededApiFactory _factory = factory;

    private int ReadOnlyRequestId => _factory.ReadOnlyRequestId;

    // Staff may read; a User may not; nobody signed in gets 401.
    [Theory]
    [InlineData(TestData.UserEmail, HttpStatusCode.Forbidden)]
    [InlineData(TestData.AdminEmail, HttpStatusCode.OK)]
    [InlineData(TestData.SysAdminEmail, HttpStatusCode.OK)]
    [InlineData(TestData.SuperAdminEmail, HttpStatusCode.OK)]
    public async Task Staff_reads_are_open_to_every_staff_role_and_closed_to_a_user(string email, HttpStatusCode expected)
    {
        var client = _factory.CreateClientFor(email);

        foreach (var path in new[]
        {
            "/api/admin/requests",
            $"/api/admin/requests/{ReadOnlyRequestId}",
            "/api/admin/reviewers",
            "/api/software",
            "/api/software/owners",
            "/api/codes/RequestStatus",
        })
            Assert.Equal(expected, (await client.GetAsync(path, TestContext.Current.CancellationToken)).StatusCode);
    }

    [Fact]
    public async Task Nobody_signed_in_gets_401()
    {
        var response = await _factory.CreateClient().GetAsync("/api/admin/requests", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // Writes need SysAdmin or SuperAdmin: the read-only Admin and the User get 403.
    [Theory]
    [InlineData(TestData.UserEmail, false)]
    [InlineData(TestData.AdminEmail, false)]
    [InlineData(TestData.SysAdminEmail, true)]
    [InlineData(TestData.SuperAdminEmail, true)]
    public async Task Workflow_writes_need_a_writer_role(string email, bool allowed)
    {
        var client = _factory.CreateClientFor(email);
        // A fresh request per step, so one step's status change cannot affect the next.
        var (reviewId, _) = await NewHumanReviewRequestAsync();
        var (assignId, assignUpdatedAt) = await NewHumanReviewRequestAsync();
        var (infoId, infoUpdatedAt) = await NewHumanReviewRequestAsync();

        var save = await client.PutAsJsonAsync($"/api/admin/requests/{reviewId}/review", new SaveReviewDto(), cancellationToken: TestContext.Current.CancellationToken);
        var assign = await client.PostAsJsonAsync(
            $"/api/admin/requests/{assignId}/assign", new AssignRequestDto { UpdatedAt = assignUpdatedAt }, cancellationToken: TestContext.Current.CancellationToken);
        var info = await client.PostAsJsonAsync(
            $"/api/admin/requests/{infoId}/request-info",
            new RequestActionDto { Comments = "More detail please.", UpdatedAt = infoUpdatedAt },
            cancellationToken: TestContext.Current.CancellationToken);

        if (allowed)
        {
            Assert.Equal(HttpStatusCode.OK, save.StatusCode);
            Assert.NotEqual(HttpStatusCode.Forbidden, assign.StatusCode);
            Assert.NotEqual(HttpStatusCode.Forbidden, info.StatusCode);
        }
        else
        {
            Assert.Equal(HttpStatusCode.Forbidden, save.StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, assign.StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, info.StatusCode);
        }
    }

    [Theory]
    [InlineData(TestData.UserEmail, HttpStatusCode.Forbidden)]
    [InlineData(TestData.AdminEmail, HttpStatusCode.Forbidden)]
    [InlineData(TestData.SysAdminEmail, HttpStatusCode.OK)]
    [InlineData(TestData.SuperAdminEmail, HttpStatusCode.OK)]
    public async Task Software_edit_needs_a_writer_role(string email, HttpStatusCode expected)
    {
        // A fresh row per call, so each case starts from a current UpdatedAt.
        var softwareId = 0;
        DateTimeOffset updatedAt = default;
        _factory.Seed(db =>
        {
            var row = TestData.AddSoftware(db, "Edit Target " + email);
            softwareId = row.SoftwareId;
            updatedAt = row.UpdatedAt;
        });
        var input = new UpdateSoftwareDto
        {
            SoftwareName = "Edit Target " + email,
            VendorName = "Test Vendor",
            Version = "1.0",
            CurrentApprovalStatusId = 201,
            UpdatedAt = updatedAt,
        };

        var response = await _factory.CreateClientFor(email).PutAsJsonAsync($"/api/software/{softwareId}", input, TestContext.Current.CancellationToken);

        Assert.Equal(expected, response.StatusCode);
    }

    // The review page is driven by allowedActions: a read-only Admin is offered none.
    [Theory]
    [InlineData(TestData.AdminEmail, false)]
    [InlineData(TestData.SysAdminEmail, true)]
    [InlineData(TestData.SuperAdminEmail, true)]
    public async Task Allowed_actions_are_empty_for_the_read_only_admin(string email, bool hasActions)
    {
        var detail = await _factory.CreateClientFor(email)
            .GetFromJsonAsync<AdminRequestDetailDto>($"/api/admin/requests/{ReadOnlyRequestId}", TestContext.Current.CancellationToken);

        Assert.NotNull(detail);
        Assert.Equal(hasActions, detail.AllowedActions.Count > 0);
    }

    [Fact]
    public async Task Only_writers_are_offered_as_reviewers()
    {
        var reviewers = await _factory.CreateClientFor(TestData.SysAdminEmail)
            .GetFromJsonAsync<List<ReviewerOptionDto>>("/api/admin/reviewers", TestContext.Current.CancellationToken);

        Assert.NotNull(reviewers);
        var names = reviewers.Select(r => r.Name).OrderBy(n => n).ToList();
        Assert.Equal(["superadmin", "sysadmin"], names);
    }

    [Fact]
    public async Task Assigning_a_request_to_the_read_only_admin_is_refused()
    {
        var (requestId, updatedAt) = await NewHumanReviewRequestAsync();
        var adminId = 0;
        _factory.Seed(db => adminId = db.Users.Single(u => u.Email == TestData.AdminEmail).UserId);

        var response = await _factory.CreateClientFor(TestData.SysAdminEmail).PostAsJsonAsync(
            $"/api/admin/requests/{requestId}/assign",
            new AssignRequestDto { ReviewerId = adminId, UpdatedAt = updatedAt },
            TestContext.Current.CancellationToken);

        // The assignee must be a Sys Admin or Super Admin.
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task<(int RequestId, DateTimeOffset UpdatedAt)> NewHumanReviewRequestAsync()
    {
        var requestId = 0;
        _factory.Seed(db =>
            requestId = TestData.AddRequest(db, CodeConstants.RequestStatuses.HumanReview).RequestId);

        var detail = await _factory.CreateClientFor(TestData.SysAdminEmail)
            .GetFromJsonAsync<AdminRequestDetailDto>($"/api/admin/requests/{requestId}", TestContext.Current.CancellationToken);
        return (requestId, detail!.Request.UpdatedAt);
    }
}
