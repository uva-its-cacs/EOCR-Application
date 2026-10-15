import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { ErrorState } from 'src/components/feedback';
import { PageHeader, focusPageHeading } from 'src/components/page-header';

import { useSoftwareCatalog } from '../use-software';
import { SoftwareCatalogView } from './software-catalog-view';

// ----------------------------------------------------------------------

export function SoftwareCatalogPageView() {
  const software = useSoftwareCatalog(true);

  const retry = async () => {
    const result = await software.refetch();
    if (!result.isError) focusPageHeading();
  };

  return (
    <DashboardContent maxWidth="xl">
      {software.isError && !software.data ? (
        <>
          <PageHeader
            title="Software catalog"
            documentTitle="Software catalog"
            description="Browse software and its accessibility approval status."
            actions={
              <Button
                component={RouterLink}
                href={paths.requests.new}
                variant="contained"
              >
                Request software
              </Button>
            }
          />
          <ErrorState
            onRetry={() => {
              void retry();
            }}
          >
            The software catalog could not be loaded. Please try again.
          </ErrorState>
        </>
      ) : (
        <SoftwareCatalogView
          rows={software.data ?? []}
          loading={software.isFetching}
        />
      )}
      {software.isError && software.data && (
        <ErrorState
          onRetry={() => {
            void retry();
          }}
        >
          The software catalog could not be refreshed.
        </ErrorState>
      )}
    </DashboardContent>
  );
}
