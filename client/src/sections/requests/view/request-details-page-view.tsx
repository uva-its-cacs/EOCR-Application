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
import { RequestDetailsView } from './request-details-view';

// ----------------------------------------------------------------------

// Loads one of the current user's requests for the status page. Another user's request (or one that does
// not exist) is "not found", as the server answers.
export function RequestDetailsPageView() {
  const { requestId } = useParams();
  const id = Number(requestId);
  const query = useRequest(Number.isInteger(id) && id > 0 ? id : null);

  if (query.data) return <RequestDetailsView request={query.data} />;

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
        title="Request"
        documentTitle="Request"
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
        <LoadingState message="Loading the request..." />
      )}
    </DashboardContent>
  );
}
