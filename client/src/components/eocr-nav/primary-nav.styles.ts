import type { Theme, CSSObject } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import { iconifyClasses } from 'src/components/iconify';
import { navSectionClasses } from 'src/components/nav-section';

/**
 * Small EOCR-only adjustment to the template's vertical navigation tokens.
 * The softened section heading is closer to the template's disabled label while
 * remaining above 4.5:1 on the permanently dark menu (the template default is 3.58:1).
 */
export function primaryNavStyles(theme: Theme): CSSObject {
  const subheaderSelector = `.${navSectionClasses.subheader}`;
  const specificSubheaderSelector = subheaderSelector.repeat(3);
  const iconSelector = `.${iconifyClasses.root}`;
  const itemSelector = `.${navSectionClasses.item.root}`;
  const itemIconSelector = `.${navSectionClasses.item.icon}`;
  const itemTextsSelector = `.${navSectionClasses.item.texts}`;
  const itemTitleSelector = `.${navSectionClasses.item.title}`;

  const compactItemStyles: CSSObject = {
    [`&[data-compact='true'] ${itemSelector}`]: {
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 56,
      padding: theme.spacing(1, 0.5, 0.75),
    },
    [`&[data-compact='true'] ${itemIconSelector}`]: {
      width: 22,
      height: 22,
      margin: 0,
    },
    [`&[data-compact='true'] ${itemTextsSelector}`]: {
      width: '100%',
      alignItems: 'center',
    },
    [`&[data-compact='true'] ${itemTitleSelector}`]: {
      fontSize: theme.typography.pxToRem(9),
      lineHeight: 1.25,
      textAlign: 'center',
    },
  };

  return {
    '--nav-subheader-color': varAlpha(theme.vars.palette.grey['500Channel'], 0.88),
    '--nav-subheader-hover-color': theme.vars.palette.common.white,
    [`& ${specificSubheaderSelector}`]: {
      fontSize: theme.typography.pxToRem(10),
      fontWeight: theme.typography.fontWeightBold,
      letterSpacing: '0.04em',
    },
    [`& ${specificSubheaderSelector} ${iconSelector}`]: {
      opacity: 0,
    },
    [`& ${specificSubheaderSelector}:hover ${iconSelector}`]: {
      opacity: 0,
    },
    [`& ${specificSubheaderSelector}:focus-visible ${iconSelector}`]: {
      opacity: 1,
    },
    ...compactItemStyles,
  };
}
