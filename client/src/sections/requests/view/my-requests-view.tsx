import type { IconifyName } from 'src/components/iconify';
import type { TableHeadCellProps } from 'src/components/table';
import type { RequestSummary, RequestTableFilters } from '../types';

import { useMemo, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { VisuallyHidden } from 'src/components/visually-hidden';
import { ErrorState, LoadingState } from 'src/components/feedback';
import { PageHeader, focusPageHeading } from 'src/components/page-header';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { SoftwareAnalytic } from 'src/sections/software/software-analytic';

import { useMyRequests } from '../use-my-requests';
import { RequestTableRow } from '../request-table-row';
import { RequestTableToolbar } from '../request-table-toolbar';
import { countByGroup, STATUS_GROUPS } from '../status-groups';
import { getStatusColor, REQUEST_STATUS_COLORS } from '../status-colors';
import { RequestTableFiltersResult } from '../request-table-filters-result';

// ----------------------------------------------------------------------

// The template's invoice-list-view.tsx layout (as the software catalog): an analytics strip for the
// request status groups, status tabs, a search toolbar, filter chips and the template's MUI Table.

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'softwareName', label: 'Software' },
  { id: 'updatedAt', label: 'Last updated' },
  { id: 'statusLabel', label: 'Status' },
];

// Icon and color per status group (the template's invoice analytics: Draft, Pending, Overdue, Paid).
type GroupColor = 'default' | 'info' | 'warning' | 'success';

const GROUP_STYLE: Record<string, { icon: IconifyName; color: GroupColor }> = {
  Drafts: { icon: 'solar:file-corrupted-bold-duotone', color: 'default' },
  'In review': { icon: 'solar:sort-by-time-bold-duotone', color: 'info' },
  'Needs your action': { icon: 'solar:bell-bing-bold-duotone', color: 'warning' },
  Decided: { icon: 'solar:file-check-bold-duotone', color: 'success' },
};

type StatusTab = {
  code: string;
  label: string;
  count: number;
};

