import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';
import { useCrumbs } from 'src/routes/route-handle';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  // Browser tab title (without the " - EOCR" suffix). Defaults to the title.
  documentTitle?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

/**
 * The page heading: the page's only h1 (styled as the template's h4 page titles), focusable by the
 * route-focus hook (tabIndex -1, no ring), plus the document title as "<title> - EOCR".
 * Breadcrumbs come from the route handles and appear only when the trail has more than one crumb.
 */
export function PageHeader({ title, documentTitle, description, actions }: Props) {
  const crumbs = useCrumbs();

  return (
    <Box sx={{ mb: 3 }}>
      <title>{`${documentTitle ?? title} - ${CONFIG.appName}`}</title>

      {crumbs.length > 1 && (
        <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1 }}>
          {crumbs.map((crumb, index) =>
            index === crumbs.length - 1 ? (
              <Typography
                key={crumb.path}
                variant="body2"
                aria-current="page"
                sx={{ color: 'text.primary' }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link key={crumb.path} component={RouterLink} href={crumb.path} variant="body2">
                {crumb.label}
              </Link>
            )
          )}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          gap: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4" component="h1" tabIndex={-1} sx={{ outline: 'none' }}>
          {title}
        </Typography>
        {actions}
      </Box>

      {description && (
        <Typography component="div" sx={{ mt: 1, color: 'text.secondary' }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
