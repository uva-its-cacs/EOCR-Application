import type { Theme, SxProps } from '@mui/material/styles';
import type { NavGroupData } from './nav-data';

import { useId } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { usePathname } from 'src/routes/hooks';

import { navSectionCssVars } from 'src/components/nav-section/styles';

import { NavItem } from './nav-item';
import { isActivePath } from './nav-data';

// ----------------------------------------------------------------------

type Props = {
  groups: NavGroupData[];
  // Called when a nav link is activated (the drawer uses it to hand focus to the new page).
  onItemClick?: (path: string) => void;
  sx?: SxProps<Theme>;
};

/**
 * Primary navigation: <nav aria-label="Primary"> with one list per group. A group label is a plain,
 * non-interactive element that names its list through aria-labelledby (no click-to-collapse).
 * Uses the template's vertical nav tokens; caption and subheader text use text.secondary instead of the
 * template's text.disabled, which fails contrast.
 */
export function PrimaryNav({ groups, onItemClick, sx }: Props) {
  const theme = useTheme();
  const pathname = usePathname();
  const idPrefix = useId();

  const cssVars = {
    ...navSectionCssVars.vertical(theme),
    '--nav-item-caption-color': theme.vars.palette.text.secondary,
    '--nav-subheader-color': theme.vars.palette.text.secondary,
  };

  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={[{ ...cssVars, px: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {groups.map((group) => {
        const labelId = `${idPrefix}-${group.id}`;

        return (
          <Box key={group.id} sx={{ mb: 1 }}>
            {group.label && (
              <Box
                id={labelId}
                sx={{
                  ...theme.typography.overline,
                  fontSize: theme.typography.pxToRem(11),
                  color: 'var(--nav-subheader-color)',
                  px: 1.5,
                  pt: 2,
                  pb: 1,
                }}
              >
                {group.label}
              </Box>
            )}
            <Box
              component="ul"
              aria-labelledby={group.label ? labelId : undefined}
              sx={{
                m: 0,
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--nav-item-gap)',
              }}
            >
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavItem
                    item={item}
                    active={isActivePath(pathname, item.path)}
                    onClick={onItemClick ? () => onItemClick(item.path) : undefined}
                  />
                </li>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