export function MyRequestsView() {
  const theme = useTheme();
  const { data, isPending, isError, refetch } = useMyRequests();
  const rows = useMemo(() => data ?? [], [data]);

  const table = useTable({ defaultOrderBy: 'updatedAt', defaultOrder: 'desc' });

  const filters = useSetState<RequestTableFilters>({ name: '', status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const statuses = useMemo(() => {
    const found = new Map<string, StatusTab>();
    rows.forEach((row) => {
      const status = found.get(row.statusCode);
      found.set(row.statusCode, {
        code: row.statusCode,
        label: row.statusLabel,
        count: (status?.count ?? 0) + 1,
      });
    });
    return [...found.values()];
  }, [rows]);

  // A status tab can disappear after a refresh; its filter then no longer applies.
  const activeStatus = statuses.find((status) => status.code === currentFilters.status);
  const effectiveFilters = { ...currentFilters, status: activeStatus ? activeStatus.code : 'all' };

  const dataFiltered = applyFilter({
    inputData: rows,
    comparator: getComparator(table.order, table.orderBy as keyof RequestSummary),
    filters: effectiveFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset = !!currentFilters.name || effectiveFilters.status !== 'all';

  const counts = data ? countByGroup(data) : null;
  const getPercent = (count: number) => (rows.length ? (count / rows.length) * 100 : 0);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  // The alert and its Retry button disappear on success, so focus moves to the page heading.
  const retry = async () => {
    const result = await refetch();
    if (!result.isError) focusPageHeading();
  };

  return (
    <DashboardContent>
      <PageHeader
        title="My requests"
        actions={
          <Button
            component={RouterLink}
            href={paths.requests.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New request
          </Button>
        }
      />

      {isError && (
        <ErrorState
          onRetry={() => {
            void retry();
          }}
          sx={{ mb: 3 }}
        >
          Failed to load requests. Please try again.
        </ErrorState>
      )}

      {!(isError && !data) && (
        <>
          <Card sx={{ mb: { xs: 3, md: 5 } }}>
            {/* Native scrolling replaces the template's Scrollbar; focusable so keyboard users can scroll. */}
            <Box
              role="region"
              aria-labelledby="requests-summary-heading"
              aria-busy={isPending}
              tabIndex={0}
              sx={{ minHeight: 108, overflowX: 'auto' }}
            >
              <VisuallyHidden
                component="h2"
                id="requests-summary-heading"
              >
                Summary
              </VisuallyHidden>
              <Stack
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ borderStyle: 'dashed' }}
                  />
                }
                sx={{ py: 2, flexDirection: 'row' }}
              >
                <SoftwareAnalytic
                  title="Total"
                  total={counts ? rows.length : null}
                  percent={100}
                  icon="solar:bill-list-bold-duotone"
                  color={theme.vars.palette.info.main}
                />

                {Object.keys(STATUS_GROUPS).map((group) => {
                  const style = GROUP_STYLE[group];
                  const count = counts ? counts[group] : null;
                  return (
                    <SoftwareAnalytic
                      key={group}
                      title={group}
                      total={count}
                      percent={count === null ? 0 : getPercent(count)}
                      icon={style?.icon ?? 'solar:file-bold-duotone'}
                      color={
                        !style || style.color === 'default'
                          ? theme.vars.palette.text.secondary
                          : theme.vars.palette[style.color].main
                      }
                    />
                  );
                })}
              </Stack>
            </Box>
          </Card>

          <Card>
            <Tabs
              value={activeStatus ? activeStatus.code : 'all'}
              onChange={handleFilterStatus}
              aria-label="Filter requests by status"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: { md: 2.5 },
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }}
            >
              {[
                { value: 'all', label: 'All', count: rows.length },
                ...statuses.map((status) => ({
                  value: status.code,
                  label: status.label,
                  count: status.count,
                })),
              ].map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  aria-label={
                    tab.value === 'all'
                      ? `All requests (${tab.count})`
                      : `${tab.label} (${tab.count})`
                  }
                  iconPosition="end"
                  icon={
                    <Label
                      variant={
                        ((tab.value === 'all' || tab.value === effectiveFilters.status) &&
                          'filled') ||
                        'soft'
                      }
                      color={
                        tab.value === 'all'
                          ? 'default'
                          : getStatusColor(REQUEST_STATUS_COLORS, tab.value)
                      }
                    >
                      {tab.count}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <RequestTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
            />

            {canReset && (
              <RequestTableFiltersResult
                filters={filters}
                onResetPage={table.onResetPage}
                totalResults={dataFiltered.length}
                statusLabel={activeStatus?.label}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            {/* Announces the result count as filters change (the visible count shows only while filtering). */}
            <VisuallyHidden>
              <span role="status">{isPending ? '' : `${dataFiltered.length} results found`}</span>
            </VisuallyHidden>

            {/* Native scrolling replaces the template's Scrollbar; focusable so keyboard users can scroll. */}
            <Box
              role="region"
              aria-label="Requests table"
              tabIndex={0}
              sx={{ minHeight: 444, overflowX: 'auto' }}
            >
              <Table
                aria-label="Your vetting requests"
                size={table.dense ? 'small' : 'medium'}
                sx={{ minWidth: 640 }}
              >
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  onSort={table.onSort}
                />

                <TableBody aria-busy={isPending}>
                  {dataInPage.map((row) => (
                    <RequestTableRow
                      key={row.requestId}
                      row={row}
                    />
                  ))}

                  {isPending && (
                    <TableRow>
                      <TableCell colSpan={12}>
                        <LoadingState message="Loading requests..." />
                      </TableCell>
                    </TableRow>
                  )}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData
                    notFound={!dataFiltered.length && !isPending}
                    title={
                      canReset
                        ? 'No requests match your search or filters.'
                        : 'You have no requests yet.'
                    }
                  />
                </TableBody>
              </Table>
            </Box>

            <TablePaginationCustom
              page={table.page}
              dense={table.dense}
              count={dataFiltered.length}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onChangeDense={table.onChangeDense}
              onRowsPerPageChange={table.onChangeRowsPerPage}
            />
          </Card>
        </>
      )}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: RequestSummary[];
  filters: RequestTableFilters;
  comparator: (a: RequestSummary, b: RequestSummary) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  const term = name.trim().toLocaleLowerCase();

  if (term) {
    inputData = inputData.filter(({ softwareName, vendor }) =>
      [softwareName, vendor].some((field) => field.toLocaleLowerCase().includes(term))
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((request) => request.statusCode === status);
  }

  return inputData;
}
