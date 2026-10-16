import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { toast } from 'src/components/snackbar';
import { focusPageHeading } from 'src/components/page-header';

import { useCurrentUser } from 'src/sections/auth/use-current-user';
import { useDevUsers, resetDevUser, switchDevUser } from 'src/sections/auth/dev-users';

// ----------------------------------------------------------------------

// Development only: act as another seeded user to check permission-based behavior. The server keeps the
// choice in a cookie (honored only in Development) and every check still runs on the server. After a
// switch all queries reload (the current user, nav, guards and page data) and the catalog opens.
type Props = {
  // Called after a switch (the account popover closes).
  onSwitched: () => void;
};

export function DevUserSwitcher({ onSwitched }: Props) {
  const headingId = useId();
  const client = useQueryClient();
  const navigate = useNavigate();
  const current = useCurrentUser();
  const users = useDevUsers(true);
  const [busy, setBusy] = useState(false);
  const currentEmail = current.status === 'authenticated' ? current.user.email : null;

  const run = async (change: () => Promise<void>, describe: () => string) => {
    if (busy) return;
    setBusy(true);
    try {
      await change();
      onSwitched();
      navigate(paths.catalog.root);
      await client.resetQueries();
      toast.success(describe());
      requestAnimationFrame(() => focusPageHeading());
    } catch {
      toast.error('Could not switch users. Is the API running in Development?', {
        duration: Infinity,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box component="section" aria-labelledby={headingId} aria-busy={busy} sx={{ p: 1.5 }}>
      <Typography
        id={headingId}
        component="h2"
        variant="overline"
        sx={{ display: 'block', px: 0.5, mb: 1, color: 'text.secondary' }}
      >
        Development: view as
      </Typography>

      {users.isError && (
        <Typography variant="body2" sx={{ px: 0.5 }}>
          The user list could not be loaded.
        </Typography>
      )}

      <Box
        component="ul"
        sx={{ m: 0, p: 0, gap: 0.5, display: 'flex', listStyle: 'none', flexDirection: 'column' }}
      >
        {users.data?.map((user) => {
          const isCurrent = user.email === currentEmail;
          return (
            <li key={user.userId}>
              <Button
                fullWidth
                color="inherit"
                aria-pressed={isCurrent}
                aria-disabled={busy}
                onClick={() => {
                  if (isCurrent) return;
                  void run(
                    () => switchDevUser(user.email),
                    () => `Now viewing as ${user.name} (${user.roleLabel}).`
                  );
                }}
                sx={{
                  py: 0.75,
                  px: 1,
                  display: 'block',
                  textAlign: 'left',
                  fontWeight: 'fontWeightRegular',
                  bgcolor: isCurrent ? 'action.selected' : undefined,
                }}
              >
                <Box component="span" sx={{ display: 'block', typography: 'subtitle2' }}>
                  {user.name}
                  {isCurrent && ' (current)'}
                </Box>
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    typography: 'caption',
                    color: 'text.secondary',
                    wordBreak: 'break-all',
                  }}
                >
                  {user.roleLabel}, {user.email}
                </Box>
              </Button>
            </li>
          );
        })}
      </Box>

      <Button
        size="small"
        variant="outlined"
        color="inherit"
        aria-disabled={busy}
        onClick={() => {
          void run(resetDevUser, () => 'Back to the default development user.');
        }}
        sx={{ mt: 1 }}
      >
        Reset to default
      </Button>
    </Box>
  );
}
