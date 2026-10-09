import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

type Props = {
  message: string;
};

// A polite live region with visible text; the spinner is decorative.
export function LoadingState({ message }: Props) {
  return (
    <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
      <CircularProgress size={20} aria-hidden />
      <Typography>{message}</Typography>
    </Box>
  );
}
