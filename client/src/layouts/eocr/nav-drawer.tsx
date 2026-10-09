import type { NavGroupData } from 'src/components/eocr-nav/nav-data';

import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';

import { PrimaryNav } from 'src/components/eocr-nav/primary-nav';

import { Wordmark } from './wordmark';

// ----------------------------------------------------------------------

type Props = {
  id: string;
  open: boolean;
  onClose: () => void;
  groups: NavGroupData[];
};

/**
 * Mobile navigation drawer (below the layout breakpoint). MUI's modal Drawer traps focus, closes on
 * Escape and returns focus to the menu button. Focus starts on the first nav link (not on the Paper), and
 * the drawer closes on route change.
 */
export function NavDrawer({ id, open, onClose, groups }: Props) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const openedAt = useRef(pathname);

  useEffect(() => {
    if (open) openedAt.current = pathname;
  }, [open, pathname]);

  useEffect(() => {
    if (open && pathname !== openedAt.current) onClose();
  }, [open, pathname, onClose]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      disableAutoFocus
      slotProps={{
        paper: {
          id,
          sx: { width: 'var(--layout-nav-mobile-width)', bgcolor: 'var(--layout-nav-bg)' },
        },
        transition: {
          onEntered: () => contentRef.current?.querySelector<HTMLElement>('nav a')?.focus(),
        },
      }}
    >
      <Box ref={contentRef}>
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Wordmark />
        </Box>
        <PrimaryNav groups={groups} />
      </Box>
    </Drawer>
  );
}
