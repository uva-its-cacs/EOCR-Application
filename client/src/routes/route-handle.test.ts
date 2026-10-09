import { it, expect, describe } from 'vitest';

import { crumbsFromMatches } from './route-handle';

// ----------------------------------------------------------------------

// The matches React Router produces for our routes (layout route first, then the page route).
const layout = { pathname: '/', handle: undefined };

describe('crumbsFromMatches', () => {
  it('"/" has a single crumb (PageHeader renders no breadcrumb)', () => {
    expect(
      crumbsFromMatches([layout, { pathname: '/', handle: { crumb: 'My requests' } }])
    ).toEqual([{ label: 'My requests', path: '/' }]);
  });

  it('"/requests/new" is My requests > New request through the declared parent', () => {
    const page = {
      pathname: '/requests/new',
      handle: { crumb: 'New request', parent: { crumb: 'My requests', path: '/' } },
    };
    expect(crumbsFromMatches([layout, page])).toEqual([
      { label: 'My requests', path: '/' },
      { label: 'New request', path: '/requests/new' },
    ]);
  });

  it('"/admin/software" has a single crumb (the admin guard route has no handle)', () => {
    const guard = { pathname: '/', handle: undefined };
    const page = { pathname: '/admin/software', handle: { crumb: 'Software' } };
    expect(crumbsFromMatches([layout, guard, page])).toEqual([
      { label: 'Software', path: '/admin/software' },
    ]);
  });

  it('ignores handles without a string crumb and does not repeat a parent', () => {
    const matches = [
      { pathname: '/', handle: { crumb: 'My requests' } },
      { pathname: '/x', handle: { other: true } },
      { pathname: '/y', handle: { crumb: 'Y', parent: { crumb: 'My requests', path: '/' } } },
    ];
    expect(crumbsFromMatches(matches).map((c) => c.label)).toEqual(['My requests', 'Y']);
  });
});
