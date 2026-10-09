import type { GridColDef } from '@mui/x-data-grid';
import type { RequestSummary } from '../types';

import { formatDateTime } from 'src/utils/format';

import { StatusChip } from 'src/components/status-chip';
import { EocrDataGrid } from 'src/components/data-grid';

import { REQUEST_STATUS_COLORS } from '../status-colors';

// ----------------------------------------------------------------------

const COLUMNS: GridColDef<RequestSummary>[] = [
  {
    field: 'softwareName',
    headerName: 'Software',
    flex: 1,
    minWidth: 180,
  },
  {
    field: 'vendor',
    headerName: 'Vendor',
    flex: 1,
    minWidth: 140,
  },
  {
    field: 'statusLabel',
    headerName: 'Status',
    width: 230,
    renderCell: (params) => (
      <StatusChip
        code={params.row.statusCode}
        label={params.row.statusLabel}
        colors={REQUEST_STATUS_COLORS}
      />
    ),
  },
  {
    field: 'updatedAt',
    headerName: 'Last updated',
    width: 160,
    type: 'dateTime',
    valueGetter: (value: string) => new Date(value),
    renderCell: (params) => (
      <time dateTime={params.row.updatedAt}>{formatDateTime(params.row.updatedAt)}</time>
    ),
  },
];

const getRowId = (row: RequestSummary) => row.requestId;

type Props = {
  rows: RequestSummary[];
};

export function RequestsGrid({ rows }: Props) {
  return (
    <EocrDataGrid
      aria-label="Your vetting requests"
      emptyTitle="You have no requests yet."
      rows={rows}
      columns={COLUMNS}
      getRowId={getRowId}
    />
  );
}
