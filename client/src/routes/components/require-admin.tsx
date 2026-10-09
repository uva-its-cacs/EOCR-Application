import { Outlet } from 'react-router';

import Link from '@mui/material/Link';

import { DashboardContent } from 'src/layouts/dashboard';

import { ErrorState } from 'src/components/feedback';
import { PageHeader } from 'src/components/page-header';
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
        <PageHeader
          title="You are not signed in"
          documentTitle="Not signed in"
          description="Your session could not be verified. Sign in through your organization and reload this page."
        />
      </DashboardContent>
    );
  }

  if (current.status === 'error') {
    return (
      <DashboardContent maxWidth="xl">
        <PageHeader title="We could not check your access" documentTitle="Access check failed" />
        <ErrorState onRetry={current.refetch}>{current.error.message}</ErrorState>
      </DashboardContent>
    );
  }

  if (current.user.roleCode !== ADMIN_ROLE_CODE) {
    return (
      <DashboardContent maxWidth="xl">
        <PageHeader
          title="You do not have access to this page"
          documentTitle="No access"
          description={
            <Link component={RouterLink} href={paths.requests.root}>
              Go to My requests
            </Link>
          }
        />
      </DashboardContent>
    );
  }

  return <Outlet />;
}
