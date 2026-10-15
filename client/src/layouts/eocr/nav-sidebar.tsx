import type { Breakpoint } from '@mui/material/styles';
import type { NavGroupData } from 'src/components/eocr-nav/nav-data';

import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { Logo } from 'src/components/logo';
import { PrimaryNav } from 'src/components/eocr-nav/primary-nav';

import { layoutClasses } from '../core';
import { NavToggleButton } from '../components/nav-toggle-button';

// ----------------------------------------------------------------------

const NAV_ID = 'primary-nav-sidebar';

type Props = {
  groups: NavGroupData[];
  layoutQuery: Breakpoint;
  isNavMini: boolean;
  onToggleNav: () => void;
};

/**
 * Fixed sidebar from the layout breakpoint up (the drawer takes over below it), following the
 * template's layouts/dashboard/nav-vertical.tsx: Logo, toggle button, and the vertical nav (or the mini
 * nav when collapsed). Native scrolling replaces the template's Scrollbar, and there is no NavUpgrade.
 */
export function NavSidebar({ groups, layoutQuery, isNavMini, onToggleNav }: Props) {
  return (
    <NavRoot
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical])}
    >
      <NavToggleButton
        isNavMini={isNavMini}
        onClick={onToggleNav}
        aria-label={isNavMini ? 'Expand navigation' : 'Collapse navigation'}
        aria-expanded={!isNavMini}
        aria-controls={NAV_ID}
      />

      {isNavMini ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
          <Logo />
        </Box>
      ) : (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      <Box
        sx={(theme) => ({
          ...(isNavMini && theme.mixins.hideScrollY),
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <PrimaryNav id={NAV_ID} groups={groups} compact={isNavMini} sx={{ flex: '1 1 auto' }} />
      </Box>
    </NavRoot>
  );
}

// ----------------------------------------------------------------------

const NavRoot = styled('div', {
  shouldForwardProp: (prop: string) => !['isNavMini', 'layoutQuery', 'sx'].includes(prop),
})<{ isNavMini: boolean; layoutQuery: Breakpoint }>(({ isNavMini, layoutQuery, theme }) => ({
  top: 0,
  left: 0,
  height: '100%',
  display: 'none',
  position: 'fixed',
  flexDirection: 'column',
  zIndex: 'var(--layout-nav-zIndex)',
  backgroundColor: 'var(--layout-nav-bg)',
  width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
  borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
  transition: theme.transitions.create(['width'], {
    easing: 'var(--layout-transition-easing)',
    duration: 'var(--layout-transition-duration)',
  }),
  [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
}));
