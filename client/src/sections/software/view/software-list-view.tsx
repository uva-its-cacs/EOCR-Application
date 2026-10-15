import type { ReactNode } from 'react';
import type { Theme } from '@mui/material/styles';
import type { LabelColor } from 'src/components/label';
import type { IconifyName } from 'src/components/iconify';
import type { TableHeadCellProps } from 'src/components/table';
import type { SoftwareCatalogItem, SoftwareTableFilters } from '../types';

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

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingState } from 'src/components/feedback';
import { PageHeader } from 'src/components/page-header';
import { VisuallyHidden } from 'src/components/visually-hidden';
import { AnalyticSummary } from 'src/components/analytic-summary';
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

import { getStatusColor, APPROVAL_STATUS_COLORS } from 'src/sections/requests/status-colors';

import { SoftwareTableRow } from '../software-table-row';
import { SoftwareTableToolbar } from '../software-table-toolbar';
import { SoftwareTableFiltersResult } from '../software-table-filters-result';

// ----------------------------------------------------------------------

// Adapted from the template's invoice-list-view.tsx, with catalog rows from the API instead of mock
// data. Not ported: checkbox selection and bulk actions (no selection), Delete (no endpoint), date
// filters (date pickers are not approved).

const BASE_TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'softwareName', label: 'Software' },
  { id: 'version', label: 'Version' },
  { id: 'softwareCategoryLabel', label: 'Category' },
  { id: 'accessibilityRiskLabel', label: 'Risk' },
  { id: 'createdAt', label: 'Added' },
  { id: 'approvalExpirationDate', label: 'Expires' },
  { id: 'currentApprovalStatusLabel', label: 'Status' },
];

const ACTIONS_HEAD: TableHeadCellProps = {
  id: 'actions',
  label: <VisuallyHidden>Actions</VisuallyHidden>,
  sortable: false,
};

// Icon per Label color for the analytics strip (registered offline icons only).
const STATUS_ICONS: Partial<Record<LabelColor, IconifyName>> = {
  info: 'solar:sort-by-time-bold-duotone',
  success: 'solar:file-check-bold-duotone',
  warning: 'solar:bell-bing-bold-duotone',
  error: 'solar:file-corrupted-bold-duotone',
};

type StatusSummary = {
  code: string;
  label: string;
  count: number;
  color: LabelColor;
};

type Props = {
  rows: SoftwareCatalogItem[];
  loading?: boolean;
  editHref?: (softwareId: number) => string;
  actions?: ReactNode;
};

