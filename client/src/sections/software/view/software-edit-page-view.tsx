import { useParams } from 'react-router';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { useSoftware } from '../use-software';
import { SoftwareCreateEditForm } from '../software-create-edit-form';

// ----------------------------------------------------------------------

export function SoftwareEditPageView() {
  const { softwareId } = useParams();
  const softwareQuery = useSoftware(true);
  const software = softwareQuery.data?.find((row) => row.softwareId === Number(softwareId));

  return (
    <DashboardContent>
      <PageHeader
        title="Edit software"
        documentTitle="Edit software"
        backHref={paths.catalog.root}
        backLabel="Back to Software catalog"
        description={software?.softwareName ?? 'Update software and accessibility review details.'}
      />
      {softwareQuery.isPending && <LoadingState message="Loading software details..." />}
      {softwareQuery.isError && (
        <ErrorState
          onRetry={() => {
            void softwareQuery.refetch();
          }}
        >
          Software details could not be loaded. Please try again.
        </ErrorState>
      )}
      {softwareQuery.isSuccess && !software && (
        <ErrorState>That software record could not be found.</ErrorState>
      )}
      {software && <SoftwareCreateEditForm software={software} />}
    </DashboardContent>
  );
}
