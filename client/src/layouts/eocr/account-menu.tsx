import { useId, useState } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useCurrentUser } from 'src/sections/auth/use-current-user';

// ----------------------------------------------------------------------

/**
 * Account button and popover. The popover is a small dialog named "Account" that shows who is signed in,
 * or the state when that is not known. No sign-out yet: the identity provider is undecided.
 */
export function AccountMenu() {
  const current = useCurrentUser();
  const popoverId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  const initial =
    current.status === 'authenticated' ? current.user.name.trim().charAt(0).toUpperCase() : null;

  const renderContent = () => {
    switch (current.status) {
      case 'authenticated':
        return (
          <>
            <Typography variant="subtitle2">{current.user.name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
              {current.user.email}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Role: {current.user.roleLabel}
            </Typography>
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

  return (
    <>
      <IconButton
        aria-label="Account"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        {current.status === 'loading' ? (
          <Skeleton variant="circular" width={32} height={32} />
        ) : (
          <Avatar sx={{ width: 32, height: 32, fontSize: 15 }}>{initial}</Avatar>
        )}
      </IconButton>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { role: 'dialog', 'aria-label': 'Account', sx: { mt: 1, width: 260 } },
        }}
      >
        <Box sx={{ p: 2 }}>{renderContent()}</Box>
      </Popover>
    </>
  );
}
