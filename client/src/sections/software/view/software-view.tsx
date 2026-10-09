import { useState } from 'react';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';
import { VisuallyHidden } from 'src/components/visually-hidden';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { useSoftware } from '../use-software';
import { SoftwareGrid } from './software-grid';

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

  const retry = () => {
    void software.refetch();
  };

  return (
    <DashboardContent maxWidth="xl">
      <PageHeader
        title="Software"
        documentTitle="Software administration"
        description="Manage existing software and accessibility review details."
        actions={
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
        }
      />

      <VisuallyHidden>
        <span role="status">{REFRESH_MESSAGES[refreshState]}</span>
      </VisuallyHidden>

      {software.isPending && <LoadingState message="Loading software..." />}

      {software.isError && (
        <ErrorState
          onRetry={retry}
          sx={{ mb: 2 }}
        >
          Software could not be loaded. Retry or check your administrator access.
        </ErrorState>
      )}

      {software.data && (
        <SoftwareGrid
          rows={software.data}
          loading={busy}
        />
      )}
    </DashboardContent>
  );
}
