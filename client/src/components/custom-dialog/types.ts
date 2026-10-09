import type { DialogProps } from '@mui/material/Dialog';

// ----------------------------------------------------------------------

export type ConfirmDialogProps = Omit<DialogProps, 'title' | 'content' | 'onClose'> & {
  onClose: () => void;
  title: React.ReactNode;
  content?: React.ReactNode;
  // The dialog renders its own confirm button so it can control initial focus.
  confirmLabel: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  // Destructive: error-colored confirm button, initial focus on Cancel. Otherwise focus starts on confirm.
  destructive?: boolean;
};
