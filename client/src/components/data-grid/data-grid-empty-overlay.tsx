import type { GridOverlayProps } from '@mui/x-data-grid';

import Box from '@mui/material/Box';
import { GridOverlay } from '@mui/x-data-grid';

import { EmptyState } from 'src/components/feedback';

// ----------------------------------------------------------------------

type Props = GridOverlayProps & {
  title?: string;
};

// No-rows and no-results overlay: an EmptyState in a polite status region, so it is announced when a
// search or filter leaves no rows.
export function DataGridEmptyOverlay({ title = 'No rows', ...other }: Props) {
  return (
    <GridOverlay {...other}>
      <Box role="status" sx={{ px: 2, textAlign: 'center' }}>
        <EmptyState title={title} />
      </Box>
    </GridOverlay>
  );
}
