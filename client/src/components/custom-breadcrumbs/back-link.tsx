import type { LinkProps } from '@mui/material/Link';

import Link from '@mui/material/Link';

import { RouterLink } from 'src/routes/components';

import { Iconify, iconifyClasses } from '../iconify';

// ----------------------------------------------------------------------

// EOCR: the link holds only the arrow and is named by `aria-label` (the caller's "Back to ..."). It is an
// outlined circle (shared.buttonOutlined, 3:1 or better) so it reads as a control, not floating text.
export type BackLinkProps = LinkProps & {
  label?: string;
};

export function BackLink({ sx, label, ...other }: BackLinkProps) {
  return (
    <Link
      component={RouterLink}
      color="inherit"
      underline="none"
      sx={[
        (theme) => ({
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle',
          border: `1px solid ${theme.vars.palette.shared.buttonOutlined}`,
          transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.sharp,
          }),
          [`& .${iconifyClasses.root}`]: { verticalAlign: 'inherit' },
          '&:hover': { backgroundColor: theme.vars.palette.action.hover },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify width={18} icon="eva:arrow-ios-back-fill" aria-hidden />
      {label}
    </Link>
  );
}
