using Eocr.Server.Data;

namespace Eocr.Server.Tests.Infrastructure;

// The API with the four role users and one request under human review, seeded once per test class (it is
// an xunit class fixture). Tests that change data add their own rows through Seed and TestData.
public class SeededApiFactory : EocrApiFactory
{
    // A request no test changes, for read checks.
    public int ReadOnlyRequestId { get; }

    public SeededApiFactory()
    {
        var requestId = 0;
        Seed(db =>
        {
            TestData.SeedRoleUsers(db);
            requestId = TestData.AddRequest(db, CodeConstants.RequestStatuses.HumanReview).RequestId;
        });
        ReadOnlyRequestId = requestId;
    }
}
