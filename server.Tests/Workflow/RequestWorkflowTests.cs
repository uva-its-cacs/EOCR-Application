using Eocr.Server.Data;
using Eocr.Server.Repos;
using Xunit;

namespace Eocr.Server.Tests.Workflow;

// Pure rules of the request workflow: a template for the status model work (#24 to #27).
public class RequestWorkflowTests
{
    [Theory]
    [InlineData(CodeConstants.RequestStatuses.Draft)]
    [InlineData(CodeConstants.RequestStatuses.Approved)]
    [InlineData(CodeConstants.RequestStatuses.ApprovedWithConditions)]
    [InlineData(CodeConstants.RequestStatuses.Denied)]
    [InlineData("NotAStatus")]
    public void Drafts_decided_and_unknown_requests_allow_nothing(string status) =>
        Assert.Empty(RequestWorkflow.AllowedActions(status));

    [Fact]
    public void Deciding_is_only_offered_from_human_review()
    {
        foreach (var status in new[]
        {
            CodeConstants.RequestStatuses.Submitted,
            CodeConstants.RequestStatuses.AiReview,
            CodeConstants.RequestStatuses.MoreInfoNeeded,
            CodeConstants.RequestStatuses.AwaitingEeaap,
        })
            Assert.False(RequestWorkflow.IsAllowed(status, RequestWorkflow.Actions.Decide), status);

        Assert.True(RequestWorkflow.IsAllowed(
            CodeConstants.RequestStatuses.HumanReview, RequestWorkflow.Actions.Decide));
    }

    [Fact]
    public void An_AI_reviewed_request_cannot_be_decided_without_human_review()
    {
        // AiReview can only move on to human review.
        Assert.True(RequestWorkflow.IsAllowed(
            CodeConstants.RequestStatuses.AiReview, RequestWorkflow.Actions.StartReview));
        Assert.False(RequestWorkflow.IsAllowed(
            CodeConstants.RequestStatuses.AiReview, RequestWorkflow.Actions.Decide));
    }

    [Theory]
    [InlineData(RequestWorkflow.Actions.StartAiReview, CodeConstants.RequestStatuses.AiReview)]
    [InlineData(RequestWorkflow.Actions.StartReview, CodeConstants.RequestStatuses.HumanReview)]
    [InlineData(RequestWorkflow.Actions.RequestInfo, CodeConstants.RequestStatuses.MoreInfoNeeded)]
    [InlineData(RequestWorkflow.Actions.SendForEeaap, CodeConstants.RequestStatuses.AwaitingEeaap)]
    public void Each_move_leads_to_its_status(string action, string expected) =>
        Assert.Equal(expected, RequestWorkflow.TargetStatus(action));

    [Theory]
    [InlineData(RequestWorkflow.Actions.Assign)]
    [InlineData(RequestWorkflow.Actions.SaveReview)]
    [InlineData(RequestWorkflow.Actions.Decide)]
    public void Actions_that_are_not_plain_moves_have_no_target_status(string action) =>
        Assert.Null(RequestWorkflow.TargetStatus(action));
}
