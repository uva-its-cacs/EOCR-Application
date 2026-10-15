import type { RequestDetail } from '../types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { latestReviewerMessage } from '../request-messages';
import { RequestDetailsHistory } from '../request-details-history';
import { RequestDetailsToolbar } from '../request-details-toolbar';
import { NOT_SET, RequestDetailsSummary, requestDetailSections } from '../request-details-summary';

// ----------------------------------------------------------------------

// Adapted from the template's sections/order/view/order-details-view.tsx: the toolbar, then an 8/4 grid
// with the request (business need) and its history on the left and the details sections (software,
// funding, VPAT) on the right, separated by dashed dividers as in the template's order sidebar. When the
// reviewer asked for more information, their message is shown above the grid.

type Props = {
  request: RequestDetail;
};

export function RequestDetailsView({ request }: Props) {
  const reviewerMessage =
    request.statusCode === 'MoreInfoNeeded' ? latestReviewerMessage(request) : null;

  return (
    <DashboardContent>
      <RequestDetailsToolbar
        request={request}
        backHref={paths.requests.root}
      />

      {request.statusCode === 'MoreInfoNeeded' && (
        <Alert
          severity="warning"
          role="note"
          sx={{ mb: 3 }}
        >
          <AlertTitle component="h2">The reviewer needs more information</AlertTitle>
          {reviewerMessage ?? 'Update your request and send it back for review.'}
        </Alert>
      )}

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Card>
              <CardHeader
                title="Business need"
                slotProps={{ title: { component: 'h2' } }}
              />
              <Typography
                variant="body2"
                sx={{ p: 3, whiteSpace: 'pre-wrap' }}
              >
                {request.businessNeed || NOT_SET}
              </Typography>
            </Card>

            <RequestDetailsHistory request={request} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <RequestDetailsSummary sections={requestDetailSections(request)} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
