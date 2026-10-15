import type { RequestSummary } from './types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { formatTime, formatDateTime } from 'src/utils/format';

import { StatusChip } from 'src/components/status-chip';

import { REQUEST_STATUS_COLORS } from './status-colors';

// ----------------------------------------------------------------------

// The template's invoice-table-row.tsx layout: software with its vendor below (avatar initial), the last
// update as date and time, and the status. The software name links to the request's status page (as the
// template's invoice number does). No checkbox and no row menu.
// Secondary text uses text.secondary (the template's text.disabled is below 4.5:1).
type Props = {
  row: RequestSummary;
};

export function RequestTableRow({ row }: Props) {
  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar aria-hidden>{row.softwareName.charAt(0).toUpperCase()}</Avatar>

          <ListItemText
            primary={
              <Link
                component={RouterLink}
                href={paths.requests.details(row.requestId)}
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

      <TableCell>
        <ListItemText
          primary={<time dateTime={row.updatedAt}>{formatDateTime(row.updatedAt)}</time>}
          secondary={formatTime(row.updatedAt)}
          slotProps={{
            primary: { noWrap: true, sx: { typography: 'body2' } },
            secondary: { sx: { mt: 0.5, typography: 'caption' } },
          }}
        />
      </TableCell>

      <TableCell>
        <StatusChip
          code={row.statusCode}
          label={row.statusLabel}
          colors={REQUEST_STATUS_COLORS}
        />
      </TableCell>
    </TableRow>
  );
}
