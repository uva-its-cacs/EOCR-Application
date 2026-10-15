import type { Theme, CSSObject } from '@mui/material/styles';

/**
 * The only EOCR change to the template's navigation tokens: section headings use text.secondary
 * instead of text.disabled, which is below 4.5:1 on the light navigation background.
 */
export function primaryNavStyles(theme: Theme): CSSObject {
  return {
    '--nav-subheader-color': theme.vars.palette.text.secondary,
  };
}
