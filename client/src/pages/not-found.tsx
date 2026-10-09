import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <DashboardContent maxWidth="xl">
      <PageHeader title="Page not found" />
      <Typography sx={{ mb: 3 }}>The page you asked for does not exist or has moved.</Typography>
      <Link
        component={RouterLink}
        href={paths.requests.root}
      >
        Go to My requests
      </Link>
    </DashboardContent>
  );
}
