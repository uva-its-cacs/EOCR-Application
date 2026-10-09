import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {
  Toolbar,
  QuickFilter,
  ToolbarButton,
  useGridRootProps,
  FilterPanelTrigger,
  QuickFilterControl,
  ColumnsPanelTrigger,
} from '@mui/x-data-grid';

// ----------------------------------------------------------------------

/**
 * Search, column chooser and filters. The search field has the visible label "Search software" and is
 * its own tab stop; the two buttons are toolbar items (one tab stop, arrow keys between them) with
 * visible text, using the grid's own icon slots for those actions.
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
        <QuickFilter expanded>
          <QuickFilterControl
            render={({ ref, slotProps, ...props }) => (
              <TextField
                {...props}
                id={slotProps?.htmlInput?.id}
                inputRef={ref}
                label="Search software"
                size="small"
                slotProps={{
                  htmlInput: slotProps?.htmlInput,
                  inputLabel: { shrink: true },
                }}
                sx={{ width: { xs: 180, sm: 260 }, maxWidth: '100%' }}
              />
            )}
          />
        </QuickFilter>
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
