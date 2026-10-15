import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

// EOCR: the template's Minimal artwork is replaced by a placeholder EOCR mark (a check in a rounded
// square) until real branding exists. Sizes, props and classes follow the template.
export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  const theme = useTheme();

  const TEXT_PRIMARY = theme.vars.palette.text.primary;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_CONTRAST = theme.vars.palette.primary.contrastText;

  const mark = (
    <>
      <rect width="40" height="40" rx="10" fill={PRIMARY_MAIN} />
      <path
        d="M12 20.5l5.5 5.5L28.5 14"
        fill="none"
        stroke={PRIMARY_CONTRAST}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );

  const singleLogo = (
    <svg width="100%" height="100%" viewBox="0 0 40 40" aria-hidden focusable="false">
      {mark}
    </svg>
  );

  const fullLogo = (
    <svg width="100%" height="100%" viewBox="0 0 102 36" aria-hidden focusable="false">
      <g transform="translate(0 2) scale(0.8)">{mark}</g>
      <text
        x="40"
        y="26"
        fill={TEXT_PRIMARY}
        fontFamily={theme.typography.h1.fontFamily}
        fontSize="22"
        fontWeight="800"
      >
        EOCR
      </text>
    </svg>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      // EOCR: a meaningful name for the home link (the template uses "Logo").
      aria-label="EOCR home"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 40,
          height: 40,
          ...(!isSingle && { width: 102, height: 36 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
