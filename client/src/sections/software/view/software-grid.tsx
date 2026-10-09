import type { GridColDef } from '@mui/x-data-grid';
import type { Software } from '../types';

import { formatDateOnly } from 'src/utils/format';

import { StatusChip } from 'src/components/status-chip';
import { EocrDataGrid } from 'src/components/data-grid';

import { APPROVAL_STATUS_COLORS } from 'src/sections/requests/status-colors';

import { SoftwareGridToolbar } from './software-grid-toolbar';

// ----------------------------------------------------------------------

const NOT_SET = 'Not set';

// Read-only in this slice: the Edit column and dialog arrive in Slice 10.
const COLUMNS: GridColDef<Software>[] = [
  {
    field: 'softwareName',
    headerName: 'Software',
    flex: 1,
    minWidth: 210,
  },
  {
    field: 'vendorName',
    headerName: 'Vendor',
    flex: 1,
    minWidth: 170,
  },
  {
    field: 'currentApprovalStatusLabel',
    headerName: 'Approval status',
    width: 230,
    renderCell: (params) => (
      <StatusChip
        code={params.row.currentApprovalStatusCode}
        label={params.row.currentApprovalStatusLabel}
        colors={APPROVAL_STATUS_COLORS}
      />
    ),
  },
  {
    field: 'softwareCategoryLabel',
    headerName: 'Category',
    width: 230,
    valueFormatter: (value: string | null) => value ?? NOT_SET,
  },
  {
    field: 'accessibilityRiskLabel',
    headerName: 'Risk',
    width: 90,
    valueFormatter: (value: string | null) => value ?? NOT_SET,
  },
  {
    field: 'approvalExpirationDate',
    headerName: 'Expires',
    width: 140,
    type: 'date',
    valueGetter: (value: string | null) => (value ? new Date(`${value}T00:00:00Z`) : null),
    renderCell: (params) =>
      params.row.approvalExpirationDate ? (
        <time dateTime={params.row.approvalExpirationDate}>
          {formatDateOnly(params.row.approvalExpirationDate)}
        </time>
      ) : (
        NOT_SET
      ),
  },
];

const getRowId = (row: Software) => row.softwareId;

type Props = {
  rows: Software[];
  // Shows the grid's loading overlay (a refresh while rows are shown).
  loading?: boolean;
};

export function SoftwareGrid({ rows, loading = false }: Props) {
  return (
    <EocrDataGrid
      aria-label="Software administration"
      emptyTitle="No software has been added yet."
      rows={rows}
      columns={COLUMNS}
      getRowId={getRowId}
      loading={loading}
      slots={{ toolbar: SoftwareGridToolbar }}
    />
  );
}
