import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

// Shown when a list or page has nothing to show yet.
export function EmptyState({ title, description, action }: Props) {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="subtitle1">{title}</Typography>
      {description && (
        <Typography component="div" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
