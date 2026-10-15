import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import { ServerErrorIllustration } from 'src/assets/illustrations';

import { ErrorContent } from './error-content';

// ----------------------------------------------------------------------

// Adapted from the template's sections/error/500-view.tsx: the framer-motion bounce is removed (framer-motion is
// not approved) and the page renders inside EOCR's layout (ErrorContent replaces SimpleLayout). The
// heading is the page's only h1 (styled as the template's h3), focusable by the route-focus hook, and
// the page sets its document title. `description` and `action` replace the default text and button.
type Props = {
  title?: string;
  // Browser tab title (without the " - EOCR" suffix).
  documentTitle?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

export function View500({
  title = '500 Internal server error',
  documentTitle = 'Something went wrong',
  description,
  action,
}: Props) {
  return (
    <ErrorContent>
      <title>{`${documentTitle} - ${CONFIG.appName}`}</title>

      <Typography
        variant="h3"
        component="h1"
        tabIndex={-1}
        sx={{ mb: 2, outline: 'none' }}
      >
        {title}
      </Typography>

      <Typography
        component="div"
        sx={{ color: 'text.secondary' }}
      >
        {description ?? 'There was an error, please try again later.'}
      </Typography>

      <ServerErrorIllustration sx={{ my: { xs: 5, sm: 10 } }} />

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
