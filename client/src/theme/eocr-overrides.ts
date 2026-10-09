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
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => {
        // Focus ring: 3px, 2px offset, primary token (>= 3:1 on default and paper in both schemes).
        // Doubled pseudo-class raises specificity above MUI's `outline: 0` resets on ButtonBase and InputBase.
        const focusRing = {
          outline: `3px solid ${theme.vars.palette.primary.main}`,
          outlineOffset: '2px',
        };

        return {
          '*:focus-visible:focus-visible': focusRing,
          // Text fields and selects: ring the whole field, not the inner input.
          '.MuiInputBase-input:focus-visible:focus-visible': { outline: 'none' },
          '.MuiInputBase-root:has(> .MuiInputBase-input:focus-visible)': focusRing,
          '.MuiInputBase-root:has(> .MuiSelect-select:focus-visible)': focusRing,
          // Checkbox, radio and switch: the real input is invisible (opacity 0), so ring the visible control.
          '.PrivateSwitchBase-input:focus-visible:focus-visible': { outline: 'none' },
          '.MuiCheckbox-root.Mui-focusVisible, .MuiRadio-root.Mui-focusVisible': focusRing,
          '.MuiSwitch-root:has(.Mui-focusVisible)': focusRing,
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        };
      },
    },
  },
  colorSchemes: {
    light: { palette: createPalette(eocrTokens.light) },
    dark: { palette: createPalette(eocrTokens.dark) },
  },
};
