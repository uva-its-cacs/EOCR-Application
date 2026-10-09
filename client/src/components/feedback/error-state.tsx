import type { AlertProps } from '@mui/material/Alert';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  // Shows a Retry button that calls this.
  onRetry?: () => void;
  sx?: AlertProps['sx'];
};

// An error message (Alert, role="alert") with an optional Retry action.
export function ErrorState({ children, onRetry, sx }: Props) {
  return (
    <Alert
      severity="error"
      sx={sx}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      {children}
    </Alert>
  );
}
