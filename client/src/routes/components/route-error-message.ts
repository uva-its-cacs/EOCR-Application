import { isRouteErrorResponse } from 'react-router';

// ----------------------------------------------------------------------

export const GENERIC_ERROR_MESSAGE =
  'An unexpected error occurred. Reload the page or go to My requests.';

/**
 * The message the error page shows for a route error. Never a stack trace. A route error response
 * (for example a 404 from a loader) shows its status; an Error's message is shown only in development
 * (it can contain internal details); everything else gets the generic message.
 */
export function routeErrorMessage(error: unknown, isDev: boolean): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`.trim();
  }

  if (isDev && error instanceof Error && error.message) {
    return error.message;
  }

  return GENERIC_ERROR_MESSAGE;
}
