import type { Theme, SxProps } from '@mui/material/styles';
import type { NavGroupData } from './nav-data';

import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';
import { NavSectionVertical } from 'src/components/nav-section';

import { primaryNavStyles } from './primary-nav.styles';

// EOCR data and permissions feed the purchased template's actual vertical navigation.
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
  const items = groups.flatMap((group) => group.items);
  const navigationData = compact
    ? [
        {
          items: items.map((item) => ({
            title: item.title,
            path: item.path,
            icon: (
              <SvgColor
                aria-hidden
                src={`${CONFIG.assetsDir}/assets/icons/navbar/${item.icon}.svg`}
              />
            ),
          })),
        },
      ]
    : groups.map((group) => ({
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
      }));

  return (
    <NavSectionVertical
      id={id}
      aria-label="Primary"
      data={navigationData}
      data-compact={compact ? 'true' : undefined}
      cssVars={primaryNavStyles(theme)}
      onClickCapture={(event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a');
        const path = link?.getAttribute('href');
        if (path && event.currentTarget.contains(link)) onItemClick?.(path);
      }}
      sx={[{ px: compact ? 0.5 : 2, pt: 1.5 }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
