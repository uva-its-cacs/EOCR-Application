import type { Theme, Components } from '@mui/material/styles';

import { components as templateComponents } from './core/components';
// ----------------------------------------------------------------------

/**
 * EOCR component overrides. They are composed with the template's own overrides, never copied.
 *
 * Why `extend`: `themeOverrides` is deep-merged into the template theme. A plain object merges, but a
 * function replaces the template's function and an array (`variants`) replaces the template's array, so
 * passing our own `styleOverrides.root` function would drop all of the template's styles for it.
 * `extend` calls the template's style (function or object) and appends ours, including `variants`.
 * Tests prove the template's output survives: see theme-composition.test.ts.
 */

type StyleArgs = { theme: Theme } & Record<string, unknown>;
type Rules = Record<string, unknown> & { variants?: unknown[] };
type Style = Rules | ((args: StyleArgs) => Rules) | undefined;

function resolve(style: Style, args: StyleArgs): Rules {
  return typeof style === 'function' ? style(args) : (style ?? {});
}

function mergeRules(base: Rules, ours: Rules): Rules {
  const variants = [...(base.variants ?? []), ...(ours.variants ?? [])];
  return { ...base, ...ours, ...(variants.length ? { variants } : {}) };
}

export function extend(base: Style, ours: Style): Style {
  if (typeof base !== 'function' && typeof ours !== 'function') {
    return mergeRules(base ?? {}, ours ?? {});
  }

  return (args) => mergeRules(resolve(base, args), resolve(ours, args));
}

// The template's style for a component slot, typed loosely so it can be composed. The composed result is
// cast with `as never` because MUI's per-slot override types are too strict to express a composed function.
function templateStyle(component: keyof Components<Theme>, slot: string): Style {
  const entry = templateComponents[component] as
    | { styleOverrides?: Record<string, Style> }
    | undefined;
  const overrides = entry?.styleOverrides;
  return overrides?.[slot];
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export const eocrComponents: Components<Theme> = {
  // Placeholder text uses `shared.inputOutlined` (4.5:1 or better, visibly lighter than entered text).
  MuiInputBase: {
    styleOverrides: {
      input: extend(templateStyle('MuiInputBase', 'input'), ({ theme }: StyleArgs) => ({
        '&::placeholder, &::-webkit-input-placeholder, &::-moz-placeholder, &:-ms-input-placeholder, &::-ms-input-placeholder':
          { color: theme.vars.palette.shared.inputOutlined },
      })) as never,
    },
  },

  // The unshrunk floating label uses `text.secondary` (the template's `text.disabled` fails).
  MuiInputLabel: {
    styleOverrides: {
      root: extend(templateStyle('MuiInputLabel', 'root'), ({ theme }: StyleArgs) => ({
        variants: [
          {
            props: (props: { shrink?: boolean }) => !props.shrink,
            style: { color: theme.vars.palette.text.secondary },
          },
        ],
      })) as never,
    },
  },

  // Inline links are underlined at rest, with the underline at full `currentColor`.
  // Links in breadcrumbs, navigation and button-like contexts keep a hover-only underline.
  MuiLink: {
    defaultProps: { underline: 'always' },
    styleOverrides: {
      root: { '--Link-underlineColor': 'currentColor' },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        '& .MuiLink-underlineAlways': {
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        },
      },
    },
  },
};
