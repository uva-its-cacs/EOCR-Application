import type { Breakpoint } from '@mui/material/styles';
import type { NavGroupData } from 'src/components/eocr-nav/nav-data';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { PrimaryNav } from 'src/components/eocr-nav/primary-nav';

import { Wordmark } from './wordmark';

// ----------------------------------------------------------------------

type Props = {
  groups: NavGroupData[];
  layoutQuery: Breakpoint;
  compact: boolean;
  onToggleCompact: () => void;
};

// Fixed sidebar from the layout breakpoint up (the drawer takes over below it). Same look as the
// template's vertical nav: --layout-nav-* variables for width, background and border.
export function NavSidebar({ groups, layoutQuery, compact, onToggleCompact }: Props) {
  return (
    <Box
      data-color-scheme="dark"
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: compact ? 'center' : 'flex-start',
          pl: compact ? 0 : 3.5,
          pt: 2.5,
          pb: 1,
          minHeight: 72,
        }}
      >
        <Wordmark compact={compact} />
      </Box>

      <IconButton
        aria-label={compact ? 'Expand navigation' : 'Collapse navigation'}
        aria-expanded={!compact}
        aria-controls="primary-nav-sidebar"
        onClick={onToggleCompact}
        size="small"
        sx={{
          position: 'absolute',
          top: 28,
          right: -13,
          zIndex: 1,
          width: 26,
          height: 26,
          color: 'text.secondary',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Iconify
          aria-hidden
          icon={compact ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
          width={16}
        />
      </IconButton>

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pt: 1 }}>
        <PrimaryNav id="primary-nav-sidebar" groups={groups} compact={compact} />
      </Box>
    </Box>
  );
}
