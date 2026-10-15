import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import type { SoftwareCatalogItem } from '../types';

import { useMemo } from 'react';

import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';

import { formatDateOnly } from 'src/utils/format';

import { StatusChip } from 'src/components/status-chip';
import { EocrDataGrid } from 'src/components/data-grid';

import { APPROVAL_STATUS_COLORS } from 'src/sections/requests/status-colors';

import { SoftwareGridToolbar } from './software-grid-toolbar';

// ----------------------------------------------------------------------

const NOT_SET = 'Not set';

const COLUMNS: GridColDef<SoftwareCatalogItem>[] = [
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
  {
    field: 'createdAt',
    headerName: 'Added',
    type: 'dateTime',
    valueGetter: (value: string) => new Date(value),
  },
];

const getRowId = (row: SoftwareCatalogItem) => row.softwareId;

type Props = {
  rows: SoftwareCatalogItem[];
  emptyTitle?: string;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  // Shows the grid's loading overlay (a refresh while rows are shown).
  loading?: boolean;
  editHref?: (softwareId: number) => string;
};

export function SoftwareGrid({
  rows,
  emptyTitle = 'No software is currently in the catalog.',
  paginationModel,
  onPaginationModelChange,
  loading = false,
  editHref,
}: Props) {
  const columns = useMemo<GridColDef<SoftwareCatalogItem>[]>(() => {
    const adminColumns: GridColDef<SoftwareCatalogItem>[] = editHref
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            width: 90,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
              <Button
                component={RouterLink}
                href={editHref(params.row.softwareId)}
                tabIndex={params.hasFocus ? 0 : -1}
                aria-label={`Edit ${params.row.softwareName}`}
              >
                Edit
              </Button>
            ),
          },
        ]
      : [];

    return [...COLUMNS, ...adminColumns];
  }, [editHref]);

  return (
    <EocrDataGrid
      aria-label="Software catalog"
      emptyTitle={emptyTitle}
      rows={rows}
      columns={columns}
      getRowId={getRowId}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      loading={loading}
      slots={{ toolbar: SoftwareGridToolbar }}
      pageSizeOptions={[25, 50]}
      initialState={{
        pagination: { paginationModel: { pageSize: 25 } },
        sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
        columns: { columnVisibilityModel: { createdAt: false } },
      }}
    />
  );
}
