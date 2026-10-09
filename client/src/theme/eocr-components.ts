import type { Theme, Components, ComponentsVariants } from '@mui/material/styles';

import { chipClasses } from '@mui/material/Chip';

import { colorKeys } from './core/palette';
import { softStyles } from './core/mixins/global-styles-components';
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

const COLORS = colorKeys.palette;

/**
 * Button. Colored outlined buttons get a solid `main` border (3:1 or better on every surface), and
 * colored outlined and text buttons use the `dark` step as text on hover (the hover tint sits under the
 * text). In the dark scheme `dark` is the lighter step, so the same rule holds there.
 */
type ButtonVariants = ComponentsVariants<Theme>['MuiButton'];
type ChipVariants = ComponentsVariants<Theme>['MuiChip'];

const buttonVariants = [
  ...(COLORS.map((color) => ({
    props: (props) => props.variant === 'outlined' && props.color === color,
    style: ({ theme }) => ({
      borderColor: theme.vars.palette[color].main,
      '&:hover': {
        color: theme.vars.palette[color].dark,
        borderColor: 'currentColor',
      },
    }),
  })) satisfies ButtonVariants),
  ...(COLORS.map((color) => ({
    props: (props) => props.variant === 'text' && props.color === color,
    style: ({ theme }) => ({
      '&:hover': { color: theme.vars.palette[color].dark },
    }),
  })) satisfies ButtonVariants),
];

/**
 * Chip. Clickable outlined chips use the `dark` step as hover text. The avatar inside a colored chip
 * uses `contrastText` on the `dark` fill in the dark scheme (the template's `lighter` text on the
 * lighter `dark` fill has no contrast there).
 */
const chipRootVariants = COLORS.map((color) => ({
  props: (props) => props.variant === 'outlined' && props.color === color,
  style: ({ theme }) => ({
    [`&.${chipClasses.clickable}:hover`]: { color: theme.vars.palette[color].dark },
  }),
})) satisfies ChipVariants;

const chipAvatarVariants = COLORS.map((color) => ({
  props: (props) => props.color === color,
  style: ({ theme }) =>
    theme.applyStyles('dark', {
      color: theme.vars.palette[color].contrastText,
      backgroundColor: theme.vars.palette[color].dark,
    }),
})) satisfies ChipVariants;

// ----------------------------------------------------------------------

export const eocrComponents: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: extend(templateStyle('MuiButton', 'root'), { variants: buttonVariants }) as never,
    },
  },

  MuiChip: {
    styleOverrides: {
      root: extend(templateStyle('MuiChip', 'root'), { variants: chipRootVariants }) as never,
      avatar: extend(templateStyle('MuiChip', 'avatar'), { variants: chipAvatarVariants }) as never,
    },
  },

  // Default letters: `text.secondary` (the template's `action.active` is under 4.5:1 on the avatar fill).
  MuiAvatar: {
    styleOverrides: {
      colorDefault: extend(templateStyle('MuiAvatar', 'colorDefault'), {
        variants: [
          {
            props: {},
            style: ({ theme }: StyleArgs) => ({ color: theme.vars.palette.text.secondary }),
          },
        ],
      }) as never,
    },
  },

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

// ----------------------------------------------------------------------

/**
 * `theme.mixins.softStyles` (used by soft Label, Chip and Button): the text color is the `dark` step in
 * both schemes. The template uses the `light` step in the dark scheme, which fails for secondary.
 * Replaced through `themeOverrides.mixins`; it calls the template's function and then sets the color.
 */
const PALETTE_KEYS: readonly string[] = COLORS;

export const eocrMixins = {
  softStyles: ((theme, colorKey, options) => {
    const base = softStyles(theme, colorKey, options);
    if (!PALETTE_KEYS.includes(colorKey)) return base;

    const color = theme.vars.palette[colorKey as (typeof COLORS)[number]].dark;

    return { ...base, color, ...theme.applyStyles('dark', { color }) };
  }) as typeof softStyles,
};
