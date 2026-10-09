// Pure helpers behind useRouteFocus (tested in route-focus.test.ts).

export type RouteFocusAction = 'none' | 'focus';

// Move focus only after a real route change: not on the first load (null previous path) and not when only
// the hash or search changes (same pathname).
export function getRouteFocusAction(
  previousPathname: string | null,
  pathname: string
): RouteFocusAction {
  if (previousPathname === null) return 'none';
  return previousPathname === pathname ? 'none' : 'focus';
}

type QueryableElement = {
  querySelector: (selector: string) => QueryableElement | null;
};

// The page's h1 when it has one, otherwise main itself.
export function pickFocusTarget<T extends QueryableElement>(main: T): T {
  return (main.querySelector('h1') as T | null) ?? main;
}
