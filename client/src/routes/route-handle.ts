import { useMatches } from 'react-router';

export interface RouteHandle {
  crumb: string;
}

function hasCrumb(handle: unknown): handle is RouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    typeof (handle as RouteHandle).crumb === 'string'
  );
}

// Crumb of the deepest matched route that declares one.
export function useCurrentCrumb(): string | undefined {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle;
    if (hasCrumb(handle)) return handle.crumb;
  }
  return undefined;
}
