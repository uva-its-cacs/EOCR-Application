import { it, expect, describe } from 'vitest';

import { NAV_GROUPS, isActivePath, filterNavGroups } from './nav-data';

// ----------------------------------------------------------------------

const titles = (roleCode: string | undefined) =>
  filterNavGroups(NAV_GROUPS, roleCode).flatMap((group) => group.items.map((item) => item.title));

describe('filterNavGroups', () => {
  it('shows the admin group to Admin', () => {
    expect(titles('Admin')).toEqual(['My requests', 'New request', 'Software']);
  });

  it('hides the admin group from User', () => {
    expect(titles('User')).toEqual(['My requests', 'New request']);
  });

  it('hides the admin group while the user is loading, on an error or when not signed in (undefined)', () => {
    expect(titles(undefined)).toEqual(['My requests', 'New request']);
  });

  it('compares role codes exactly (no case folding, no ids)', () => {
    expect(titles('admin')).toEqual(['My requests', 'New request']);
    expect(titles('3')).toEqual(['My requests', 'New request']);
  });

  it('drops a group left without items, so its label and list are not rendered', () => {
    const groups = [
      { id: 'a', items: [{ title: 'A', path: '/a', icon: 'ic-file' }] },
      { id: 'empty', label: 'Empty', items: [] },
    ];
    expect(filterNavGroups(groups, 'Admin').map((group) => group.id)).toEqual(['a']);
  });

  it('keeps the Management label only together with its items', () => {
    const admin = filterNavGroups(NAV_GROUPS, 'Admin').find((group) => group.id === 'management');
    expect(admin?.label).toBe('Management');
    expect(filterNavGroups(NAV_GROUPS, 'User').some((group) => group.id === 'management')).toBe(
      false
    );
  });
});

describe('isActivePath', () => {
  it.each([
    ['/', '/', true],
    ['/requests/new', '/requests/new', true],
    ['/requests/new/', '/requests/new', true],
    ['/requests/new', '/', false],
    ['/admin/software', '/admin/software', true],
    ['/admin/software/12', '/admin/software', false],
    ['/admin', '/admin/software', false],
  ])('%s against %s is %s', (pathname, itemPath, expected) => {
    expect(isActivePath(pathname, itemPath)).toBe(expected);
  });
});
