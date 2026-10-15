import type { ReactNode } from 'react';
import type { GridPaginationModel } from '@mui/x-data-grid';
import type { SoftwareCatalogItem } from '../types';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ErrorState } from 'src/components/feedback';
import { PageHeader } from 'src/components/page-header';
import { StatCard, StatCardGroup } from 'src/components/stat-card';

import { useMyRequests } from 'src/sections/requests/use-my-requests';
import { countByGroup, STATUS_GROUPS } from 'src/sections/requests/status-groups';
import { getStatusColor, APPROVAL_STATUS_COLORS } from 'src/sections/requests/status-colors';

import { SoftwareGrid } from './software-grid';

// ----------------------------------------------------------------------

type Props = {
  rows: SoftwareCatalogItem[];
  loading?: boolean;
  editHref?: (softwareId: number) => string;
  actions?: ReactNode;
};

type StatusFilter = {
  code: string;
  label: string;
  count: number;
};

const getStatusTabValue = (code: string) => `status:${code}`;

export function SoftwareCatalogView({ rows, loading = false, editHref, actions }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const myRequests = useMyRequests();
  const requestCounts = myRequests.data ? countByGroup(myRequests.data) : null;
  const statuses = useMemo(() => {
    const found = new Map<string, StatusFilter>();

    rows.forEach((row) => {
      const status = found.get(row.currentApprovalStatusCode);
      found.set(row.currentApprovalStatusCode, {
        code: row.currentApprovalStatusCode,
        label: row.currentApprovalStatusLabel,
        count: (status?.count ?? 0) + 1,
      });
    });

    return [...found.values()];
  }, [rows]);
  const activeStatusFilter = statusFilter
    ? (statuses.find((status) => status.code === statusFilter.code) ?? null)
    : null;
  const filteredRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        row.softwareName.toLocaleLowerCase().includes(term) ||
        row.vendorName.toLocaleLowerCase().includes(term);
      const matchesStatus =
        activeStatusFilter === null || row.currentApprovalStatusCode === activeStatusFilter.code;

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, activeStatusFilter]);
  const activeSearch = search.trim();

  return (
    <>
      <PageHeader
        title="Software catalog"
        documentTitle="Software catalog"
        description="Browse software and its accessibility approval status."
        actions={
          actions ?? (
            <Button
              component={RouterLink}
              href={paths.requests.new}
              variant="contained"
            >
              Request software
            </Button>
          )
        }
      />

      {myRequests.isError ? (
        <ErrorState
          onRetry={() => {
            void myRequests.refetch();
          }}
          sx={{ mb: 3 }}
        >
          Your request counts could not be loaded.
        </ErrorState>
      ) : (
        <StatCardGroup
          title="Your request counts"
          busy={myRequests.isPending}
        >
          {Object.keys(STATUS_GROUPS).map((group) => (
            <StatCard
              key={group}
              title={group}
              value={requestCounts ? requestCounts[group] : null}
            />
          ))}
        </StatCardGroup>
      )}

      <Box
        sx={{
          mb: 0,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={activeStatusFilter ? getStatusTabValue(activeStatusFilter.code) : 'all'}
          onChange={(_event, value: string) => {
            setPaginationModel((current) => ({ ...current, page: 0 }));
            setStatusFilter(
              value === 'all'
                ? null
                : (statuses.find((status) => getStatusTabValue(status.code) === value) ?? null)
            );
          }}
          aria-label="Filter software by approval status"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            value="all"
            aria-label={`All software (${rows.length})`}
            label={
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center' }}
              >
                All
                <Label variant="filled">{rows.length}</Label>
              </Stack>
            }
          />
          {statuses.map((status) => (
            <Tab
              key={status.code}
              value={getStatusTabValue(status.code)}
              aria-label={`${status.label} (${status.count})`}
              label={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  {status.label}
                  <Label
                    variant={activeStatusFilter?.code === status.code ? 'filled' : 'soft'}
                    color={getStatusColor(APPROVAL_STATUS_COLORS, status.code)}
                  >
                    {status.count}
                  </Label>
                </Stack>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ px: 2.5, py: 2 }}>
          <TextField
            label="Search software"
            placeholder="Vendor or product name"
            value={search}
            onChange={(event) => {
              setPaginationModel((current) => ({ ...current, page: 0 }));
              setSearch(event.target.value);
            }}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      sx={{ color: 'text.disabled' }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          role="status"
          aria-live="polite"
          sx={{
            px: 2.5,
            pb: activeSearch || activeStatusFilter ? 1 : 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Box
            component="span"
            sx={{ typography: 'body2', color: 'text.secondary' }}
          >
            {filteredRows.length} results found
          </Box>
        </Stack>

        {(activeSearch || activeStatusFilter) && (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ px: 2.5, pb: 2, flexWrap: 'wrap', alignItems: 'center' }}
          >
            {activeSearch && (
              <Chip
                label={`Search: ${activeSearch}`}
                onDelete={() => {
                  setPaginationModel((current) => ({ ...current, page: 0 }));
                  setSearch('');
                }}
                size="small"
              />
            )}
            {activeStatusFilter && (
              <Chip
                label={`Approval status: ${activeStatusFilter.label}`}
                onDelete={() => {
                  setPaginationModel((current) => ({ ...current, page: 0 }));
                  setStatusFilter(null);
                }}
                size="small"
              />
            )}
            <Button
              size="small"
              onClick={() => {
                setPaginationModel((current) => ({ ...current, page: 0 }));
                setSearch('');
                setStatusFilter(null);
              }}
            >
              Clear filters
            </Button>
          </Stack>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <SoftwareGrid
          rows={filteredRows}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          emptyTitle={
            activeSearch || activeStatusFilter
              ? 'No software matches your search or approval status.'
              : 'No software is currently in the catalog.'
          }
          loading={loading}
          editHref={editHref}
        />
      </Box>
    </>
  );
}
