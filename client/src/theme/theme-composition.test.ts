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
});
