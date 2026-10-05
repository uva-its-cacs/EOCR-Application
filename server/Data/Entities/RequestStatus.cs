namespace Eocr.Server.Data.Entities;

public enum RequestStatus
{
    Draft,
    Submitted,
    AiReview,
    HumanReview,
    MoreInfoNeeded,
    AwaitingEeaap,
    Approved,
    ApprovedWithConditions,
    Denied,
}
