import type { RouteObject } from 'react-router';
import type { RouteHandle } from '../route-handle';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { EocrLayout } from 'src/layouts/eocr';

import { PageLoading } from 'src/components/page-loading';

import { paths } from '../paths';
import { usePathname } from '../hooks';
import { RequireAdmin } from '../components';

// ----------------------------------------------------------------------

const MyRequestsPage = lazy(() => import('src/pages/requests/list'));
const NewRequestPage = lazy(() => import('src/pages/requests/new'));
const SoftwarePage = lazy(() => import('src/pages/admin/software'));
const NotFoundPage = lazy(() => import('src/pages/not-found'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<PageLoading />}>
      <Outlet />
    </Suspense>
  );
}

export const eocrRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <EocrLayout>
        <SuspenseOutlet />
      </EocrLayout>
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
        handle: {
          crumb: 'New request',
          parent: { crumb: 'My requests', path: paths.requests.root },
        } satisfies RouteHandle,
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
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { crumb: 'Page not found' } satisfies RouteHandle,
      },
    ],
  },
];
