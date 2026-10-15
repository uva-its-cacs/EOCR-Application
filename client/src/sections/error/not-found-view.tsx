import { m } from 'framer-motion';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import { PageNotFoundIllustration } from 'src/assets/illustrations';

import { varBounce } from 'src/components/animate';

import { ErrorContent } from './error-content';

// ----------------------------------------------------------------------

// Adapted from the template's sections/error/not-found-view.tsx. The one-time bounce-in is kept (no movement under
// reduced motion: MotionLazy's MotionConfig). The page renders inside EOCR's layout (ErrorContent
// replaces SimpleLayout). The heading is the page's only h1 (styled as the template's h3), focusable by the route-focus hook, and
// the page sets its document title. `description` and `action` replace the default text and button.
type Props = {
  title?: string;
  // Browser tab title (without the " - EOCR" suffix).
  documentTitle?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

export function NotFoundView({
  title = 'Sorry, page not found!',
  documentTitle = 'Page not found',
  description,
  action,
}: Props) {
  return (
    <ErrorContent>
      <title>{`${documentTitle} - ${CONFIG.appName}`}</title>

      <m.div variants={varBounce('in')}>
        <Typography
          variant="h3"
          component="h1"
          tabIndex={-1}
          sx={{ mb: 2, outline: 'none' }}
        >
          {title}
        </Typography>
      </m.div>

      <m.div variants={varBounce('in')}>
        <Typography
          component="div"
          sx={{ color: 'text.secondary' }}
        >
          {description ??
            'Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be sure to check your spelling.'}
        </Typography>
      </m.div>

      <m.div variants={varBounce('in')}>
        <PageNotFoundIllustration sx={{ my: { xs: 5, sm: 10 } }} />
      </m.div>

      {action ?? (
        <Button
          component={RouterLink}
          href="/"
          size="large"
          variant="contained"
        >
          Go to home
        </Button>
      )}
    </ErrorContent>
  );
}
