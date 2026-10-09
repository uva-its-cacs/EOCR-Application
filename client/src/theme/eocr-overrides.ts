import type { ThemeOptions } from './types';

import { createPaletteChannel } from 'minimal-shared/utils';

import { opacity } from './core/opacity';
import { eocrTokens } from './eocr-tokens';
import { eocrMixins, eocrComponents } from './eocr-components';

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

// Soft hover tint: 0.24 instead of the template's 0.32, so the `dark` step text stays at 4.5:1 or better on it
// for every color on every surface in both schemes (at 0.32 success and warning fail in the light scheme).
const softOpacity = { ...opacity, soft: { ...opacity.soft, hoverBg: 0.24 } };

export const eocrThemeOverrides: ThemeOptions = {
  mixins: eocrMixins,
  components: {
    ...eocrComponents,
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
          // Route-change and skip-link focus targets are not controls: no ring on <main> or its h1.
          '#main-content:focus-visible, #main-content h1:focus-visible': { outline: 'none' },
          // Text fields and selects: ring the whole field, not the inner input.
          // Links: a 3px band with no gap (offset 0) so it overlaps less of the neighboring words.
          '.MuiLink-root:focus-visible:focus-visible': {
            outlineOffset: '0px',
            borderRadius: '2px',
          },
          '.MuiInputBase-input:focus-visible:focus-visible': { outline: 'none' },
          '.MuiInputBase-root:has(> .MuiInputBase-input:focus-visible)': focusRing,
          '.MuiInputBase-root:has(> .MuiSelect-select:focus-visible)': focusRing,
          // Checkbox, radio and switch: the real input is invisible (opacity 0), so ring the visible control.
          '.PrivateSwitchBase-input:focus-visible:focus-visible': { outline: 'none' },
          // The ring goes on the icon (checkbox, radio) and the track (switch), not the padded root, so it
          // does not reach the label text next to it.
          '.MuiCheckbox-root.Mui-focusVisible > .MuiSvgIcon-root': {
            ...focusRing,
            borderRadius: '6px',
          },
          '.MuiRadio-root.Mui-focusVisible > :not(input)': { ...focusRing, borderRadius: '50%' },
          '.MuiSwitch-root:has(.Mui-focusVisible) .MuiSwitch-track': focusRing,
          // Items inside a Paper that clips (menus, drawers, lists, our nav): inset the ring so it is not cut off.
          '.MuiMenuItem-root:focus-visible:focus-visible, .MuiListItemButton-root:focus-visible:focus-visible, .eocr-nav__item:focus-visible:focus-visible':
            {
              outlineOffset: '-3px',
            },
          // DataGrid cells and column headers: 3px inset ring (MUI X draws a 1px one). Doubled class beats its CSS.
          '.MuiDataGrid-root.MuiDataGrid-root .MuiDataGrid-cell:focus, .MuiDataGrid-root.MuiDataGrid-root .MuiDataGrid-columnHeader:focus':
            {
              outline: `3px solid ${theme.vars.palette.primary.main}`,
              outlineOffset: '-3px',
            },
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
    light: { palette: createPalette(eocrTokens.light), opacity: softOpacity },
    dark: { palette: createPalette(eocrTokens.dark), opacity: softOpacity },
  },
};
