import type { Theme, SxProps } from '@mui/material/styles';
import type { NavGroupData } from './nav-data';

import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';
import { NavSectionMini, NavSectionVertical } from 'src/components/nav-section';

import { primaryNavStyles } from './primary-nav.styles';

// EOCR data and permissions feed the template's vertical navigation, or its mini navigation when the
// sidebar is collapsed (spacing as in the template's nav-vertical.tsx).
export function PrimaryNav({
  id,
  groups,
  onItemClick,
  compact = false,
  sx,
}: {
  id?: string;
  groups: NavGroupData[];
  onItemClick?: (path: string) => void;
  compact?: boolean;
  sx?: SxProps<Theme>;
}) {
  const theme = useTheme();
  const navigationData = groups.map((group) => ({
    subheader: group.label,
    items: group.items.map((item) => ({
      title: item.title,
      path: item.path,
      icon: (
        <SvgColor aria-hidden src={`${CONFIG.assetsDir}/assets/icons/navbar/${item.icon}.svg`} />
      ),
    })),
  }));

  const NavSection = compact ? NavSectionMini : NavSectionVertical;

  return (
    <NavSection
      id={id}
      aria-label="Primary"
      data={navigationData}
      cssVars={primaryNavStyles(theme)}
      onClickCapture={(event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a');
        const path = link?.getAttribute('href');
        if (path && event.currentTarget.contains(link)) onItemClick?.(path);
      }}
      sx={[compact ? { px: 0.5, pb: 2 } : { px: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
