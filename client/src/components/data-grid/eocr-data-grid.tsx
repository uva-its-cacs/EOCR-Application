import type { DataGridProps, GridValidRowModel } from '@mui/x-data-grid';

import Card from '@mui/material/Card';
import { DataGrid } from '@mui/x-data-grid';

import { labelClasses } from 'src/components/label';

import { DataGridEmptyOverlay } from './data-grid-empty-overlay';
import { DataGridLoadingOverlay } from './data-grid-loading-overlay';

// ----------------------------------------------------------------------

declare module '@mui/x-data-grid' {
  interface NoRowsOverlayPropsOverrides {
    title?: string;
  }
  interface NoResultsOverlayPropsOverrides {
    title?: string;
  }
}

export type EocrDataGridProps<R extends GridValidRowModel> = Omit<
  DataGridProps<R>,
  'aria-label' | 'checkboxSelection'
> & {
  // Required: every grid has an accessible name.
  'aria-label': string;
  // Shown (and announced) when the grid has no rows.
  emptyTitle: string;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PAGE_SIZE = 10;
const NO_RESULTS_TITLE = 'No rows match the current search or filters.';
const getRowHeight = () => 'auto' as const;

/**
 * The app's Data Grid defaults: compact, auto height, 10/25/50 rows per page, no row selection (no
 * checkboxes, no selection on click), the toolbar only when a toolbar slot is given (the template's
 * theme turns it on for every grid), accessible empty, no-results and loading overlays, and a block
 * Card container that keeps the grid at its content height and its horizontal scroll inside the grid.
 * Rows grow to show long values instead of truncating them, including under text-spacing overrides.
 */
export function EocrDataGrid<R extends GridValidRowModel>({
  emptyTitle,
  slots,
  slotProps,
  initialState,
  sx,
  ...other
}: EocrDataGridProps<R>) {
  // Keep the Card at its content height, with wide columns scrolling inside the grid.
  return (
    <Card sx={{ minWidth: 0, width: 1, flexShrink: 0 }}>
      <DataGrid<R>
        autoHeight
        density="compact"
        columnHeaderHeight={40}
        getRowHeight={getRowHeight}
        disableRowSelectionOnClick
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        showToolbar={Boolean(slots?.toolbar)}
        initialState={{
          ...initialState,
          pagination: {
            paginationModel: { pageSize: DEFAULT_PAGE_SIZE },
            ...initialState?.pagination,
          },
        }}
        slots={{
          noRowsOverlay: DataGridEmptyOverlay,
          noResultsOverlay: DataGridEmptyOverlay,
          loadingOverlay: DataGridLoadingOverlay,
          ...slots,
        }}
        slotProps={{
          ...slotProps,
          noRowsOverlay: { title: emptyTitle, ...slotProps?.noRowsOverlay },
          noResultsOverlay: { title: NO_RESULTS_TITLE, ...slotProps?.noResultsOverlay },
        }}
        {...other}
        checkboxSelection={false}
        sx={[
          {
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              minHeight: 36,
              py: 1,
              lineHeight: 1.5,
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
            },
            '& .MuiDataGrid-cell--textRight': { justifyContent: 'flex-end' },
            '& .MuiDataGrid-cell--textCenter': { justifyContent: 'center' },
            '& .MuiDataGrid-cell .MuiDataGrid-cellContent': {
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
            },
            '& .MuiDataGrid-cell .MuiDataGrid-cellContent, & .MuiDataGrid-cell > *': {
              maxWidth: '100%',
            },
            [`& .MuiDataGrid-cell .${labelClasses.root}`]: {
              height: 'auto',
              minHeight: 24,
              whiteSpace: 'normal',
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    </Card>
  );
}
