import type { CardProps } from '@mui/material/Card';
import type { RequestSummary } from './types';
import type { TableHeadCellProps } from 'src/components/table';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatDateTime } from 'src/utils/format';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { StatusChip } from 'src/components/status-chip';
import { EmptyContent } from 'src/components/empty-content';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { REQUEST_STATUS_COLORS } from './status-colors';

// ----------------------------------------------------------------------

// Adapted from the template's sections/overview/app/app-new-invoices.tsx: the viewer's most recently
// updated requests on the catalog page. EOCR changes: real request rows (software linked to its status
// page, version, last updated, StatusChip); the row menu removed; the title is an h2; the table scroll
// region is named; "View all" links to My requests; loading, empty and error states.

const LIMIT = 5;

const HEAD_CELLS: TableHeadCellProps[] = [
  { id: 'softwareName', label: 'Software' },
  { id: 'version', label: 'Version' },
  { id: 'updatedAt', label: 'Last updated' },
  { id: 'status', label: 'Status' },
];

type Props = CardProps & {
  requests: RequestSummary[] | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
};

export function RecentRequestsCard({ requests, loading, error, onRetry, sx, ...other }: Props) {
  const recent = [...(requests ?? [])]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, LIMIT);

  const renderBody = () => {
    if (error && !requests) {
      return (
        <ErrorState
          onRetry={onRetry}
          sx={{ mx: 3, mb: 3 }}
        >
          Your requests could not be loaded. Please try again.
        </ErrorState>
      );
    }
    if (loading && !requests) {
      return (
        <Box sx={{ px: 3, pb: 3 }}>
          <LoadingState message="Loading your requests..." />
        </Box>
      );
    }
    if (!recent.length) {
      return (
        <EmptyContent
          title="You have no requests yet"
          description="If your software or version is not in the catalog, or its approval has expired, request a review."
          action={
            <Button
              component={RouterLink}
              href={paths.requests.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{ mt: 2 }}
            >
              Request software
            </Button>
          }
          slotProps={{ title: { component: 'p' } }}
          sx={{ py: 5 }}
        />
      );
    }
    return (
      <Scrollbar label="Your recent requests table">
        <Table
          aria-label="Your recent requests"
          sx={{ minWidth: 560 }}
        >
          <TableHeadCustom headCells={HEAD_CELLS} />

          <TableBody>
            {recent.map((row) => (
              <TableRow key={row.requestId}>
                <TableCell>
                  <Link
                    component={RouterLink}
                    href={paths.requests.details(row.requestId)}
                    color="inherit"
                  >
                    {row.softwareName}
                  </Link>
                </TableCell>

                <TableCell>{row.version || 'Not set'}</TableCell>

                <TableCell>
                  <time dateTime={row.updatedAt}>{formatDateTime(row.updatedAt)}</time>
                </TableCell>

                <TableCell>
                  <StatusChip
                    code={row.statusCode}
                    label={row.statusLabel}
                    colors={REQUEST_STATUS_COLORS}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    );
  };

  return (
    <Card
      sx={sx}
      {...other}
    >
      <CardHeader
        title="Your recent requests"
        subheader="Your latest requests and where they are in review."
        slotProps={{
          title: { component: 'h2' },
          subheader: { sx: { color: 'text.secondary' } },
        }}
        sx={{ mb: 3 }}
      />

      {renderBody()}

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          component={RouterLink}
          href={paths.requests.root}
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
          View all requests
        </Button>
      </Box>
    </Card>
  );
}
