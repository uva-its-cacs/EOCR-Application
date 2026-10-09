import type { RouteObject } from 'react-router';
import type { RenderResult } from '@testing-library/react';

import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { themeConfig, ThemeProvider } from 'src/theme';
import { eocrThemeOverrides } from 'src/theme/eocr-overrides';

// ----------------------------------------------------------------------

// Component tests render inside the app theme, as the app does (template components read theme.vars).
export function renderWithTheme(ui: React.ReactElement): RenderResult {
  return render(
    <ThemeProvider
      modeStorageKey={themeConfig.modeStorageKey}
      defaultMode={themeConfig.defaultMode}
      themeOverrides={eocrThemeOverrides}
    >
      {ui}
    </ThemeProvider>
  );
}

// Renders routes in a memory router at the given path, for components that read route matches.
export function renderRoutes(routes: RouteObject[], path: string): RenderResult {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  return renderWithTheme(<RouterProvider router={router} />);
}
