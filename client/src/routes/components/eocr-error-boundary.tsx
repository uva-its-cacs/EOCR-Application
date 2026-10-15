import { useEffect } from 'react';
import { useRouteError } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { themeConfig, ThemeProvider } from 'src/theme';
import { eocrThemeOverrides } from 'src/theme/eocr-overrides';

import { MotionLazy } from 'src/components/animate/motion-lazy';

import { View500 } from 'src/sections/error/500-view';

import { routeErrorMessage } from './route-error-message';

// ----------------------------------------------------------------------

/**
 * The router's error element. It renders outside App, so it brings its own theme (fonts, colors, focus
 * ring). The template's 500 view (illustration, h1) in a main landmark: the h1 is focused, the message has
 * no stack traces, and there is Reload plus a full-page link home (client routing may be what broke).
 */
export function EocrErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    document.querySelector<HTMLElement>('#main-content h1')?.focus();
  }, []);

  return (
    <ThemeProvider
      modeStorageKey={themeConfig.modeStorageKey}
      defaultMode={themeConfig.defaultMode}
      themeOverrides={eocrThemeOverrides}
    >
      <MotionLazy>
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{ minHeight: '100vh', display: 'flex', outline: 'none' }}
        >
          <View500
            title="Something went wrong"
            description={routeErrorMessage(error, import.meta.env.DEV)}
            action={
              <Box sx={{ gap: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button size="large" variant="contained" onClick={() => window.location.reload()}>
                  Reload
                </Button>
                {/* A full page load, not a router link: client routing may be what broke. */}
                <Button size="large" variant="outlined" color="inherit" href="/">
                  Go to home
                </Button>
              </Box>
            }
          />
        </Box>
      </MotionLazy>
    </ThemeProvider>
  );
}
