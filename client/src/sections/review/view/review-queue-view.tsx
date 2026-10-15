import type { IconifyName } from 'src/components/iconify';
import type { TableHeadCellProps } from 'src/components/table';
import type { ReviewQueueItem, ReviewQueueFilters } from '../types';

import { useMemo, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { VisuallyHidden } from 'src/components/visually-hidden';
import { AnalyticSummary } from 'src/components/analytic-summary';
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

import { useCurrentUser } from 'src/sections/auth/use-current-user';
import { getStatusColor, REQUEST_STATUS_COLORS } from 'src/sections/requests/status-colors';

import { useReviewQueue } from '../use-review';
import { useAssignFromQueue } from '../use-review-actions';
import { ReviewTableToolbar } from '../review-table-toolbar';
import { reviewLinkId, ReviewTableRow } from '../review-table-row';
import { ReviewTableFiltersResult } from '../review-table-filters-result';
import { countByReviewGroup, REVIEW_STATUS_GROUPS } from '../review-workflow';

// ----------------------------------------------------------------------

// The admin review queue, laid out as My requests (the template's invoice-list-view.tsx): an analytics
// strip for the workflow stages, status tabs, an "Assigned" filter and search, filter chips and the
// template's MUI Table. Drafts never appear (the server leaves them out).

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'softwareName', label: 'Software' },
  { id: 'version', label: 'Version' },
  { id: 'requestorName', label: 'Requester' },
  { id: 'submittedAt', label: 'Submitted' },
  { id: 'assignedReviewerName', label: 'Assigned to' },
  { id: 'statusLabel', label: 'Status' },
  { id: 'actions', label: <VisuallyHidden>Actions</VisuallyHidden>, sortable: false },
];

type GroupColor = 'default' | 'info' | 'warning' | 'success';

const GROUP_STYLE: Record<string, { icon: IconifyName; color: GroupColor }> = {
  'Waiting to start': { icon: 'solar:bell-bing-bold-duotone', color: 'info' },
  'In review': { icon: 'solar:sort-by-time-bold-duotone', color: 'info' },
  'Waiting on others': { icon: 'solar:file-corrupted-bold-duotone', color: 'warning' },
  Decided: { icon: 'solar:file-check-bold-duotone', color: 'success' },
};

type StatusTab = {
  code: string;
  label: string;
  count: number;
};

export function ReviewQueueView() {
  const theme = useTheme();
  const { data, isPending, isError, refetch } = useReviewQueue();
  const rows = useMemo(() => data ?? [], [data]);
  const me = useCurrentUser();
  const currentUserId = me.status === 'authenticated' ? me.user.userId : undefined;
  const { assign, pending: assigning } = useAssignFromQueue();

  const table = useTable({ defaultOrderBy: 'submittedAt', defaultOrder: 'desc' });

  const filters = useSetState<ReviewQueueFilters>({ name: '', status: 'all', assignment: 'all' });
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
    comparator: getComparator(table.order, table.orderBy as keyof ReviewQueueItem),
    filters: effectiveFilters,
    currentUserId,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name ||
    effectiveFilters.status !== 'all' ||
    currentFilters.assignment !== 'all';

  const counts = data ? countByReviewGroup(data) : null;
  const getPercent = (count: number) => (rows.length ? (count / rows.length) * 100 : 0);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  // The button disappears once the request is the viewer's, so focus moves to the request's link, or to
  // the page heading when a filter (such as "Unassigned") hides the row.
  const assignToMe = async (row: ReviewQueueItem) => {
    if (await assign(row)) {
      requestAnimationFrame(() => {
        const link = document.getElementById(reviewLinkId(row.requestId));
        if (link) link.focus();
        else focusPageHeading();
      });
    }
  };

  // The alert and its Retry button disappear on success, so focus moves to the page heading.
  const retry = async () => {
    const result = await refetch();
    if (!result.isError) focusPageHeading();
  };

  return (
    <DashboardContent>
      <PageHeader
        title="Review queue"
        description="Submitted requests waiting for review, in review, and decided."
      />

      {isError && (
        <ErrorState
          onRetry={() => {
            void retry();
          }}
          sx={{ mb: 3 }}
        >
          Failed to load the review queue. Please try again.
        </ErrorState>
      )}

      {!(isError && !data) && (
        <>
          <Card sx={{ mb: { xs: 3, md: 5 } }}>
            <Scrollbar
              label="Summary"
              scrollableNodeProps={{ 'aria-busy': isPending }}
              sx={{ minHeight: 108 }}
            >
              <VisuallyHidden
                component="h2"
                id="review-summary-heading"
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
                <AnalyticSummary
                  title="Total"
                  total={counts ? rows.length : null}
                  percent={100}
                  icon="solar:bill-list-bold-duotone"
                  color={theme.vars.palette.info.main}
                />

                {Object.keys(REVIEW_STATUS_GROUPS).map((group) => {
                  const style = GROUP_STYLE[group];
                  const count = counts ? counts[group] : null;
                  return (
                    <AnalyticSummary
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
            </Scrollbar>
          </Card>

          <Card>
            <Tabs
              value={activeStatus ? activeStatus.code : 'all'}
              onChange={handleFilterStatus}
              aria-label="Filter the queue by status"
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

            <ReviewTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
            />

            {canReset && (
              <ReviewTableFiltersResult
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

            <Scrollbar
              label="Review queue table"
              sx={{ minHeight: 444 }}
            >
              <Table
                aria-label="Requests to review"
                size={table.dense ? 'small' : 'medium'}
                sx={{ minWidth: 960 }}
              >
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  onSort={table.onSort}
                />

                <TableBody aria-busy={isPending}>
                  {dataInPage.map((row) => (
                    <ReviewTableRow
                      key={row.requestId}
                      row={row}
                      currentUserId={currentUserId}
                      assigning={assigning}
                      onAssignToMe={(item) => {
                        void assignToMe(item);
                      }}
                    />
                  ))}

                  {isPending && (
                    <TableRow>
                      <TableCell colSpan={12}>
                        <LoadingState message="Loading the review queue..." />
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
                        : 'No submitted requests yet.'
                    }
                  />
                </TableBody>
              </Table>
            </Scrollbar>

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
  inputData: ReviewQueueItem[];
  filters: ReviewQueueFilters;
  comparator: (a: ReviewQueueItem, b: ReviewQueueItem) => number;
  currentUserId: number | undefined;
};

function applyFilter({ inputData, comparator, filters, currentUserId }: ApplyFilterProps) {
  const { name, status, assignment } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  const term = name.trim().toLocaleLowerCase();

  if (term) {
    inputData = inputData.filter(({ softwareName, vendor, version, requestorName }) =>
      [softwareName, vendor, version, requestorName].some((field) =>
        field.toLocaleLowerCase().includes(term)
      )
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((request) => request.statusCode === status);
  }

  if (assignment === 'mine') {
    inputData = inputData.filter((request) => request.assignedReviewerId === currentUserId);
  } else if (assignment === 'unassigned') {
    inputData = inputData.filter((request) => request.assignedReviewerId === null);
  }

  return inputData;
}
