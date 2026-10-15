import type { CSSObject } from '@mui/material/styles';
import type { SettingsState } from 'src/components/settings';

// ----------------------------------------------------------------------

// EOCR: the template returns a MuiCssBaseline override that sets `html { font-size: <n>px }`. Here:
// - The styles are returned for a GlobalStyles element (theme-provider.tsx). EOCR's own MuiCssBaseline
//   override is a function, and merging the theme would drop an object override.
// - The setting scales the browser's own text size (16px -> 100%, 20px -> 125%) instead of replacing it
//   with a fixed pixel size, and nothing is set at the default.
// - The template's high-contrast card shadow is removed with the contrast option.
const BASE_FONT_SIZE = 16;

export function applySettingsToComponents(settingsState?: SettingsState): CSSObject | null {
  const fontSize = settingsState?.fontSize ?? BASE_FONT_SIZE;

  if (fontSize === BASE_FONT_SIZE) return null;

  return {
    html: {
      fontSize: `${(fontSize / BASE_FONT_SIZE) * 100}%`,
    },
  };
}
