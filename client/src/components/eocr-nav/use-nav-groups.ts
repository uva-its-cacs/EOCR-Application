import { useMemo } from 'react';

import { useCurrentUser } from 'src/sections/auth/use-current-user';

import { NAV_GROUPS, filterNavGroups } from './nav-data';

// ----------------------------------------------------------------------

// Nav groups for the current user. Admin items appear only once the server has confirmed the Admin role.
export function useNavGroups() {
  const current = useCurrentUser();
  const roleCode = current.status === 'authenticated' ? current.user.roleCode : undefined;

  return useMemo(() => filterNavGroups(NAV_GROUPS, roleCode), [roleCode]);
}
