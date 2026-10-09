import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <DashboardContent maxWidth="xl">
      <PageHeader
        title="New request"
        description="This page is a placeholder until a later slice builds it."
      />
    </DashboardContent>
  );
}
