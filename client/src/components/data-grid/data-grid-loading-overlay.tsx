import Box from '@mui/material/Box';
import { GridOverlay } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

// Replaces the template's skeleton overlay (which has no accessible name) with a named progress bar
// along the top of the grid. The template's overlay styles still color it.
export function DataGridLoadingOverlay() {
  return (
    <GridOverlay>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <LinearProgress aria-label="Loading rows" />
      </Box>
    </GridOverlay>
  );
}
