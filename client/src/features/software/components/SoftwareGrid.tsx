import { useMemo } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Chip from '@mui/material/Chip'
import { DataGrid, GridActionsCell, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import type { Software } from '../types'
import { SoftwareGridToolbar } from './SoftwareGridToolbar'

interface Props {
  rows: Software[]
  onEdit: (software: Software) => void
}

function formatDate(value: string | null) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))
}

const getRowId = (row: Software) => row.softwareId

export function SoftwareGrid({ rows, onEdit }: Props) {
  const columns = useMemo<GridColDef<Software>[]>(() => [
    {
      field: 'actions',
      headerName: 'Edit',
      type: 'actions',
      width: 64,
      renderCell: (params) => (
        <GridActionsCell {...params}>
          <GridActionsCellItem
            icon={<EditOutlinedIcon fontSize="small" />}
            label={`Edit ${params.row.softwareName}`}
            onClick={() => onEdit(params.row)}
          />
        </GridActionsCell>
      ),
    },
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
        <Chip
          size="small"
          variant="outlined"
          label={params.row.currentApprovalStatusLabel}
        />
      ),
    },
    {
      field: 'softwareCategoryLabel',
      headerName: 'Category',
      width: 230,
      valueFormatter: (value: string | null) => value ?? 'Not set',
    },
    {
      field: 'accessibilityRiskLabel',
      headerName: 'Risk',
      width: 90,
      valueFormatter: (value: string | null) => value ?? 'Not set',
    },
    {
      field: 'approvalExpirationDate',
      headerName: 'Expires',
      width: 140,
      type: 'date',
      valueGetter: (value: string | null) => value ? new Date(`${value}T00:00:00Z`) : null,
      renderCell: (params) => params.row.approvalExpirationDate ? (
        <time dateTime={params.row.approvalExpirationDate}>
          {formatDate(params.row.approvalExpirationDate)}
        </time>
      ) : 'Not set',
    },
  ], [onEdit])

  return (
    <DataGrid
      aria-label="Software administration"
      rows={rows}
      columns={columns}
      getRowId={getRowId}
      autoHeight
      density="compact"
      columnHeaderHeight={40}
      disableRowSelectionOnClick
      showToolbar
      slots={{ toolbar: SoftwareGridToolbar }}
      pageSizeOptions={[10, 25, 50]}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
      }}
      slotProps={{
        noRowsOverlay: { role: 'status' },
      }}
    />
  )
}
