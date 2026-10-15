import { Outlet } from 'react-router';

import Button from '@mui/material/Button';

import { DashboardContent } from 'src/layouts/dashboard';

import { SplashScreen } from 'src/components/loading-screen';

import { View403 } from 'src/sections/error/403-view';
import { View500 } from 'src/sections/error/500-view';
import { ADMIN_ROLE_CODE } from 'src/sections/auth/types';
import { useCurrentUser } from 'src/sections/auth/use-current-user';

// ----------------------------------------------------------------------

/**
 * Route guard for admin pages. It only decides what to show: the server stays the authority and
 * answers 403 to non-admins on its own. The refusal pages are the template's 403 and 500 views.
 */
export function RequireAdmin() {
  const current = useCurrentUser();

  // As the template's auth guard: the splash screen while the session is checked.
  if (current.status === 'loading') return <SplashScreen />;

  if (current.status === 'unauthenticated') {
    return (
      <DashboardContent>
        <View403
          title="You are not signed in"
          documentTitle="Not signed in"
          description="Your session could not be verified. Sign in through your organization and reload this page."
        />
      </DashboardContent>
    );
  }

  if (current.status === 'error') {
    return (
      <DashboardContent>
        <View500
          title="We could not check your access"
          documentTitle="Access check failed"
          description={current.error.message}
          action={
            <Button size="large" variant="contained" onClick={current.refetch}>
              Retry
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  if (current.user.roleCode !== ADMIN_ROLE_CODE) {
    return (
      <DashboardContent>
        <View403
          title="You do not have access to this page"
          documentTitle="No access"
          description="This page is for administrators. If you need access, contact your system administrator."
        />
      </DashboardContent>
    );
  }

  return <Outlet />;
}
