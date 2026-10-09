import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { VisuallyHidden } from 'src/components/visually-hidden';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  // null while the data is loading: shows an em dash with "Loading" for screen readers.
  value: number | null;
};

/**
 * One title and value pair of a StatCardGroup (a `dt` and `dd` grouped in a `div`, which HTML allows
 * inside a `dl`). Uses the template's Card look from the theme. No trend row: there is no trend data.
 */
export function StatCard({ title, value }: Props) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography component="dt" variant="body2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography component="dd" variant="h4" sx={{ m: 0, mt: 1 }}>
        {value === null ? (
          <>
            <span aria-hidden>—</span>
            <VisuallyHidden>Loading</VisuallyHidden>
          </>
        ) : (
          value
        )}
      </Typography>
    </Card>
  );
}
