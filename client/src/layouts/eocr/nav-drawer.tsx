import type { NavGroupData } from 'src/components/eocr-nav/nav-data';

import { useRef, useState, useEffect } from 'react';

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
 * Escape and returns focus to the menu button. Focus starts on the first nav link (not on the Paper). The
 * drawer closes on route change; after a nav link is chosen focus goes to the new page instead.
 */
export function NavDrawer({ id, open, onClose, groups }: Props) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const openedAt = useRef<string | null>(null);
  // After a nav link is chosen, focus goes to the new page (useRouteFocus), not back to the menu button.
  const [restoreFocus, setRestoreFocus] = useState(true);

  useEffect(() => {
    if (!open) {
      openedAt.current = null;
      return;
    }
    if (openedAt.current === null) {
      openedAt.current = pathname;
    } else if (pathname !== openedAt.current) {
      onClose();
    }
  }, [open, pathname, onClose]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      disableAutoFocus
      disableRestoreFocus={!restoreFocus}
      slotProps={{
        paper: {
          id,
          sx: { width: 'var(--layout-nav-mobile-width)', bgcolor: 'var(--layout-nav-bg)' },
        },
        transition: {
          onEnter: () => setRestoreFocus(true),
          onEntered: () => contentRef.current?.querySelector<HTMLElement>('nav a')?.focus(),
        },
      }}
    >
      <Box ref={contentRef}>
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Wordmark />
        </Box>
        <PrimaryNav
          groups={groups}
          onItemClick={(path) => {
            // Same page: just close, and focus returns to the menu button.
            if (path === pathname) onClose();
            else setRestoreFocus(false);
          }}
        />
      </Box>
    </Drawer>
  );
}
