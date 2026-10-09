import { useRef, useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { pickFocusTarget, getRouteFocusAction } from './route-focus';

// ----------------------------------------------------------------------

// Pages are lazy-loaded, so the new h1 can appear a moment after the route changes.
const WAIT_FOR_H1_MS = 1000;

function focusElement(element: HTMLElement) {
  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
  element.focus({ preventScroll: true });
}

/**
 * After each route change (not on the first load) move focus to the page's h1, or to <main> when the page
 * has no h1, so screen reader and keyboard users start at the new content.
 */
export function useRouteFocus(mainId: string) {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const action = getRouteFocusAction(previous.current, pathname);
    previous.current = pathname;

    const main = document.getElementById(mainId);
    if (action === 'none' || !main) return undefined;

    const focusWhenReady = () => {
      const target = pickFocusTarget(main);
      if (target === main) return false;
      focusElement(target);
      return true;
    };

    if (focusWhenReady()) return undefined;

    const observer = new MutationObserver(() => {
      if (focusWhenReady()) {
        observer.disconnect();
        window.clearTimeout(timeout);
      }
    });
    observer.observe(main, { childList: true, subtree: true });

    const timeout = window.setTimeout(() => {
      observer.disconnect();
      focusElement(pickFocusTarget(main));
    }, WAIT_FOR_H1_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [mainId, pathname]);
}
