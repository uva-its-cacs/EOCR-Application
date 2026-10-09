import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Dark mode toggle: a toggle button with a static name ("Dark mode") and aria-pressed for its state.
 * Pressed is also shown without color alone: a filled background (text.primary, well over 3:1 against the
 * header in both schemes) behind the icon. MUI stores the choice under the template's mode storage key.
 */
export function ColorModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark';

  return (
    <Tooltip title="Dark mode">
      <IconButton
        aria-label="Dark mode"
        aria-pressed={isDark}
        onClick={() => setMode(isDark ? 'light' : 'dark')}
        sx={(theme) => ({
          ...(isDark && {
            color: theme.vars.palette.background.default,
            backgroundColor: theme.vars.palette.text.primary,
            '&:hover': { backgroundColor: theme.vars.palette.text.secondary },
          }),
        })}
      >
        <Iconify icon="solar:cloudy-moon-bold-duotone" width={22} />
      </IconButton>
    </Tooltip>
  );
}
