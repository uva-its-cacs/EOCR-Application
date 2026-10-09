import type { Breakpoint } from '@mui/material/styles';
import type { NavGroupData } from 'src/components/eocr-nav/nav-data';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { PrimaryNav } from 'src/components/eocr-nav/primary-nav';

import { Wordmark } from './wordmark';

// ----------------------------------------------------------------------

type Props = {
  groups: NavGroupData[];
  layoutQuery: Breakpoint;
};

// Fixed sidebar from the layout breakpoint up (the drawer takes over below it). Same look as the
// template's vertical nav: --layout-nav-* variables for width, background and border.
export function NavSidebar({ groups, layoutQuery }: Props) {
  return (
    <Box
      sx={(theme) => ({
        top: 0,
        left: 0,
        height: '100%',
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        backgroundColor: 'var(--layout-nav-bg)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
        [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
      })}
    >
      <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
        <Wordmark />
      </Box>

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pt: 1 }}>
        <PrimaryNav groups={groups} />
      </Box>
    </Box>
  );
}
