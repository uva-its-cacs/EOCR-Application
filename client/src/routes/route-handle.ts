import { useMatches } from 'react-router';

export interface RouteHandle {
  crumb: string;
  // Optional crumb shown before this one, for a page that sits "under" another page without being a
  // nested route (for example New request under My requests).
  parent?: { crumb: string; path: string };
}

export interface Crumb {
  label: string;
  path: string;
}

type MatchLike = { pathname: string; handle: unknown };

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

// Breadcrumb trail from the matched routes, outermost first. A route's declared parent comes before it.
export function crumbsFromMatches(matches: MatchLike[]): Crumb[] {
  const crumbs: Crumb[] = [];

  for (const match of matches) {
    if (!hasCrumb(match.handle)) continue;
    const { parent, crumb } = match.handle;
    if (parent && !crumbs.some((c) => c.path === parent.path)) {
      crumbs.push({ label: parent.crumb, path: parent.path });
    }
    crumbs.push({ label: crumb, path: match.pathname });
  }

  return crumbs;
}

export function useCrumbs(): Crumb[] {
  return crumbsFromMatches(useMatches());
}
