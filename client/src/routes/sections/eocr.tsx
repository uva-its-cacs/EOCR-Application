import type { RouteObject } from 'react-router';
import type { RouteHandle } from '../route-handle';

import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router';

import { EocrLayout } from 'src/layouts/eocr';

import { PageLoading } from 'src/components/page-loading';

import { paths } from '../paths';
import { usePathname } from '../hooks';
import { RequireAdmin } from '../components';

// ----------------------------------------------------------------------

const MyRequestsPage = lazy(() => import('src/pages/requests/list'));
const NewRequestPage = lazy(() => import('src/pages/requests/new'));
const RequestDetailsPage = lazy(() => import('src/pages/requests/details'));
const RequestEditPage = lazy(() => import('src/pages/requests/edit'));
const RequestEeaapPage = lazy(() => import('src/pages/requests/eeaap'));
const SoftwareCatalogPage = lazy(() => import('src/pages/software/catalog'));
const SoftwareEditPage = lazy(() => import('src/pages/admin/software-edit'));
const ReviewQueuePage = lazy(() => import('src/pages/admin/review-queue'));
const ReviewRequestPage = lazy(() => import('src/pages/admin/review-request'));
const DevFilesPage = lazy(() => import('src/pages/dev-files'));
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
        element: <SoftwareCatalogPage />,
        handle: { crumb: 'Software catalog' } satisfies RouteHandle,
      },
      {
        path: paths.requests.root.slice(1),
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
        path: 'requests/:requestId',
        element: <RequestDetailsPage />,
        handle: {
          crumb: 'Request',
          parent: { crumb: 'My requests', path: paths.requests.root },
        } satisfies RouteHandle,
      },
      {
        path: 'requests/:requestId/edit',
        element: <RequestEditPage />,
        handle: {
          crumb: 'Continue request',
          parent: { crumb: 'My requests', path: paths.requests.root },
        } satisfies RouteHandle,
      },
      {
        path: 'requests/:requestId/eeaap',
        element: <RequestEeaapPage />,
        handle: {
          crumb: 'Exception plan (EEAAP)',
          parent: { crumb: 'My requests', path: paths.requests.root },
        } satisfies RouteHandle,
      },
      {
        // Admin pages: the guard decides what to show; the server enforces access.
        element: <RequireAdmin />,
        children: [
          {
            path: paths.admin.requests.slice(1),
            element: <ReviewQueuePage />,
            handle: { crumb: 'Review queue' } satisfies RouteHandle,
          },
          {
            path: 'admin/requests/:requestId',
            element: <ReviewRequestPage />,
            handle: {
              crumb: 'Review',
              parent: { crumb: 'Review queue', path: paths.admin.requests },
            } satisfies RouteHandle,
          },
          {
            // The editor changes data, so the read-only Admin is kept out.
            element: <RequireAdmin requireWrite />,
            children: [
              {
                path: 'admin/software/:softwareId/edit',
                element: <SoftwareEditPage />,
                handle: {
                  crumb: 'Edit software',
                  parent: { crumb: 'Software catalog', path: paths.catalog.root },
                } satisfies RouteHandle,
              },
            ],
          },
        ],
      },
      // Dev-only proof of concept (blob storage file manager); not registered in production builds.
      ...(import.meta.env.DEV
        ? [
            {
              path: paths.dev.files.slice(1),
              element: <DevFilesPage />,
              handle: { crumb: 'Dev file manager' } satisfies RouteHandle,
            },
          ]
        : []),
      {
        // The admin catalog merged into the shared catalog; keep old links working.
        path: paths.admin.software,
        element: <Navigate to={paths.catalog.root} replace />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { crumb: 'Page not found' } satisfies RouteHandle,
      },
    ],
  },
];
