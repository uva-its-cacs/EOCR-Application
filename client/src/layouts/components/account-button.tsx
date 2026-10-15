import type { IconButtonProps } from '@mui/material/IconButton';

import { useState } from 'react';
import { m } from 'framer-motion';

import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';

import { varTap, varHover, AnimateBorder, transitionTap } from 'src/components/animate';

// ----------------------------------------------------------------------

// Adapted from the template's account-button.tsx. EOCR changes:
// - The animated border moves only while the button is hovered or focused (the template's moves
//   forever; WCAG 2.2.2 and AGENTS.md), and never under reduced motion (AnimateBorder `active`).
// - The caller names the button (the template's "Account button"); the avatar image is decorative.
// - `pending` shows a skeleton until the user is known; there is no photo yet (initial letter only).
export type AccountButtonProps = IconButtonProps & {
  photoURL?: string;
  displayName?: string;
  pending?: boolean;
};

export function AccountButton({
  photoURL,
  displayName,
  pending = false,
  sx,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...other
}: AccountButtonProps) {
  const [active, setActive] = useState(false);

  return (
    <IconButton
      component={m.button}
      whileTap={varTap(0.96)}
      whileHover={varHover(1.04)}
      transition={transitionTap()}
      onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>) => {
        setActive(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event: React.MouseEvent<HTMLButtonElement>) => {
        setActive(false);
        onMouseLeave?.(event);
      }}
      onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
        setActive(true);
        onFocus?.(event);
      }}
      onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
        setActive(false);
        onBlur?.(event);
      }}
      sx={[{ p: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <AnimateBorder
        active={active}
        sx={{ p: '3px', borderRadius: '50%', width: 40, height: 40 }}
        slotProps={{
          primaryBorder: { size: 60, width: '1px', sx: { color: 'primary.main' } },
          secondaryBorder: { sx: { color: 'warning.main' } },
        }}
      >
        {pending ? (
          <Skeleton variant="circular" sx={{ width: 1, height: 1 }} />
        ) : (
          <Avatar src={photoURL} alt="" sx={{ width: 1, height: 1 }}>
            {displayName?.trim().charAt(0).toUpperCase()}
          </Avatar>
        )}
      </AnimateBorder>
    </IconButton>
  );
}
