import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  QuickFilter,
  QuickFilterControl,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid'

export function SoftwareGridToolbar() {
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
        <Tooltip title="Choose columns">
          <ColumnsPanelTrigger render={<ToolbarButton aria-label="Choose software columns" />}>
            <ViewColumnOutlinedIcon fontSize="small" />
          </ColumnsPanelTrigger>
        </Tooltip>
        <Tooltip title="Filter software">
          <FilterPanelTrigger render={<ToolbarButton aria-label="Filter software" />}>
            <FilterListIcon fontSize="small" />
          </FilterPanelTrigger>
        </Tooltip>
      </Box>
    </Toolbar>
  )
}
