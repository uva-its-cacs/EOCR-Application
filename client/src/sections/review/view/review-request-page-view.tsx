import { useParams } from 'react-router';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ApiError } from 'src/lib/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { NotFoundView } from 'src/sections/error/not-found-view';

import { useReviewRequest } from '../use-review';
import { ReviewRequestView } from './review-request-view';

// ----------------------------------------------------------------------

// Loads a submitted request for review. Drafts and requests that do not exist are "not found".
export function ReviewRequestPageView() {
  const { requestId } = useParams();
  const id = Number(requestId);
  const query = useReviewRequest(Number.isInteger(id) && id > 0 ? id : null);

  if (query.data) return <ReviewRequestView detail={query.data} />;

  if (!Number.isInteger(id) || (query.error instanceof ApiError && query.error.status === 404)) {
    return (
      <DashboardContent>
        <NotFoundView
          title="Request not found"
          documentTitle="Request not found"
          description="This request does not exist, or it has not been submitted yet."
          action={
            <Button
              component={RouterLink}
              href={paths.admin.requests}
              size="large"
              variant="contained"
            >
              Go to the review queue
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <PageHeader
        title="Review"
        documentTitle="Review"
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
