import type { GridOverlayProps } from '@mui/x-data-grid';

import Box from '@mui/material/Box';
import { GridOverlay } from '@mui/x-data-grid';

import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

type Props = GridOverlayProps & {
  title?: string;
};

// No-rows and no-results overlay: the template's EmptyContent (as in its product list) in a polite
// status region, so it is announced when a search or filter leaves no rows.
export function DataGridEmptyOverlay({ title = 'No rows', ...other }: Props) {
  return (
    <GridOverlay {...other}>
      <Box role="status" sx={{ px: 2, textAlign: 'center' }}>
        <EmptyContent title={title} slotProps={{ title: { component: 'p' } }} sx={{ py: 3 }} />
      </Box>
    </GridOverlay>
  );
}
