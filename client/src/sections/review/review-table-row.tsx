import type { ReviewQueueItem } from './types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatTime, formatDateTime } from 'src/utils/format';

import { StatusChip } from 'src/components/status-chip';

import { REQUEST_STATUS_COLORS } from 'src/sections/requests/status-colors';

import { REVIEW_STATUS_GROUPS } from './review-workflow';

// ----------------------------------------------------------------------

// As the requests table row (the template's invoice-table-row.tsx): software with its vendor below, linked
// to the review page; version, requester, submitted date, assignee and status as text. "Assign to me" is
// offered on open requests not already assigned to the viewer; its name starts with its visible text and
// adds the request.

export const reviewLinkId = (requestId: number) => `review-link-${requestId}`;

type Props = {
  row: ReviewQueueItem;
  currentUserId: number | undefined;
  assigning: boolean;
  onAssignToMe: (row: ReviewQueueItem) => void;
};

export function ReviewTableRow({ row, currentUserId, assigning, onAssignToMe }: Props) {
  const decided = REVIEW_STATUS_GROUPS.Decided.includes(row.statusCode);
  const mine = currentUserId !== undefined && row.assignedReviewerId === currentUserId;

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar aria-hidden>{row.softwareName.charAt(0).toUpperCase()}</Avatar>

          <ListItemText
            primary={
              <Link
                id={reviewLinkId(row.requestId)}
                component={RouterLink}
                href={paths.admin.request(row.requestId)}
                color="inherit"
              >
                {row.softwareName}
              </Link>
            }
            secondary={row.vendor}
            slotProps={{
              primary: { noWrap: true, sx: { typography: 'body2' } },
              secondary: { sx: { color: 'text.secondary' } },
            }}
          />
        </Box>
      </TableCell>

      <TableCell>{row.version || 'Not set'}</TableCell>

      <TableCell>{row.requestorName}</TableCell>

      <TableCell>
        {row.submittedAt ? (
          <ListItemText
            primary={<time dateTime={row.submittedAt}>{formatDateTime(row.submittedAt)}</time>}
            secondary={formatTime(row.submittedAt)}
            slotProps={{
              primary: { noWrap: true, sx: { typography: 'body2' } },
              secondary: { sx: { mt: 0.5, typography: 'caption', color: 'text.secondary' } },
            }}
          />
        ) : (
          'Not submitted'
        )}
      </TableCell>

      <TableCell>{mine ? 'You' : (row.assignedReviewerName ?? 'Unassigned')}</TableCell>

      <TableCell>
        <StatusChip
          code={row.statusCode}
          label={row.statusLabel}
          colors={REQUEST_STATUS_COLORS}
        />
      </TableCell>

      <TableCell align="right">
        {!decided && !mine && currentUserId !== undefined && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            aria-disabled={assigning}
            aria-label={`Assign to me: ${row.softwareName} ${row.version}`.trim()}
            onClick={() => {
              if (!assigning) onAssignToMe(row);
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Assign to me
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
