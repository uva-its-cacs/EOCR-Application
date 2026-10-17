import { paths } from 'src/routes/paths';

import { STAFF_ROLE_CODES } from 'src/sections/auth/types';

// ----------------------------------------------------------------------

export type NavItemData = {
  title: string;
  path: string;
  // Role codes (Codes.Value) that may see this item; omit for everyone.
  requiredRoles?: readonly string[];
  // File name in public/assets/icons/navbar (template icon set), without the extension.
  icon: string;
};

export type NavGroupData = {
  id: string;
  // Visible group label. A group without a label renders its list only.
  label?: string;
  // Role codes (Codes.Value) that may see the group. Omit for everyone.
  requiredRoles?: readonly string[];
  items: NavItemData[];
};

export const NAV_GROUPS: NavGroupData[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      // The catalog is everyone's landing page ("/"), so it comes first.
      { title: 'Software catalog', path: paths.catalog.root, icon: 'ic-course' },
      { title: 'My requests', path: paths.requests.root, icon: 'ic-file' },
      { title: 'New request', path: paths.requests.new, icon: 'ic-blank' },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    requiredRoles: STAFF_ROLE_CODES,
    items: [{ title: 'Review queue', path: paths.admin.requests, icon: 'ic-kanban' }],
  },
  // Dev-only proof of concept; left out of production bundles and of tests (MODE is 'test' there).
  ...(import.meta.env.MODE === 'development'
    ? [
        {
          id: 'dev',
          label: 'Development',
          items: [{ title: 'Dev file manager', path: paths.dev.files, icon: 'ic-file' }],
        },
      ]
    : []),
];

/**
 * Groups and items the user may see. `roleCode` is undefined while the current user is loading, on an
 * error, or when nobody is signed in, so role-restricted links never flash in. Empty groups are dropped.
 */
export function filterNavGroups(
  groups: NavGroupData[],
  roleCode: string | undefined
): NavGroupData[] {
  return groups
    .filter(
      (group) => !group.requiredRoles || (!!roleCode && group.requiredRoles.includes(roleCode))
    )
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiredRoles || (!!roleCode && item.requiredRoles.includes(roleCode))
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function normalize(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

// Leaf items match exactly (a trailing slash is ignored), so "/" is not active on "/requests/new".
export function isActivePath(pathname: string, itemPath: string): boolean {
  return normalize(pathname) === normalize(itemPath);
}
