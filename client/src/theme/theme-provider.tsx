import type { Theme, ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';
import type {} from './extend-theme-types';
import type { ThemeOptions } from './types';

import { use } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import { SettingsContext } from 'src/components/settings/context/settings-context';

import { createTheme } from './create-theme';
import { applySettingsToComponents } from './with-settings';

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps<Theme>> & {
  themeOverrides?: ThemeOptions;
};

export function ThemeProvider({ themeOverrides, children, ...other }: ThemeProviderProps) {
  // Settings are optional: the router's error boundary renders outside the SettingsProvider.
  const settings = use(SettingsContext);

  const theme = createTheme({ themeOverrides });
  const settingsStyles = applySettingsToComponents(settings?.state);

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} {...other}>
      <CssBaseline />
      {settingsStyles && <GlobalStyles styles={settingsStyles} />}
      {children}
    </ThemeVarsProvider>
  );
}
