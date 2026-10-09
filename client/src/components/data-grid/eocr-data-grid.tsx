import type { DataGridProps, GridValidRowModel } from '@mui/x-data-grid';

import { DataGrid } from '@mui/x-data-grid';

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

/**
 * The app's Data Grid defaults: compact, auto height, 10/25/50 rows per page, no row selection (no
 * checkboxes, no selection on click), the toolbar only when a toolbar slot is given (the template's
 * theme turns it on for every grid), and accessible empty, no-results and loading overlays.
 */
export function EocrDataGrid<R extends GridValidRowModel>({
  emptyTitle,
  slots,
  slotProps,
  initialState,
  ...other
}: EocrDataGridProps<R>) {
  return (
    <DataGrid<R>
      autoHeight
      density="compact"
      columnHeaderHeight={40}
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
    />
  );
}
