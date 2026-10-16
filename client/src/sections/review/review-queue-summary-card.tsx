import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { ErrorState } from 'src/components/feedback';
import { VisuallyHidden } from 'src/components/visually-hidden';

import { useReviewQueue } from './use-review';
import { countByReviewGroup } from './review-workflow';

// ----------------------------------------------------------------------

// For admins on the catalog page: the review queue's open work by stage, as a description list, with a
// link to the queue. Only rendered for admins (the API is admin-only too).

const GROUPS = ['Waiting to start', 'In review', 'Waiting on others'];

export function ReviewQueueSummaryCard({ sx, ...other }: CardProps) {
  const queue = useReviewQueue();
  const counts = queue.data ? countByReviewGroup(queue.data) : null;

  return (
    <Card
      sx={sx}
      {...other}
    >
      <CardHeader
        title="Review queue"
        subheader="Open requests by stage."
        slotProps={{
          title: { component: 'h2' },
          subheader: { sx: { color: 'text.secondary' } },
        }}
      />

      {queue.isError && !queue.data ? (
        <ErrorState
          onRetry={() => {
            void queue.refetch();
          }}
          sx={{ m: 3 }}
        >
          The review queue could not be loaded.
        </ErrorState>
      ) : (
        <Box
          component="dl"
          aria-busy={!queue.data}
          sx={{ m: 0, p: 3, gap: 2, display: 'flex', flexDirection: 'column' }}
        >
          {GROUPS.map((group) => (
            <Box
              key={group}
              sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}
            >
              <Box
                component="dt"
                sx={{ typography: 'body2', color: 'text.secondary' }}
              >
                {group}
              </Box>
              <Box
                component="dd"
                sx={{ m: 0, typography: 'h5' }}
              >
                {counts ? (
                  counts[group]
                ) : (
                  <>
                    <span aria-hidden>—</span>
                    <VisuallyHidden>Loading</VisuallyHidden>
                  </>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          component={RouterLink}
          href={paths.admin.requests}
          size="small"
          color="inherit"
          endIcon={
            <Iconify
              icon="eva:arrow-ios-forward-fill"
              width={18}
              sx={{ ml: -0.5 }}
            />
          }
        >
          Open the review queue
        </Button>
      </Box>
    </Card>
  );
}
