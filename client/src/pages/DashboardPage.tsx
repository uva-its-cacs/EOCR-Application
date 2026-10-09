import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { fetchMyRequests } from '../features/requests/api'
import { STATUS_GROUPS } from '../features/requests/statusGroups'
import { StatusBadge } from '../features/requests/components/StatusBadge'
import type { RequestSummary } from '../features/requests/types'

// Visually hidden but announced by screen readers
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="span"
    sx={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: 0,
      border: 0,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </Box>
)

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

interface StatCardProps {
  label: string
  count: number
}

function StatCard({ label, count }: StatCardProps) {
  return (
    <Card component="article">
      <CardContent>
        <Box component="dl" sx={{ m: 0 }}>
          <Box component="dt">
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
          <Box component="dd" sx={{ m: 0, mt: 1 }}>
            <Typography variant="h4" component="span" sx={{ fontWeight: 600 }}>
              {count}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

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
      <StatusBadge
        statusCode={params.row.statusCode}
        statusLabel={params.row.statusLabel}
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
      <time dateTime={params.row.updatedAt}>
        {formatDate(params.row.updatedAt)}
      </time>
    ),
  },
]

export function DashboardPage() {
  useEffect(() => {
    document.title = 'My Requests — EOCR'
  }, [])

  const {
    data: requests,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['requests', 'mine'],
    queryFn: fetchMyRequests,
  })

  const counts = Object.fromEntries(
    Object.entries(STATUS_GROUPS).map(([label, codes]) => [
      label,
      (requests ?? []).filter((r) => codes.includes(r.statusCode)).length,
    ]),
  )

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mt: { xs: 3, md: 0 },
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          tabIndex={-1}
          sx={{ outline: 'none' }}
        >
          My Requests
        </Typography>
        <Button
          component={RouterLink}
          to="/requests/new"
          variant="contained"
        >
          New request
        </Button>
      </Box>

      {/* Stat cards */}
      <Box
        component="section"
        aria-labelledby="summary-heading"
        sx={{ mb: 3 }}
      >
        <VisuallyHidden>
          <h2 id="summary-heading">Summary</h2>
        </VisuallyHidden>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {Object.entries(counts).map(([label, count]) => (
            <StatCard key={label} label={label} count={count} />
          ))}
        </Box>
      </Box>

      {/* Loading state */}
      {isLoading && (
        <Box
          role="status"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}
        >
          <CircularProgress size={20} aria-hidden="true" />
          <Typography>Loading requests...</Typography>
        </Box>
      )}

      {/* Error state */}
      {isError && (
        <Alert severity="error">
          Failed to load requests. Please try again.
        </Alert>
      )}

      {/* Requests grid */}
      {requests && requests.length === 0 && !isLoading && (
        <Typography>You have no requests yet.</Typography>
      )}

      {requests && requests.length > 0 && (
        <Box
          component="section"
          aria-labelledby="requests-heading"
          sx={{ minWidth: 0 }}
        >
          <Typography
            id="requests-heading"
            component="h2"
            variant="h6"
            sx={{ mb: 2 }}
          >
            Requests
          </Typography>
          <DataGrid
            rows={requests}
            columns={COLUMNS}
            autoHeight
            density="compact"
            getRowId={(row) => row.requestId}
            columnHeaderHeight={40}
            disableRowSelectionOnClick
            aria-label="Your vetting requests"
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </Box>
      )}
    </>
  )
}
