import type { RouteObject } from 'react-router';

import { Navigate } from 'react-router';

import { paths } from '../paths';
import { eocrRoutes } from './eocr';

// ----------------------------------------------------------------------

export const routesSection: RouteObject[] = [
  // Our routes
  ...eocrRoutes,

  // No match (temporary: Slice 9 builds an accessible 404)
  { path: '*', element: <Navigate to={paths.requests.root} replace /> },
];
