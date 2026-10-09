import { paths } from 'src/routes/paths';

import { ADMIN_ROLE_CODE } from 'src/sections/auth/types';

// ----------------------------------------------------------------------

export type NavItemData = {
  title: string;
  path: string;
  // File name in public/assets/icons/navbar (template icon set), without the extension.
  icon: string;
};

export type NavGroupData = {
  id: string;
  // Visible group label. A group without a label renders its list only.
  label?: string;
  // Role code (Codes.Value) the user needs to see the group. Omit for everyone.
  requiredRole?: string;
  items: NavItemData[];
};

export const NAV_GROUPS: NavGroupData[] = [
  {
    id: 'requests',
    items: [
      { title: 'My requests', path: paths.requests.root, icon: 'ic-file' },
      { title: 'New request', path: paths.requests.new, icon: 'ic-blank' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    requiredRole: ADMIN_ROLE_CODE,
    items: [{ title: 'Software', path: paths.admin.software, icon: 'ic-course' }],
  },
];

/**
 * Groups the user may see. `roleCode` is undefined while the current user is loading, on an error, or
 * when nobody is signed in: only groups without a required role are returned, so admin items never
 * flash in. Groups left without items are dropped (no empty label or list).
 */
export function filterNavGroups(
  groups: NavGroupData[],
  roleCode: string | undefined
): NavGroupData[] {
  return groups
    .filter((group) => !group.requiredRole || group.requiredRole === roleCode)
    .filter((group) => group.items.length > 0);
}

function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

// Leaf items match exactly (a trailing slash is ignored), so "/" is not active on "/requests/new".
export function isActivePath(pathname: string, itemPath: string): boolean {
  return normalize(pathname) === normalize(itemPath);
}
