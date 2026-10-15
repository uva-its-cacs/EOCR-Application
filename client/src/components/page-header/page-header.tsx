import Typography from '@mui/material/Typography';

import { useCrumbs } from 'src/routes/route-handle';

import { CONFIG } from 'src/global-config';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  // Browser tab title (without the " - EOCR" suffix). Defaults to the title.
  documentTitle?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  // Adds the template's back arrow before the heading (for example the edit page back to the list).
  backHref?: string;
  backLabel?: string;
};

/**
 * The page heading, built on the template's CustomBreadcrumbs (heading, dot-separated breadcrumbs,
 * action slot, optional back arrow). EOCR additions: the heading is the page's only h1, focusable by the
 * route-focus hook (tabIndex -1, no ring); the document title is "<title> - EOCR"; breadcrumbs come from
 * the route handles and appear only when the trail has more than one crumb; an optional description.
 */
export function PageHeader({
  title,
  documentTitle,
  description,
  actions,
  backHref,
  backLabel,
}: Props) {
  const crumbs = useCrumbs();

  return (
    <>
      <title>{`${documentTitle ?? title} - ${CONFIG.appName}`}</title>

      <CustomBreadcrumbs
        heading={title}
        backHref={backHref}
        backLabel={backLabel}
        links={
          crumbs.length > 1 ? crumbs.map((crumb) => ({ name: crumb.label, href: crumb.path })) : []
        }
        action={actions}
        slotProps={{
          heading: { as: 'h1', tabIndex: -1, sx: { outline: 'none' } },
        }}
        sx={{ mb: description ? 0 : { xs: 3, md: 5 } }}
      />

      {description && (
        <Typography component="div" sx={{ mt: 1, mb: { xs: 3, md: 5 }, color: 'text.secondary' }}>
          {description}
        </Typography>
      )}
    </>
  );
}
