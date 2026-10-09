import type { RouteObject } from 'react-router';
import type { RouteHandle } from '../route-handle';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from '../paths';
import { usePathname } from '../hooks';
import { RequireAdmin } from '../components';

// ----------------------------------------------------------------------

const MyRequestsPage = lazy(() => import('src/pages/requests/list'));
const NewRequestPage = lazy(() => import('src/pages/requests/new'));
const SoftwarePage = lazy(() => import('src/pages/admin/software'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

export const eocrRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <DashboardLayout>
        <SuspenseOutlet />
      </DashboardLayout>
    ),
    children: [
      {
        index: true,
        element: <MyRequestsPage />,
        handle: { crumb: 'My requests' } satisfies RouteHandle,
      },
      {
        path: paths.requests.new,
        element: <NewRequestPage />,
        handle: { crumb: 'New request' } satisfies RouteHandle,
      },
      {
        // Admin pages: the guard decides what to show; the server enforces access.
        element: <RequireAdmin />,
        children: [
          {
            path: paths.admin.software,
            element: <SoftwarePage />,
            handle: { crumb: 'Software' } satisfies RouteHandle,
          },
        ],
      },
    ],
  },
];
