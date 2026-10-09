import { Outlet } from 'react-router';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageLoading } from 'src/components/page-loading';

import { ADMIN_ROLE_CODE } from 'src/sections/auth/types';
import { useCurrentUser } from 'src/sections/auth/use-current-user';

import { paths } from '../paths';
import { RouterLink } from './router-link';

// ----------------------------------------------------------------------

/**
 * Route guard for admin pages. It only decides what to show: the server stays the authority and
 * answers 403 to non-admins on its own.
 */
export function RequireAdmin() {
  const current = useCurrentUser();

  if (current.status === 'loading') return <PageLoading />;

  if (current.status === 'unauthenticated') {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" component="h1">
          You are not signed in
        </Typography>
        <Typography sx={{ mt: 1 }}>
          Your session could not be verified. Sign in through your organization and reload this
          page.
        </Typography>
      </DashboardContent>
    );
  }

  if (current.status === 'error') {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          We could not check your access
        </Typography>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={current.refetch}>
              Retry
            </Button>
          }
        >
          {current.error.message}
        </Alert>
      </DashboardContent>
    );
  }

  if (current.user.roleCode !== ADMIN_ROLE_CODE) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" component="h1">
          You do not have access to this page
        </Typography>
        <Typography sx={{ mt: 1 }}>
          <Link component={RouterLink} href={paths.requests.root}>
            Go to My requests
          </Link>
        </Typography>
      </DashboardContent>
    );
  }

  return <Outlet />;
}
