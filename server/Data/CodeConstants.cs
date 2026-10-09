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
    }

    public static class UserRoles
    {
        public const string User = "User";
        public const string Admin = "Admin";
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

    public static class AccessibilityRisks
    {
        public const string Low = "Low";
        public const string Medium = "Medium";
        public const string High = "High";
    }
}
