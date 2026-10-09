import { useRef, useEffect } from 'react';
import { useRouteError } from 'react-router';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import { themeConfig, ThemeProvider } from 'src/theme';
import { eocrThemeOverrides } from 'src/theme/eocr-overrides';

import { routeErrorMessage } from './route-error-message';

// ----------------------------------------------------------------------

/**
 * The router's error element. It renders outside App, so it brings its own theme (fonts, colors, focus
 * ring). A minimal page: main landmark, one h1 (focused), a message without stack traces, Reload and a
 * full-page link home (client routing may be what broke).
 */
export function EocrErrorBoundary() {
  const error = useRouteError();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <ThemeProvider
      modeStorageKey={themeConfig.modeStorageKey}
      defaultMode={themeConfig.defaultMode}
      themeOverrides={eocrThemeOverrides}
    >
      <title>{`Something went wrong - ${CONFIG.appName}`}</title>

      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ mx: 'auto', px: 2, py: 10, maxWidth: 640, outline: 'none' }}
      >
        <Typography
          ref={headingRef}
          variant="h4"
          component="h1"
          tabIndex={-1}
          sx={{ outline: 'none' }}
        >
          Something went wrong
        </Typography>

        <Typography sx={{ mt: 2 }}>{routeErrorMessage(error, import.meta.env.DEV)}</Typography>

        <Box sx={{ mt: 3, gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Link href="/">Go to My requests</Link>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
