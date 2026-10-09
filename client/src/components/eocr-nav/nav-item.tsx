import type { Theme, SxProps } from '@mui/material/styles';
import type { NavItemData } from './nav-data';

import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';
import { navItemStyles } from 'src/components/nav-section/styles';

// ----------------------------------------------------------------------

export const NAV_ITEM_CLASS = 'eocr-nav__item';

type Props = {
  item: NavItemData;
  active: boolean;
  onClick?: () => void;
};

/**
 * One nav link. The visible title is its accessible name (no aria-label), the icon is decorative, and the
 * active link carries aria-current="page". Styling uses the template's nav tokens (--nav-* CSS variables).
 */
export function NavItem({ item, active, onClick }: Props) {
  return (
    <ButtonBase
      component={RouterLink}
      href={item.path}
      className={NAV_ITEM_CLASS}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      sx={itemRootSx}
    >
      <ItemIcon aria-hidden>
        <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${item.icon}.svg`} />
      </ItemIcon>
      <ItemTitle className={`${NAV_ITEM_CLASS}-title`}>{item.title}</ItemTitle>
    </ButtonBase>
  );
}

// ----------------------------------------------------------------------

const itemRootSx: SxProps<Theme> = (theme) => ({
  width: '100%',
  justifyContent: 'flex-start',
  minHeight: 'var(--nav-item-root-height)',
  paddingTop: 'var(--nav-item-pt)',
  paddingLeft: 'var(--nav-item-pl)',
  paddingRight: 'var(--nav-item-pr)',
  paddingBottom: 'var(--nav-item-pb)',
  borderRadius: 'var(--nav-item-radius)',
  color: 'var(--nav-item-color)',
  '&:hover': { backgroundColor: 'var(--nav-item-hover-bg)' },
  // Active: tint plus semibold title (not color alone). On hover the 16% tint needs the darker step in the
  // light scheme to keep 4.5:1; the dark scheme keeps the template's light step.
  '&[aria-current="page"]': {
    color: 'var(--nav-item-root-active-color)',
    backgroundColor: 'var(--nav-item-root-active-bg)',
    '&:hover': {
      color: theme.vars.palette.primary.dark,
      backgroundColor: 'var(--nav-item-root-active-hover-bg)',
    },
    [`& .${NAV_ITEM_CLASS}-title`]: { fontWeight: theme.typography.fontWeightSemiBold },
    ...theme.applyStyles('dark', {
      color: 'var(--nav-item-root-active-color-on-dark)',
      '&:hover': { color: 'var(--nav-item-root-active-color-on-dark)' },
    }),
  },
});

const ItemIcon = styled('span')(() => ({
  ...navItemStyles.icon,
  width: 'var(--nav-icon-size)',
  height: 'var(--nav-icon-size)',
  margin: 'var(--nav-icon-margin)',
}));

const ItemTitle = styled('span')(({ theme }) => ({
  ...navItemStyles.title(theme),
  ...theme.typography.body2,
  textAlign: 'left',
  fontWeight: theme.typography.fontWeightMedium,
}));