export function SoftwareListView({ rows, loading = false, editHref, actions }: Props) {
  const theme = useTheme();

  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const filters = useSetState<SoftwareTableFilters>({
    name: '',
    category: [],
    status: 'all',
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const statuses = useMemo(() => {
    const found = new Map<string, StatusSummary>();

    rows.forEach((row) => {
      const status = found.get(row.currentApprovalStatusCode);
      found.set(row.currentApprovalStatusCode, {
        code: row.currentApprovalStatusCode,
        label: row.currentApprovalStatusLabel,
        count: (status?.count ?? 0) + 1,
        color: getStatusColor(APPROVAL_STATUS_COLORS, row.currentApprovalStatusCode),
      });
    });

    return [...found.values()];
  }, [rows]);

  const categories = useMemo(
    () =>
      [...new Set(rows.flatMap((row) => row.softwareCategoryLabel ?? []))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [rows]
  );

  // A status tab can disappear after a refresh; its filter then no longer applies.
  const activeStatus = statuses.find((status) => status.code === currentFilters.status);
  const effectiveFilters = { ...currentFilters, status: activeStatus ? activeStatus.code : 'all' };

  const dataFiltered = applyFilter({
    inputData: rows,
    comparator: getComparator(table.order, table.orderBy as keyof SoftwareCatalogItem),
    filters: effectiveFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name ||
    currentFilters.category.length > 0 ||
    effectiveFilters.status !== 'all';

  const notFound = !dataFiltered.length && !loading;

  const tableHead = editHref ? [...BASE_TABLE_HEAD, ACTIONS_HEAD] : BASE_TABLE_HEAD;

  const getPercent = (count: number) => (rows.length ? (count / rows.length) * 100 : 0);

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  return (
    <>
      <PageHeader
        title="Software catalog"
        documentTitle="Software catalog"
        description="Browse software and its accessibility approval status."
        actions={actions}
      />

      <Card sx={{ mb: { xs: 3, md: 5 } }}>
        <Scrollbar
          label="Approval summary"
          sx={{ minHeight: 108 }}
        >
          <VisuallyHidden
            component="h2"
            id="software-summary-heading"
          >
            Approval summary
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
              total={rows.length}
              percent={100}
              icon="solar:bill-list-bold-duotone"
              color={theme.vars.palette.info.main}
            />

            {statuses.map((status) => (
              <AnalyticSummary
                key={status.code}
                title={status.label}
                total={status.count}
                percent={getPercent(status.count)}
                icon={STATUS_ICONS[status.color] ?? 'solar:file-bold-duotone'}
                color={analyticColor(theme, status.color)}
              />
            ))}
          </Stack>
        </Scrollbar>
      </Card>

      <Card>
        <Tabs
          value={activeStatus ? activeStatus.code : 'all'}
          onChange={handleFilterStatus}
          aria-label="Filter software by approval status"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: { md: 2.5 },
            boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          {[
            { value: 'all', label: 'All', color: 'default' as LabelColor, count: rows.length },
            ...statuses.map((status) => ({
              value: status.code,
              label: status.label,
              color: status.color,
              count: status.count,
            })),
          ].map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              aria-label={
                tab.value === 'all' ? `All software (${tab.count})` : `${tab.label} (${tab.count})`
              }
              iconPosition="end"
              icon={
                <Label
                  variant={
                    ((tab.value === 'all' || tab.value === effectiveFilters.status) && 'filled') ||
                    'soft'
                  }
                  color={tab.color}
                >
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <SoftwareTableToolbar
          filters={filters}
          onResetPage={table.onResetPage}
          options={{ categories }}
        />

        {canReset && (
          <SoftwareTableFiltersResult
            filters={filters}
            onResetPage={table.onResetPage}
            totalResults={dataFiltered.length}
            statusLabel={activeStatus?.label}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        {/* Announces the result count as filters change (the visible count shows only while filtering). */}
        <VisuallyHidden>
          <span role="status">{loading ? '' : `${dataFiltered.length} results found`}</span>
        </VisuallyHidden>

        <Scrollbar
          label="Software catalog table"
          sx={{ minHeight: 444 }}
        >
          <Table
            aria-label="Software catalog"
            size={table.dense ? 'small' : 'medium'}
            sx={{ minWidth: 800 }}
          >
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headCells={tableHead}
              onSort={table.onSort}
            />

            <TableBody aria-busy={loading}>
              {dataInPage.map((row) => (
                <SoftwareTableRow
                  key={row.softwareId}
                  row={row}
                  editHref={editHref?.(row.softwareId)}
                />
              ))}

              {loading && !dataFiltered.length && (
                <TableRow>
                  <TableCell colSpan={12}>
                    <LoadingState message="Loading software..." />
                  </TableCell>
                </TableRow>
              )}

              <TableEmptyRows
                height={table.dense ? 56 : 56 + 20}
                emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
              />

              <TableNoData
                notFound={notFound}
                title={
                  canReset
                    ? 'No software matches your search or filters.'
                    : 'No software is currently in the catalog.'
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
  );
}

// ----------------------------------------------------------------------

// Theme color for an analytics icon and ring (decorative): the status's main color, or text.secondary
// for statuses without one.
function analyticColor(theme: Theme, color: LabelColor): string {
  const { palette } = theme.vars;
  switch (color) {
    case 'info':
    case 'success':
    case 'warning':
    case 'error':
    case 'primary':
    case 'secondary':
      return palette[color].main;
    default:
      return palette.text.secondary;
  }
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: SoftwareCatalogItem[];
  filters: SoftwareTableFilters;
  comparator: (a: SoftwareCatalogItem, b: SoftwareCatalogItem) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status, category } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  const term = name.trim().toLocaleLowerCase();

  if (term) {
    inputData = inputData.filter(({ softwareName, vendorName, version }) =>
      [softwareName, vendorName, version].some((field) => field.toLocaleLowerCase().includes(term))
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((software) => software.currentApprovalStatusCode === status);
  }

  if (category.length) {
    inputData = inputData.filter(
      (software) =>
        !!software.softwareCategoryLabel && category.includes(software.softwareCategoryLabel)
    );
  }

  return inputData;
}
