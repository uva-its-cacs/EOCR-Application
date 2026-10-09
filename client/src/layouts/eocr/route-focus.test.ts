import { it, expect, describe } from 'vitest';

import { pickFocusTarget, getRouteFocusAction } from './route-focus';

// ----------------------------------------------------------------------

describe('getRouteFocusAction', () => {
  it('does nothing on the first load', () => {
    expect(getRouteFocusAction(null, '/')).toBe('none');
  });

  it('does nothing when the pathname did not change (hash or search only)', () => {
    expect(getRouteFocusAction('/requests/new', '/requests/new')).toBe('none');
  });

  it('moves focus after a route change', () => {
    expect(getRouteFocusAction('/', '/requests/new')).toBe('focus');
    expect(getRouteFocusAction('/requests/new', '/admin/software')).toBe('focus');
  });
});

describe('pickFocusTarget', () => {
  type Node = { name: string; querySelector: (selector: string) => Node | null };

  const h1: Node = { name: 'h1', querySelector: () => null };

  it('picks the h1 inside main', () => {
    const main: Node = {
      name: 'main',
      querySelector: (selector) => (selector === 'h1' ? h1 : null),
    };
    expect(pickFocusTarget(main).name).toBe('h1');
  });

  it('falls back to main when the page has no h1', () => {
    const main: Node = { name: 'main', querySelector: () => null };
    expect(pickFocusTarget(main).name).toBe('main');
  });
});
