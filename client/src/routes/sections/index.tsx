import type { RouteObject } from 'react-router';

import { eocrRoutes } from './eocr';

// ----------------------------------------------------------------------

export const routesSection: RouteObject[] = [
  // Our routes (including the "*" not-found page, inside the layout)
  ...eocrRoutes,
];
