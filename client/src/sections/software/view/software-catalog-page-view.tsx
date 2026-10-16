import { useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { ErrorState } from 'src/components/feedback';
import { VisuallyHidden } from 'src/components/visually-hidden';
import { PageHeader, focusPageHeading } from 'src/components/page-header';

import { ADMIN_ROLE_CODE } from 'src/sections/auth/types';
import { useCurrentUser } from 'src/sections/auth/use-current-user';
import { useMyRequests } from 'src/sections/requests/use-my-requests';
import { MyRequestsSummary } from 'src/sections/requests/my-requests-summary';
import { RecentRequestsCard } from 'src/sections/requests/recent-requests-card';
import { ReviewQueueSummaryCard } from 'src/sections/review/review-queue-summary-card';

import { useSoftwareCatalog } from '../use-software';
import { SoftwareListView } from './software-list-view';

// ----------------------------------------------------------------------

const REFRESH_MESSAGES = {
  idle: '',
  refreshing: 'Refreshing software...',
  done: 'Software list updated',
} as const;

type RefreshState = keyof typeof REFRESH_MESSAGES;

// The landing page for everyone: the catalog is the focal point (is my version approved and current?),
// with the viewer's own requests around it: a summary strip above (only once they have requests) and the
// recent requests card below; admins also get the review queue card.
export function SoftwareCatalogPageView() {
  const software = useSoftwareCatalog(true);
  const myRequests = useMyRequests();
  const current = useCurrentUser();
  // Edit links only show once the user is known to be an admin. The server still enforces access.
  const isAdmin = current.status === 'authenticated' && current.user.roleCode === ADMIN_ROLE_CODE;
  const busy = software.isFetching;
  // Only a refresh the user asked for is announced, not the initial load.
  const [refreshState, setRefreshState] = useState<RefreshState>('idle');

  const handleRefresh = async () => {
    // aria-disabled (not disabled) keeps focus on the button while fetching, so clicks are ignored here.
    if (busy) return;
    setRefreshState('refreshing');
    const result = await software.refetch();
    // Errors are announced by the ErrorState alert.
    setRefreshState(result.isError ? 'idle' : 'done');
  };

  // The alert and its Retry button disappear on success, so focus moves to the page heading.
  const retry = async () => {
    const result = await software.refetch();
    if (!result.isError) requestAnimationFrame(() => focusPageHeading());
  };

  const actions = (
    <Stack
      direction="row"
      spacing={1}
    >
      <Button
        component={RouterLink}
        href={paths.requests.new}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        Request software
      </Button>
      <Button
        aria-disabled={busy}
        aria-busy={busy}
        onClick={() => {
          void handleRefresh();
        }}
        startIcon={
          busy ? (
            <CircularProgress
              size={16}
              color="inherit"
              aria-hidden
            />
          ) : undefined
        }
        sx={busy ? { color: 'text.disabled', cursor: 'not-allowed' } : undefined}
      >
        Refresh
      </Button>
    </Stack>
  );

  return (
    <DashboardContent>
      <PageHeader
        title="Software catalog"
        documentTitle="Software catalog"
        description="Check whether your version is approved and current before you request software."
        actions={actions}
      />

      {/* The viewer's own requests (hidden until they have some; em dashes while loading). */}
      {(myRequests.isPending || (myRequests.data?.length ?? 0) > 0) && (
        <MyRequestsSummary requests={myRequests.data} />
      )}

      {software.isError && (
        <ErrorState
          onRetry={() => {
            void retry();
          }}
          sx={{ mb: 2 }}
        >
          {software.data
            ? 'The software catalog could not be refreshed.'
            : 'The software catalog could not be loaded. Please try again.'}
        </ErrorState>
      )}

      {(!software.isError || software.data) && (
        <SoftwareListView
          rows={software.data ?? []}
          loading={busy}
          editHref={isAdmin ? paths.admin.softwareEdit : undefined}
        />
      )}

      <Grid
        container
        spacing={3}
        sx={{ mt: { xs: 3, md: 5 } }}
      >
        <Grid size={{ xs: 12, md: isAdmin ? 8 : 12 }}>
          <RecentRequestsCard
            requests={myRequests.data}
            loading={myRequests.isPending}
            error={myRequests.isError}
            onRetry={() => {
              void myRequests.refetch();
            }}
          />
        </Grid>
        {isAdmin && (
          <Grid size={{ xs: 12, md: 4 }}>
            <ReviewQueueSummaryCard />
          </Grid>
        )}
      </Grid>

      <VisuallyHidden>
        <span role="status">{REFRESH_MESSAGES[refreshState]}</span>
      </VisuallyHidden>
    </DashboardContent>
  );
}
