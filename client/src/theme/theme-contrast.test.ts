import { it, expect, describe } from 'vitest';

import { createTheme } from './create-theme';
import { eocrThemeOverrides } from './eocr-overrides';

// ----------------------------------------------------------------------

/**
 * WCAG contrast guard for the real theme (template + our overrides, both color schemes).
 * Ratios are computed from unrounded values and compared with the threshold as is.
 * Pairs the template still fails (placeholder, floating label, switch track, ...) are NOT asserted
 * here; they are listed in docs/migration/theme-contrast.md with the slice that fixes each.
 */

type Scheme = 'light' | 'dark';
type Rgb = { r: number; g: number; b: number; a: number };

// A palette path such as 'primary.main', or `{ top, on }`: the `top` token composited over the `on` token,
// which is how an alpha token (for example action.hover) looks when it sits on a surface.
type Ref = string | { top: string; on: string };

type Pair = {
  name: string;
  schemes: Scheme[];
  fg: Ref;
  bg: Ref;
  min: number;
};

const TEXT = 4.5;
const UI = 3;

const BOTH: Scheme[] = ['light', 'dark'];
const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'];
const SURFACES = ['background.default', 'background.paper', 'background.neutral'];
const STATE_OVERLAYS = ['action.hover', 'action.selected'];
const TEXT_TOKENS = ['text.primary', 'text.secondary'];
const BORDER_TOKENS = ['shared.inputOutlined', 'shared.buttonOutlined'];

// ----------------------------------------------------------------------
// The pair list (readable data). Edit the lists above to change what is guarded.
// ----------------------------------------------------------------------

export const PAIRS: Pair[] = [
  // Text on a filled color: contained buttons, filled chips (rest and hover).
  ...COLORS.flatMap((c) => [
    {
      name: `${c}.contrastText on ${c}.main`,
      schemes: BOTH,
      fg: `${c}.contrastText`,
      bg: `${c}.main`,
      min: TEXT,
    },
    {
      name: `${c}.contrastText on ${c}.dark (hover)`,
      schemes: BOTH,
      fg: `${c}.contrastText`,
      bg: `${c}.dark`,
      min: TEXT,
    },
  ]),

  // Color as text (outlined and text buttons, links): main on every surface in both schemes.
  ...COLORS.flatMap((c) =>
    SURFACES.map((s) => ({
      name: `${c}.main as text on ${s}`,
      schemes: BOTH,
      fg: `${c}.main`,
      bg: s,
      min: TEXT,
    }))
  ),

  // Dark step as text (soft variants and outlined alerts use it in the light scheme only).
  ...COLORS.flatMap((c) =>
    SURFACES.map((s) => ({
      name: `${c}.dark as text on ${s}`,
      schemes: ['light' as Scheme],
      fg: `${c}.dark`,
      bg: s,
      min: TEXT,
    }))
  ),

  // Primary and secondary text on every surface, also under the hover and selected overlays.
  ...TEXT_TOKENS.flatMap((t) =>
    SURFACES.flatMap((s) => [
      { name: `${t} on ${s}`, schemes: BOTH, fg: t, bg: s, min: TEXT },
      ...STATE_OVERLAYS.map((o) => ({
        name: `${t} on ${s} + ${o}`,
        schemes: BOTH,
        fg: t,
        bg: { top: o, on: s },
        min: TEXT,
      })),
    ])
  ),

  // Placeholder text (shared.inputOutlined) is lighter than entered text but still 4.5:1. Placeholders are
  // never the only instruction: visible labels stay required.
  ...SURFACES.map((s) => ({
    name: `placeholder (shared.inputOutlined) on ${s}`,
    schemes: BOTH,
    fg: 'shared.inputOutlined',
    bg: s,
    min: TEXT,
  })),

  // UI components (3:1): input and button outlines on every surface, and the primary color as an outline
  // (the focus ring uses primary.main).
  ...BORDER_TOKENS.flatMap((t) =>
    SURFACES.map((s) => ({
      name: `${t} on ${s}`,
      schemes: BOTH,
      fg: { top: t, on: s },
      bg: s,
      min: UI,
    }))
  ),
  ...SURFACES.map((s) => ({
    name: `primary.main as outline/focus ring on ${s}`,
    schemes: BOTH,
    fg: 'primary.main',
    bg: s,
    min: UI,
  })),
];

// ----------------------------------------------------------------------
// Color math (WCAG 2.1, unrounded)
// ----------------------------------------------------------------------

function parseColor(value: string): Rgb {
  const color = value.trim();

  const hex = color.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    return {
      r: parseInt(hex[1].slice(0, 2), 16),
      g: parseInt(hex[1].slice(2, 4), 16),
      b: parseInt(hex[1].slice(4, 6), 16),
      a: 1,
    };
  }

  const rgb = color.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/i
  );
  if (rgb) {
    const alpha =
      rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? parseFloat(rgb[4]) / 100 : Number(rgb[4]);
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a: alpha };
  }

  throw new Error(`Cannot parse color "${value}"`);
}

function composite(fg: Rgb, bg: Rgb): Rgb {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(c: Rgb): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ----------------------------------------------------------------------
// Theme access
// ----------------------------------------------------------------------

type PaletteNode = { [key: string]: PaletteNode | string };

export function buildPalette(scheme: Scheme, overrides = eocrThemeOverrides): PaletteNode {
  const theme = createTheme({ themeOverrides: overrides });
  const palette = theme.colorSchemes[scheme]?.palette;
  if (!palette) throw new Error(`No ${scheme} color scheme`);
  return palette as unknown as PaletteNode;
}

function lookup(palette: PaletteNode, path: string): string {
  let node: PaletteNode | string = palette;
  for (const key of path.split('.')) {
    if (typeof node === 'string' || node[key] === undefined)
      throw new Error(`Missing palette token "${path}"`);
    node = node[key];
  }
  if (typeof node !== 'string') throw new Error(`Palette token "${path}" is not a color`);
  return node;
}

function resolve(palette: PaletteNode, ref: Ref): Rgb {
  if (typeof ref === 'string') return parseColor(lookup(palette, ref));
  return composite(parseColor(lookup(palette, ref.top)), parseColor(lookup(palette, ref.on)));
}

export function pairRatio(palette: PaletteNode, pair: Pair): number {
  return contrastRatio(resolve(palette, pair.fg), resolve(palette, pair.bg));
}

// ----------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------

describe('theme contrast (WCAG 2.1 AA)', () => {
  for (const scheme of BOTH) {
    describe(`${scheme} scheme`, () => {
      const palette = buildPalette(scheme);

      it.each(PAIRS.filter((p) => p.schemes.includes(scheme)).map((p) => [p.name, p] as const))(
        '%s',
        (_name, pair) => {
          expect(pairRatio(palette, pair)).toBeGreaterThanOrEqual(pair.min);
        }
      );
    });
  }

  it('computes known WCAG ratios', () => {
    const black = parseColor('#000000');
    const white = parseColor('#FFFFFF');
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
  });

  it('fails when a token drops below its threshold', () => {
    // The template's original primary (#00A76F) has 3.11:1 with white text.
    const weak = buildPalette('light', {
      colorSchemes: {
        light: { palette: { primary: { main: '#00A76F', mainChannel: '0 167 111' } } },
      },
    });
    const failing = PAIRS.filter((p) => p.schemes.includes('light') && pairRatio(weak, p) < p.min);
    expect(failing.map((p) => p.name)).toContain('primary.contrastText on primary.main');
  });
});
