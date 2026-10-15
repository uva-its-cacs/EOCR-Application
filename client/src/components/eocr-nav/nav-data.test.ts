import { it, expect, describe } from 'vitest';

import { NAV_GROUPS, isActivePath, filterNavGroups } from './nav-data';

// ----------------------------------------------------------------------

const titles = (roleCode: string | undefined) =>
  filterNavGroups(NAV_GROUPS, roleCode).flatMap((group) => group.items.map((item) => item.title));

describe('filterNavGroups', () => {
  it('shows the same links to Admin and User (admin editing lives on the catalog page)', () => {
    expect(titles('Admin')).toEqual(['My requests', 'New request', 'Software catalog']);
    expect(titles('User')).toEqual(['My requests', 'New request', 'Software catalog']);
    expect(titles(undefined)).toEqual(['My requests', 'New request', 'Software catalog']);
  });

  it('drops a group left without items, so its label and list are not rendered', () => {
    const groups = [
      { id: 'a', items: [{ title: 'A', path: '/a', icon: 'ic-file' }] },
      { id: 'empty', label: 'Empty', items: [] },
    ];
    expect(filterNavGroups(groups, 'Admin').map((group) => group.id)).toEqual(['a']);
  });

  it('shows a role-restricted group only to that exact role code (no case folding, no ids)', () => {
    const groups = [
      { id: 'all', items: [{ title: 'All', path: '/all', icon: 'ic-file' }] },
      {
        id: 'admin',
        label: 'Management',
        requiredRole: 'Admin',
        items: [{ title: 'Admin only', path: '/admin', icon: 'ic-file' }],
      },
    ];
    const ids = (roleCode: string | undefined) =>
      filterNavGroups(groups, roleCode).map((group) => group.id);
    expect(ids('Admin')).toEqual(['all', 'admin']);
    expect(ids('User')).toEqual(['all']);
    expect(ids('admin')).toEqual(['all']);
    expect(ids('3')).toEqual(['all']);
    expect(ids(undefined)).toEqual(['all']);
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
