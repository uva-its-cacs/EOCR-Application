import { it, expect, describe } from 'vitest';

import { createTheme } from './create-theme';
import { eocrThemeOverrides } from './eocr-overrides';

// ----------------------------------------------------------------------

/**
 * Proves that our component overrides are composed with the template's, not replacing them.
 * `themeOverrides` replaces a template style function (or `variants` array) when both are present, so
 * `eocr-components.ts` composes them with `extend`. These tests compare the resolved style of the template
 * theme with the resolved style of our theme: everything the template produced must still be there.
 */

type Rules = Record<string, unknown> & { variants?: unknown[] };
type Overrides = Record<string, Record<string, unknown> | undefined>;
type ThemeLike = ReturnType<typeof createTheme>;

const template = createTheme();
const ours = createTheme({ themeOverrides: eocrThemeOverrides });

function slot(theme: ThemeLike, component: string, name: string): Rules {
  const overrides = (
    theme.components as Record<string, { styleOverrides?: Overrides } | undefined>
  )[component]?.styleOverrides?.[name];
  const resolved =
    typeof overrides === 'function'
      ? (overrides as (a: unknown) => Rules)({ theme, ownerState: {} })
      : overrides;
  return (resolved ?? {}) as Rules;
}

type Variant = {
  props: (p: Record<string, unknown>) => boolean;
  style: (a: { theme: ThemeLike }) => Record<string, unknown>;
};

function lastMatching(variants: Variant[], props: Record<string, unknown>): Variant {
  const matches = variants.filter(
    (variant) => typeof variant.props === 'function' && variant.props(props)
  );
  return matches[matches.length - 1];
}

function expectTemplateSurvives(component: string, name: string) {
  const before = slot(template, component, name);
  const after = slot(ours, component, name);

  // every key the template produced (focus, disabled, hover, ... rules) is still produced
  for (const key of Object.keys(before))
    expect(Object.keys(after), `${component}.${name}: ${key}`).toContain(key);

  // every template variant is still there, in the same order, and ours come after
  const beforeVariants = before.variants ?? [];
  const afterVariants = after.variants ?? [];
  expect(afterVariants.length).toBeGreaterThanOrEqual(beforeVariants.length);
  // (the template builds new objects on each call, so compare by content, not identity)
  const toComparable = (variant: unknown) =>
    JSON.stringify(variant, (_key, value) => (typeof value === 'function' ? 'fn' : value));
  beforeVariants.forEach((variant, index) =>
    expect(toComparable(afterVariants[index])).toBe(toComparable(variant))
  );

  return { before, after };
}

describe('component overrides keep the template styles', () => {
  it('OutlinedInput root keeps focus, disabled and variants', () => {
    const { after } = expectTemplateSurvives('MuiOutlinedInput', 'root');
    expect(Object.keys(after)).toContain('&.Mui-focused:not(.Mui-error)');
    expect(Object.keys(after)).toContain('&.Mui-disabled');
    expect(after.variants?.length).toBeGreaterThan(0);
  });

  it('InputBase input keeps the template rules and variants, with our placeholder color', () => {
    const { before, after } = expectTemplateSurvives('MuiInputBase', 'input');
    expect(after.variants?.length).toBe(before.variants?.length);
    const placeholder = Object.entries(after).find(([key]) => key.startsWith('&::placeholder'));
    expect(placeholder?.[1]).toEqual({ color: ours.vars.palette.shared.inputOutlined });
  });

  it('InputLabel root keeps its variants and adds ours last', () => {
    const { before, after } = expectTemplateSurvives('MuiInputLabel', 'root');
    expect(after.variants?.length).toBe((before.variants?.length ?? 0) + 1);
    const last = (after.variants as unknown as { style: Record<string, unknown> }[]).at(-1);
    expect(last?.style).toEqual({ color: ours.vars.palette.text.secondary });
  });

  it('Link is underlined at rest with a full currentColor underline', () => {
    const link = (
      ours.components as Record<
        string,
        { defaultProps?: Record<string, unknown>; styleOverrides?: Overrides }
      >
    ).MuiLink;
    expect(link.defaultProps?.underline).toBe('always');
    expect((link.styleOverrides?.root as Rules)['--Link-underlineColor']).toBe('currentColor');
    // the template's own Link keys are still there
    expect(Object.keys(slot(ours, 'MuiLink', 'root'))).toEqual(
      expect.arrayContaining(Object.keys(slot(template, 'MuiLink', 'root')))
    );
  });

  it('Breadcrumbs links keep a hover-only underline', () => {
    const root = slot(ours, 'MuiBreadcrumbs', 'root') as Record<string, Record<string, unknown>>;
    expect(root['& .MuiLink-underlineAlways'].textDecoration).toBe('none');
  });

  it('Button root keeps all template variants and adds ours last', () => {
    const { before, after } = expectTemplateSurvives('MuiButton', 'root');
    expect(after.variants?.length).toBe((before.variants?.length ?? 0) + 12);
  });

  it('Button: colored outlined and text buttons use the dark step on hover, outlined border is solid main', () => {
    const variants = (slot(ours, 'MuiButton', 'root').variants ?? []) as Variant[];
    const outlined = lastMatching(variants, { variant: 'outlined', color: 'primary' });
    const text = lastMatching(variants, { variant: 'text', color: 'primary' });
    const vars = ours.vars.palette.primary;
    expect(outlined.style({ theme: ours })).toMatchObject({
      borderColor: vars.main,
      '&:hover': { color: vars.dark },
    });
    expect(text.style({ theme: ours })).toMatchObject({ '&:hover': { color: vars.dark } });
  });

  it('Chip root keeps all template variants and adds ours last', () => {
    const { before, after } = expectTemplateSurvives('MuiChip', 'root');
    expect(after.variants?.length).toBe((before.variants?.length ?? 0) + 6);
  });

  it('Chip avatar keeps its variants; the dark scheme uses contrastText on the dark fill', () => {
    const { before, after } = expectTemplateSurvives('MuiChip', 'avatar');
    expect(after.variants?.length).toBe((before.variants?.length ?? 0) + 6);
    const variant = lastMatching((after.variants ?? []) as Variant[], { color: 'primary' });
    const css = JSON.stringify(variant.style({ theme: ours }));
    expect(css).toContain(ours.vars.palette.primary.contrastText);
    expect(css).toContain(ours.vars.palette.primary.dark);
  });

  it('Avatar default letters use text.secondary', () => {
    const { before, after } = expectTemplateSurvives('MuiAvatar', 'colorDefault');
    expect(after.variants?.length).toBe((before.variants?.length ?? 0) + 1);
    const last = (after.variants as Variant[]).at(-1) as Variant;
    expect(last.style({ theme: ours })).toEqual({ color: ours.vars.palette.text.secondary });
  });
});

