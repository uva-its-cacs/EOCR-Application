import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
  Toolbar,
  ToolbarButton,
  useGridRootProps,
  FilterPanelTrigger,
  ColumnsPanelTrigger,
} from '@mui/x-data-grid';

// ----------------------------------------------------------------------

/**
 * Column chooser and grid filters, using the grid's own icons with visible text.
 */
export function SoftwareGridToolbar() {
  const { slots } = useGridRootProps();
  const ColumnsIcon = slots.columnSelectorIcon;
  const FiltersIcon = slots.openFilterButtonIcon;

  return (
    <Toolbar aria-label="Software search and filters">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          width: '100%',
          py: 1,
        }}
      >
        <ColumnsPanelTrigger
          render={
            <ToolbarButton
              render={(props) => (
                <Button
                  {...props}
                  size="small"
                  color="inherit"
                  startIcon={<ColumnsIcon />}
                />
              )}
            />
          }
        >
          Columns
        </ColumnsPanelTrigger>
        <FilterPanelTrigger
          render={
            <ToolbarButton
              render={(props) => (
                <Button
                  {...props}
                  size="small"
                  color="inherit"
                  startIcon={<FiltersIcon />}
                />
              )}
            />
          }
        >
          Filters
        </FilterPanelTrigger>
      </Box>
    </Toolbar>
  );
}
