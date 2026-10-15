import type { IconButtonProps } from '@mui/material/IconButton';

import { useId } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { CustomPopover } from 'src/components/custom-popover';

import { ADMIN_ROLE_CODE } from 'src/sections/auth/types';
import { useCurrentUser } from 'src/sections/auth/use-current-user';

// ----------------------------------------------------------------------

// Adapted from the template's layouts/components/account-popover.tsx. EOCR changes:
// - The signed-in user comes from GET /api/me (useCurrentUser) instead of the mocked auth user, with
//   loading, error (Retry) and signed-out states.
// - The template's AccountButton (framer-motion AnimateBorder) is replaced by a static ring of the same
//   40px size; the button is named "Account" and reports its popup.
// - The popover is a dialog named "Account". The email wraps instead of being truncated, and each menu
//   item is the link itself (the template nests a Link inside a MenuItem).
// - No sign-out yet: the identity provider is undecided.
export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const popoverId = useId();

  const current = useCurrentUser();
  const user = current.status === 'authenticated' ? current.user : null;

  const renderUser = () => {
    switch (current.status) {
      case 'authenticated':
        return (
          <>
            <Typography variant="subtitle2">{current.user.name}</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
              {current.user.email}
            </Typography>

            <Label
              color={current.user.roleCode === ADMIN_ROLE_CODE ? 'primary' : 'default'}
              sx={{ mt: 1 }}
            >
              {current.user.roleLabel}
            </Label>
          </>
        );
      case 'unauthenticated':
        return <Typography variant="body2">You are not signed in</Typography>;
      case 'error':
        return (
          <>
            <Typography variant="body2">We could not load your account</Typography>
            <Button size="small" variant="outlined" onClick={current.refetch} sx={{ mt: 1.5 }}>
              Retry
            </Button>
          </>
        );
      default:
        return <Typography variant="body2">Loading your account</Typography>;
    }
  };

  const renderMenuActions = () => (
    <CustomPopover
      id={popoverId}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        paper: { role: 'dialog', 'aria-label': 'Account', sx: { p: 0, width: 220 } },
      }}
    >
      <Box sx={{ p: 2, pb: 1.5 }}>{renderUser()}</Box>

      {!!data.length && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuList aria-label="Account links" sx={{ p: 1, my: 1 }}>
            {data.map((option) => (
              <MenuItem
                key={option.label}
                component={RouterLink}
                href={option.href}
                onClick={onClose}
                sx={{
                  px: 1,
                  py: 0.75,
                  typography: 'body2',
                  color: 'text.secondary',
                  '& svg': { width: 24, height: 24 },
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {option.icon}

                <Box component="span" sx={{ ml: 2 }}>
                  {option.label}
                </Box>

                {option.info && (
                  <Label color="error" sx={{ ml: 1 }}>
                    {option.info}
                  </Label>
                )}
              </MenuItem>
            ))}
          </MenuList>
        </>
      )}
    </CustomPopover>
  );

  return (
    <>
      <IconButton
        aria-label="Account"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={onOpen}
        sx={[{ p: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
        {...other}
      >
        <Box
          sx={{
            p: '3px',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 1,
            borderColor: 'primary.main',
          }}
        >
          {current.status === 'loading' ? (
            <Skeleton variant="circular" sx={{ width: 1, height: 1 }} />
          ) : (
            <Avatar alt="" sx={{ width: 1, height: 1 }}>
              {user?.name.trim().charAt(0).toUpperCase()}
            </Avatar>
          )}
        </Box>
      </IconButton>

      {renderMenuActions()}
    </>
  );
}
