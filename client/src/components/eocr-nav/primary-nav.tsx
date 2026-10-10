import type { Theme, SxProps } from '@mui/material/styles';
import type { NavGroupData } from './nav-data';

import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';
import { NavSectionVertical } from 'src/components/nav-section';

// EOCR data and permissions feed the purchased template's actual vertical navigation.
export function PrimaryNav({
  groups,
  onItemClick,
  sx,
}: {
  groups: NavGroupData[];
  onItemClick?: (path: string) => void;
  sx?: SxProps<Theme>;
}) {
  const theme = useTheme();

  return (
    <NavSectionVertical
      aria-label="Primary"
      data={groups.map((group) => ({
        subheader: group.label,
        items: group.items.map((item) => ({
          title: item.title,
          path: item.path,
          icon: (
            <SvgColor
              aria-hidden
              src={`${CONFIG.assetsDir}/assets/icons/navbar/${item.icon}.svg`}
            />
          ),
        })),
      }))}
      cssVars={{
        '--nav-item-color': theme.vars.palette.grey[500],
        '--nav-item-caption-color': theme.vars.palette.grey[500],
        '--nav-subheader-color': theme.vars.palette.grey[500],
        '--nav-item-root-active-color': theme.vars.palette.primary.light,
      }}
      onClickCapture={(event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a');
        const path = link?.getAttribute('href');
        if (path && event.currentTarget.contains(link)) onItemClick?.(path);
      }}
      sx={[{ px: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
