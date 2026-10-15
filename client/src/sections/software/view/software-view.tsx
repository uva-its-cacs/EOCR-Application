import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { ErrorState } from 'src/components/feedback';
import { VisuallyHidden } from 'src/components/visually-hidden';
import { PageHeader, focusPageHeading } from 'src/components/page-header';

import { useSoftware } from '../use-software';
import { SoftwareCatalogView } from './software-catalog-view';

// ----------------------------------------------------------------------

const REFRESH_MESSAGES = {
  idle: '',
  refreshing: 'Refreshing software...',
  done: 'Software list updated',
} as const;

type RefreshState = keyof typeof REFRESH_MESSAGES;

export function SoftwareView() {
  // Admin access is checked by RequireAdmin before this view renders.
  const software = useSoftware(true);
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
    <DashboardContent maxWidth="xl">
      {!software.isError || software.data ? (
        <SoftwareCatalogView
          rows={software.data ?? []}
          loading={!software.data && software.isPending ? true : busy}
          editHref={paths.admin.softwareEdit}
          actions={actions}
        />
      ) : (
        <PageHeader
          title="Software catalog"
          documentTitle="Software catalog"
          description="Browse software and its accessibility approval status."
          actions={actions}
        />
      )}

      {software.isError && (
        <ErrorState
          onRetry={() => {
            void retry();
          }}
          sx={{ mb: 2 }}
        >
          Software could not be loaded. Please try again.
        </ErrorState>
      )}

      <VisuallyHidden>
        <span role="status">{REFRESH_MESSAGES[refreshState]}</span>
      </VisuallyHidden>
    </DashboardContent>
  );
}
