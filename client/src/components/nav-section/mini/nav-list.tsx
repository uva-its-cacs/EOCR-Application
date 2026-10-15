import type { NavListProps } from '../types';

import { isActiveLink, isExternalLink } from 'minimal-shared/utils';

import { usePathname } from 'src/routes/hooks';

import { NavItem } from './nav-item';
import { NavLi } from '../components';

// ----------------------------------------------------------------------

// EOCR: the template opens child items in a hover-only popover (NavDropdown), which keyboard and
// touch users cannot reach. EOCR's navigation has no child items, so the mini nav renders leaf links
// only; children are ignored. Reinstate an accessible disclosure before adding nested items.
export function NavList({
  data,
  depth,
  render,
  slotProps,
  checkPermissions,
  enabledRootRedirect,
}: NavListProps) {
  const pathname = usePathname();

  const isActive = isActiveLink(pathname, data.path, data.deepMatch ?? false);

  // Hidden item by role
  if (data.allowedRoles && checkPermissions && checkPermissions(data.allowedRoles)) {
    return null;
  }

  return (
    <NavLi disabled={data.disabled}>
      <NavItem
        // slots
        path={data.path}
        icon={data.icon}
        info={data.info}
        title={data.title}
        caption={data.caption}
        // state
        active={isActive}
        disabled={data.disabled}
        // options
        depth={depth}
        render={render}
        hasChild={false}
        externalLink={isExternalLink(data.path)}
        enabledRootRedirect={enabledRootRedirect}
        // styles
        slotProps={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
      />
    </NavLi>
  );
}
