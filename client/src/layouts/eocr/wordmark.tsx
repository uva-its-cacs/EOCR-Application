import Link from '@mui/material/Link';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

// Text wordmark in place of the template's Minimal logo. Placeholder until real branding exists.
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      component={RouterLink}
      href={paths.requests.root}
      underline="hover"
      sx={(theme) => ({
        ...theme.typography.subtitle1,
        fontWeight: theme.typography.fontWeightBold,
        color: theme.vars.palette.text.primary,
      })}
    >
      {compact ? 'EOCR' : 'EOCR Application'}
    </Link>
  );
}
