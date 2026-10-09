import type { ThemeOptions } from './types';

import { setFont, createPaletteChannel } from 'minimal-shared/utils';

import { eocrTokens } from './eocr-tokens';
import { themeConfig } from './theme-config';

// ----------------------------------------------------------------------

/**
 * EOCR theme overrides, passed to the template's `createTheme` through `themeOverrides`.
 * Palette colors go through `createPaletteChannel` so the `*Channel` values (used by `varAlpha`
 * tints) are regenerated in both color schemes.
 */

type SchemeTokens = typeof eocrTokens.light;

function createPalette(tokens: SchemeTokens) {
  return {
    primary: createPaletteChannel(tokens.primary),
    secondary: createPaletteChannel(tokens.secondary),
    info: createPaletteChannel(tokens.info),
    success: createPaletteChannel(tokens.success),
    warning: createPaletteChannel(tokens.warning),
    error: createPaletteChannel(tokens.error),
    text: createPaletteChannel({ secondary: tokens.textSecondary }),
    shared: {
      inputOutlined: tokens.inputOutlined,
      buttonOutlined: tokens.buttonOutlined,
    },
  };
}

// One font family for all text: the template's secondary (heading) font is replaced by the primary.
const publicSans = setFont(themeConfig.fontFamily.primary);

export const eocrThemeOverrides: ThemeOptions = {
  typography: {
    fontSecondaryFamily: publicSans,
    h1: { fontFamily: publicSans },
    h2: { fontFamily: publicSans },
    h3: { fontFamily: publicSans },
  },
  colorSchemes: {
    light: { palette: createPalette(eocrTokens.light) },
    dark: { palette: createPalette(eocrTokens.dark) },
  },
};