describe('soft styles (Label, Chip and Button soft)', () => {
  it('use the dark step as text in both schemes, with and without hover', () => {
    for (const color of ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const) {
      const dark = ours.vars.palette[color].dark;
      for (const options of [undefined, { hover: true }]) {
        const css = ours.mixins.softStyles(ours, color, options) as Record<string, unknown>;
        expect(css.color).toBe(dark);
        // the template sets `light` for the dark scheme through applyStyles; ours replaces it
        const darkScheme = Object.entries(css).find(([key]) => key.includes('dark'))?.[1];
        expect(darkScheme).toEqual({ color: dark });
      }
    }
  });

  it('leave the default color alone', () => {
    const before = template.mixins.softStyles(template, 'default');
    expect(ours.mixins.softStyles(ours, 'default')).toEqual(before);
  });
});

describe('focus ring rules (MuiCssBaseline)', () => {
  type Css = Record<string, Record<string, unknown>>;
  const baseline = (ours.components as Record<string, { styleOverrides?: unknown }>).MuiCssBaseline;
  const css = (baseline.styleOverrides as (theme: ThemeLike) => Css)(ours);
  const ruleFor = (fragment: string) =>
    Object.entries(css).find(([key]) => key.includes(fragment))?.[1];

  it('rings every focus-visible element with 3px and a 2px offset', () => {
    expect(ruleFor('*:focus-visible:focus-visible')).toMatchObject({
      outline: `3px solid ${ours.vars.palette.primary.main}`,
      outlineOffset: '2px',
    });
  });

  it('insets the ring on menu and list items so a clipping Paper does not cut it off', () => {
    expect(ruleFor('.MuiMenuItem-root:focus-visible')).toMatchObject({ outlineOffset: '-3px' });
    expect(ruleFor('.MuiListItemButton-root:focus-visible')).toMatchObject({
      outlineOffset: '-3px',
    });
  });

  it('draws a 3px inset ring on DataGrid cells and column headers', () => {
    const rule = ruleFor('.MuiDataGrid-cell:focus');
    expect(rule).toMatchObject({
      outline: `3px solid ${ours.vars.palette.primary.main}`,
      outlineOffset: '-3px',
    });
    expect(Object.keys(css).find((key) => key.includes('.MuiDataGrid-cell:focus'))).toContain(
      '.MuiDataGrid-columnHeader:focus'
    );
  });

  it('puts the checkbox, radio and switch ring on the icon or track, not the padded root', () => {
    expect(ruleFor('.MuiCheckbox-root.Mui-focusVisible >')).toBeDefined();
    expect(ruleFor('.MuiRadio-root.Mui-focusVisible >')).toBeDefined();
    expect(ruleFor('.MuiSwitch-track')).toBeDefined();
  });

  it('keeps inline link rings tight (offset 0)', () => {
    expect(ruleFor('.MuiLink-root:focus-visible')).toMatchObject({ outlineOffset: '0px' });
  });

  it('turns motion off under prefers-reduced-motion', () => {
    expect(ruleFor('prefers-reduced-motion')).toBeDefined();
  });
});
