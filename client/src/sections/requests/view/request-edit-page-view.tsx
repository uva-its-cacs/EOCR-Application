import { useParams } from 'react-router';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ApiError } from 'src/lib/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { NotFoundView } from 'src/sections/error/not-found-view';

import { useRequest } from '../use-request';
import { RequestIntakeView } from './request-intake-view';

// ----------------------------------------------------------------------

// Continue a draft: loads it and opens the intake on the details step. A submitted request can no longer
// be edited, so it links to its status page instead.
export function RequestEditPageView() {
  const { requestId } = useParams();
  const id = Number(requestId);
  const query = useRequest(Number.isInteger(id) && id > 0 ? id : null);

  if (query.data?.statusCode === 'Draft') return <RequestIntakeView draft={query.data} />;

  if (query.data) {
    return (
      <DashboardContent>
        <PageHeader
          title="This request has been submitted"
          documentTitle="Request submitted"
          description="Submitted requests can no longer be edited."
          actions={
            <Button
              component={RouterLink}
              href={paths.requests.details(query.data.requestId)}
              variant="contained"
            >
              View the request
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  if (!Number.isInteger(id) || (query.error instanceof ApiError && query.error.status === 404)) {
    return (
      <DashboardContent>
        <NotFoundView
          title="Request not found"
          documentTitle="Request not found"
          description="This request does not exist, or it is not one of yours."
          action={
            <Button
              component={RouterLink}
              href={paths.requests.root}
              size="large"
              variant="contained"
            >
              Go to My requests
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <PageHeader
        title="Continue your request"
        documentTitle="Continue request"
      />
      {query.isError ? (
        <ErrorState
          onRetry={() => {
            void query.refetch();
          }}
        >
          The request could not be loaded. Please try again.
        </ErrorState>
      ) : (
        <LoadingState message="Loading your draft..." />
      )}
    </DashboardContent>
  );
}
