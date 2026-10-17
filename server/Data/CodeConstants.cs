namespace Eocr.Server.Data;

public static class CodeConstants
{
    public static class CodeTypes
    {
        public const string UserRole = "UserRole";
        public const string RequestStatus = "RequestStatus";
        public const string ApprovalStatus = "ApprovalStatus";
        public const string AccessibilityRisk = "AccessibilityRisk";
        public const string SoftwareCategory = "SoftwareCategory";
        public const string FundingSource = "FundingSource";
        public const string ReviewType = "ReviewType";
        public const string Recommendation = "Recommendation";
        public const string ExceptionStatus = "ExceptionStatus";
    }

    public static class UserRoles
    {
        public const string User = "User";
        public const string Admin = "Admin";
        public const string SysAdmin = "SysAdmin";
        public const string SuperAdmin = "SuperAdmin";
    }

    public static class RequestStatuses
    {
        public const string Draft = "Draft";
        public const string Submitted = "Submitted";
        public const string AiReview = "AiReview";
        public const string HumanReview = "HumanReview";
        public const string MoreInfoNeeded = "MoreInfoNeeded";
        public const string AwaitingEeaap = "AwaitingEeaap";
        public const string Approved = "Approved";
        public const string ApprovedWithConditions = "ApprovedWithConditions";
        public const string Denied = "Denied";
    }

    public static class ApprovalStatuses
    {
        public const string NotReviewed = "NotReviewed";
        public const string UnderReview = "UnderReview";
        public const string Approved = "Approved";
        public const string ApprovedWithConditions = "ApprovedWithConditions";
        public const string Denied = "Denied";
        public const string Expired = "Expired";
    }

    public static class ReviewTypes
    {
        public const string Ai = "Ai";
        public const string Human = "Human";
    }

    public static class Recommendations
    {
        public const string Approve = "Approve";
        public const string ApproveWithConditions = "ApproveWithConditions";
        public const string Deny = "Deny";
        public const string ExceptionNeeded = "ExceptionNeeded";
    }

    // An EEAAP exception: Requested (waiting on the requester), Submitted (waiting on the decision),
    // Approved or Denied (by the request's decision), Withdrawn (the reviewer returned to review first).
    public static class ExceptionStatuses
    {
        public const string Requested = "Requested";
        public const string Submitted = "Submitted";
        public const string Approved = "Approved";
        public const string Denied = "Denied";
        public const string Withdrawn = "Withdrawn";
    }

    public static class AccessibilityRisks
    {
        public const string Low = "Low";
        public const string Medium = "Medium";
        public const string High = "High";
    }
}
