import type { RequestDetail } from './types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { formatTime, formatDateTime } from 'src/utils/format';

// ----------------------------------------------------------------------

// Adapted from the template's sections/order/order-details-history.tsx. The template's timeline is
// @mui/lab (not approved), so it is rebuilt as an ordered list with the same dot, connector and spacing:
// newest first, the latest dot in primary. Each entry is text (the status change, who, when, comments);
// the dots and lines are decorative. Times use text.secondary (the template's text.disabled is below
// 4.5:1). The summary panel shows the request's dates instead of order times.
type Props = {
  request: RequestDetail;
};

const when = (iso: string | null) =>
  iso ? (
    <time dateTime={iso}>
      {formatDateTime(iso)} at {formatTime(iso)}
    </time>
  ) : (
    'Not yet'
  );

export function RequestDetailsHistory({ request }: Props) {
  const entries = [...request.history].reverse();

  const summary = [
    { label: 'Started', value: when(request.createdAt) },
    { label: 'Submitted', value: when(request.submittedAt) },
    { label: 'Last updated', value: when(request.updatedAt) },
  ];

  const renderSummary = () => (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        gap: 2,
        minWidth: 260,
        flexShrink: 0,
        borderRadius: 2,
        display: 'flex',
        typography: 'body2',
        borderStyle: 'dashed',
        flexDirection: 'column',
      }}
    >
      <Box
        component="dl"
        sx={{ m: 0, gap: 2, display: 'flex', flexDirection: 'column' }}
      >
        {summary.map((item) => (
          <Box
            key={item.label}
            sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}
          >
            <Box
              component="dt"
              sx={{ color: 'text.secondary' }}
            >
              {item.label}
            </Box>
            <Box
              component="dd"
              sx={{ m: 0 }}
            >
              {item.value}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );

  const renderTimeline = () => (
    <Box
      component="ol"
      aria-label="Status history, newest first"
      sx={{ m: 0, p: 0, listStyle: 'none' }}
    >
      {entries.map((item, index) => {
        const latest = index === 0;
        const last = index === entries.length - 1;

        return (
          <Box
            component="li"
            key={item.workflowHistoryId}
            sx={{ display: 'flex', gap: 2, minHeight: 70 }}
          >
            {/* Separator: dot and connector (the template's TimelineSeparator). */}
            <Box
              aria-hidden
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.75 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  m: '11.5px 0',
                  borderRadius: '50%',
                  bgcolor: latest ? 'primary.main' : 'grey.500',
                  boxShadow: (theme) => theme.vars.customShadows.z1,
                }}
              />
              {!last && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider' }} />}
            </Box>

            <Box sx={{ py: 1.5, pb: last ? 0 : 2 }}>
              <Typography variant="subtitle2">Status: {item.newStatusLabel}</Typography>
              <Box
                component="span"
                sx={{ display: 'block', color: 'text.secondary', typography: 'caption', mt: 0.5 }}
              >
                {item.previousStatusLabel
                  ? `Changed from ${item.previousStatusLabel} by ${item.changedByName}, `
                  : `Started by ${item.changedByName}, `}
                {when(item.changedAt)}
              </Box>
              {item.comments && (
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5 }}
                >
                  {item.comments}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Card>
      <CardHeader
        title="History"
        slotProps={{ title: { component: 'h2' } }}
      />
      <Box
        sx={{
          p: 3,
          gap: 3,
          display: 'flex',
          alignItems: { md: 'flex-start' },
          flexDirection: { xs: 'column-reverse', md: 'row' },
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {entries.length ? (
            renderTimeline()
          ) : (
            <Typography variant="body2">No status changes yet.</Typography>
          )}
        </Box>
        {renderSummary()}
      </Box>
    </Card>
  );
}
