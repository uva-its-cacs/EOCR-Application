import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';
import { StatCard, StatCardGroup } from 'src/components/stat-card';
import { ErrorState, EmptyState, LoadingState } from 'src/components/feedback';

import { RequestsGrid } from './requests-grid';
import { useMyRequests } from '../use-my-requests';
import { countByGroup, STATUS_GROUPS } from '../status-groups';

// ----------------------------------------------------------------------

export function MyRequestsView() {
  const { data: requests, isPending, isError, refetch } = useMyRequests();

  const counts = requests ? countByGroup(requests) : null;

  return (
    <DashboardContent maxWidth="xl">
      <PageHeader
        title="My requests"
        actions={
          <Button
            component={RouterLink}
            href={paths.requests.new}
            variant="contained"
          >
            New request
          </Button>
        }
      />

      {!(isError && !requests) && (
        <StatCardGroup
          title="Summary"
          busy={isPending}
        >
          {Object.keys(STATUS_GROUPS).map((group) => (
            <StatCard
              key={group}
              title={group}
              value={counts ? counts[group] : null}
            />
          ))}
        </StatCardGroup>
      )}

      {isPending && <LoadingState message="Loading requests..." />}

      {isError && (
        <ErrorState
          onRetry={() => {
            void refetch();
          }}
          sx={{ mb: 2 }}
        >
          Failed to load requests. Please try again.
        </ErrorState>
      )}

      {requests && requests.length === 0 && <EmptyState title="You have no requests yet." />}

      {requests && requests.length > 0 && (
        <Box
          component="section"
          aria-labelledby="requests-heading"
          sx={{ minWidth: 0 }}
        >
          <Typography
            id="requests-heading"
            component="h2"
            variant="h6"
            sx={{ mb: 2 }}
          >
            Requests
          </Typography>
          <RequestsGrid rows={requests} />
        </Box>
      )}
    </DashboardContent>
  );
}
