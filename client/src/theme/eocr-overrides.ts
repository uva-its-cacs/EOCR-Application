import type { ThemeOptions } from './types';

import { createPaletteChannel } from 'minimal-shared/utils';

import { eocrTokens } from './eocr-tokens';

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

export const eocrThemeOverrides: ThemeOptions = {
  colorSchemes: {
    light: { palette: createPalette(eocrTokens.light) },
    dark: { palette: createPalette(eocrTokens.dark) },
  },
};
