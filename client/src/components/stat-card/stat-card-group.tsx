import { useId } from 'react';

import Box from '@mui/material/Box';

import { VisuallyHidden } from 'src/components/visually-hidden';

// ----------------------------------------------------------------------

type Props = {
  // The group's accessible name, as a visually hidden h2.
  title: string;
  // aria-busy while the values are loading.
  busy?: boolean;
  // StatCard elements.
  children: React.ReactNode;
};

/**
 * A named region holding one description list of StatCards: 1 column on phones, 2 from sm, 4 from lg.
 */
export function StatCardGroup({ title, busy = false, children }: Props) {
  const headingId = useId();

  return (
    <Box component="section" aria-labelledby={headingId} aria-busy={busy} sx={{ mb: 3 }}>
      <VisuallyHidden component="h2" id={headingId}>
        {title}
      </VisuallyHidden>
      <Box
        component="dl"
        sx={{
          m: 0,
          gap: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
