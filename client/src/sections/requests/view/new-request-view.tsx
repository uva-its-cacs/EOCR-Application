import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

// The template's invoice-create-view.tsx framing (page heading with breadcrumbs, then the form in a
// card). Placeholder content until the intake slice builds the request form.
export function NewRequestView() {
  return (
    <DashboardContent>
      <PageHeader
        title="New request"
        documentTitle="Request software"
      />

      <Card>
        <EmptyContent
          title="The request form is coming soon."
          description="You will be able to request software for accessibility review here."
          slotProps={{ title: { component: 'p' } }}
          action={
            <Button
              component={RouterLink}
              href={paths.requests.root}
              variant="outlined"
              sx={{ mt: 3 }}
            >
              Back to My requests
            </Button>
          }
          sx={{ py: 10 }}
        />
      </Card>
    </DashboardContent>
  );
}
