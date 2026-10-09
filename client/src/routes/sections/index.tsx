import type { RouteObject } from 'react-router';

import { Navigate } from 'react-router';

import { paths } from '../paths';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={paths.dashboard.root} replace />,
  },

  // Dashboard
  ...dashboardRoutes,

  // No match (temporary: Slice 9 builds an accessible 404)
  { path: '*', element: <Navigate to={paths.dashboard.root} replace /> },
];
