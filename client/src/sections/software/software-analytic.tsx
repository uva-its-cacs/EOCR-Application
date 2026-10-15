import type { IconifyName } from 'src/components/iconify';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Adapted from the template's invoice-analytic.tsx: a count and a share of the catalog instead of an
// invoice total. The icon and rings are decorative (aria-hidden); the title, count and percent are text.
type Props = {
  title: string;
  total: number;
  color?: string;
  percent: number;
  icon: IconifyName;
};

export function SoftwareAnalytic({ title, total, icon, color, percent }: Props) {
  return (
    <Box
      sx={{
        width: 1,
        gap: 2.5,
        minWidth: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify
          icon={icon}
          width={32}
          sx={{ color, position: 'absolute' }}
        />

        <CircularProgress
          size={56}
          thickness={2}
          value={percent}
          variant="determinate"
          sx={{ color, opacity: 0.48 }}
        />

        <CircularProgress
          size={56}
          value={100}
          thickness={3}
          variant="determinate"
          sx={[
            (theme) => ({
              top: 0,
              left: 0,
              opacity: 0.48,
              position: 'absolute',
              color: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
            }),
          ]}
        />
      </Box>

      <div>
        <Typography
          variant="subtitle1"
          component="h3"
        >
          {title}
        </Typography>

        <Box
          component="span"
          // text.secondary: the template's text.disabled is below 4.5:1.
          sx={{ my: 0.5, display: 'block', typography: 'body2', color: 'text.secondary' }}
        >
          {total} {total === 1 ? 'item' : 'items'}
        </Box>

        <Box
          component="span"
          sx={{ typography: 'subtitle2' }}
        >
          {Math.round(percent)}%
        </Box>
      </div>
    </Box>
  );
}
