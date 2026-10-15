import type { Breakpoint } from '@mui/material/styles';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useNavGroups } from 'src/components/eocr-nav/use-nav-groups';

import { SkipLink } from './skip-link';
import { NavDrawer } from './nav-drawer';
import { NavSidebar } from './nav-sidebar';
import { useRouteFocus } from './use-route-focus';
import { ColorModeToggle } from './color-mode-toggle';
import { MenuButton } from '../components/menu-button';
import { SettingsButton } from '../components/settings-button';
import { AccountPopover } from '../components/account-popover';
import { MainSection, HeaderSection, LayoutSection, layoutClasses } from '../core';
import { dashboardLayoutVars, dashboardNavColorVars } from '../dashboard/css-vars';

// ----------------------------------------------------------------------

export const MAIN_CONTENT_ID = 'main-content';

// Links in the account popover (the template's nav-config-account.tsx, reduced to EOCR's pages).
const ACCOUNT_LINKS = [
  {
    label: 'Software catalog',
    href: paths.catalog.root,
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: 'My requests',
    href: paths.requests.root,
    icon: <Iconify icon="solar:notes-bold-duotone" />,
  },
];
const NAV_DRAWER_ID = 'primary-nav-drawer';

type Props = {
  children: React.ReactNode;
  layoutQuery?: Breakpoint;
};

/**
 * The application shell, composed from the template's layout core (LayoutSection, HeaderSection,
 * MainSection) and its dashboard CSS variables: skip link, header, fixed sidebar (or a drawer below the
 * layout breakpoint) and <main id="main-content">.
 */
export function EocrLayout({ children, layoutQuery = 'lg' }: Props) {
  const theme = useTheme();
  const navGroups = useNavGroups();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const settings = useSettingsContext();
  const isNavMini = settings.state.navLayout === 'mini';
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleNav = useCallback(
    () => settings.setState({ navLayout: isNavMini ? 'vertical' : 'mini' }),
    [isNavMini, settings]
  );

  useRouteFocus(MAIN_CONTENT_ID);

  const navVars = dashboardNavColorVars(theme);

  const header = (
    <HeaderSection
      layoutQuery={layoutQuery}
      disableElevation
      slotProps={{ container: { maxWidth: false, sx: { px: { [layoutQuery]: 5 } } } }}
      slots={{
        leftArea: (
          <MenuButton
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls={drawerOpen ? NAV_DRAWER_ID : undefined}
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
        ),
        rightArea: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
            <ColorModeToggle />
            <SettingsButton />
            <AccountPopover data={ACCOUNT_LINKS} />
          </Box>
        ),
      }}
    />
  );

  return (
    <>
      <SkipLink targetId={MAIN_CONTENT_ID} />

      <LayoutSection
        headerSection={header}
        sidebarSection={
          <NavSidebar
            groups={navGroups}
            layoutQuery={layoutQuery}
            isNavMini={isNavMini}
            onToggleNav={toggleNav}
          />
        }
        cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout }}
        sx={{
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        }}
      >
        <MainSection id={MAIN_CONTENT_ID} tabIndex={-1}>
          {children}
        </MainSection>
      </LayoutSection>

      <NavDrawer id={NAV_DRAWER_ID} open={drawerOpen} onClose={closeDrawer} groups={navGroups} />
    </>
  );
}
