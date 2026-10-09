import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';

// ----------------------------------------------------------------------

// Placeholder until the intake slice builds the request form.
export function NewRequestView() {
  return (
    <DashboardContent maxWidth="xl">
      <PageHeader title="New request" />
      <Typography sx={{ mb: 3 }}>The request form is coming soon.</Typography>
      <Button
        component={RouterLink}
        href={paths.requests.root}
        variant="outlined"
      >
        Back to My requests
      </Button>
    </DashboardContent>
  );
}
