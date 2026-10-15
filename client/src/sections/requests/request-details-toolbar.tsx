import type { RequestDetail } from './types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatTime, formatDateTime } from 'src/utils/format';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { StatusChip } from 'src/components/status-chip';

import { REQUEST_STATUS_COLORS } from './status-colors';

// ----------------------------------------------------------------------

// Adapted from the template's sections/order/order-details-toolbar.tsx. EOCR changes: the heading is the
// page's only h1 (styled h4, focusable by the route-focus hook) and the page sets its document title;
// the back arrow is named; the status is a StatusChip (text, not color alone); the date uses
// text.secondary (the template's text.disabled is below 4.5:1). The template's status menu, Print and
// Edit buttons are replaced by the requester's next step ("Continue draft", or "Update request" when the
// reviewer asked for more information), or by the `actions` the admin review page passes.
type Props = {
  request: RequestDetail;
  backHref: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

export function RequestDetailsToolbar({
  request,
  backHref,
  backLabel = 'Back to My requests',
  actions,
}: Props) {
  const dated = request.submittedAt ?? request.createdAt;

  const requesterAction =
    request.statusCode === 'Draft' ? (
      <Button
        component={RouterLink}
        href={paths.requests.edit(request.requestId)}
        color="inherit"
        variant="contained"
        startIcon={<Iconify icon="solar:pen-bold" />}
      >
        Continue draft
      </Button>
    ) : request.statusCode === 'MoreInfoNeeded' ? (
      <Button
        component={RouterLink}
        href={paths.requests.edit(request.requestId)}
        color="inherit"
        variant="contained"
        startIcon={<Iconify icon="solar:pen-bold" />}
      >
        Update request
      </Button>
    ) : null;
  const shownActions = actions ?? requesterAction;

  return (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        mb: { xs: 3, md: 5 },
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <title>{`Request: ${request.title} - ${CONFIG.appName}`}</title>

      <Box sx={{ gap: 1, display: 'flex', alignItems: 'flex-start' }}>
        <IconButton
          component={RouterLink}
          href={backHref}
          aria-label={backLabel}
        >
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <Stack spacing={0.5}>
          <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography
              variant="h4"
              component="h1"
              tabIndex={-1}
              sx={{ outline: 'none' }}
            >
              Request: {request.title}
            </Typography>
            <StatusChip
              code={request.statusCode}
              label={request.statusLabel}
              colors={REQUEST_STATUS_COLORS}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            {request.submittedAt ? 'Submitted' : 'Started'}{' '}
            <time dateTime={dated}>
              {formatDateTime(dated)} at {formatTime(dated)}
            </time>
          </Typography>
        </Stack>
      </Box>

      {shownActions && (
        <Box
          sx={{
            gap: 1.5,
            flexGrow: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
          }}
        >
          {shownActions}
        </Box>
      )}
    </Box>
  );
}
