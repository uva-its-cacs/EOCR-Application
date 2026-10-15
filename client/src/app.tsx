import 'src/global.css';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { usePathname } from 'src/routes/hooks';

import { queryClient } from 'src/lib/query-client';
import { themeConfig, ThemeProvider } from 'src/theme';
import { eocrThemeOverrides } from 'src/theme/eocr-overrides';

import { Snackbar } from 'src/components/snackbar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <SettingsProvider defaultSettings={defaultSettings}>
      <ThemeProvider
        modeStorageKey={themeConfig.modeStorageKey}
        defaultMode={themeConfig.defaultMode}
        themeOverrides={eocrThemeOverrides}
      >
        <QueryClientProvider client={queryClient}>
          <MotionLazy>
            <Snackbar />
            <SettingsDrawer defaultSettings={defaultSettings} />
            {children}
          </MotionLazy>
        </QueryClientProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
