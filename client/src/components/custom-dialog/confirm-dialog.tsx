import type { ConfirmDialogProps } from './types';

import { useId, useCallback } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// ----------------------------------------------------------------------

export function ConfirmDialog({
  open,
  title,
  content,
  onClose,
  confirmLabel,
  onConfirm,
  confirmDisabled,
  destructive = false,
  ...other
}: ConfirmDialogProps) {
  const titleId = useId();
  const contentId = useId();

  // Initial focus: Cancel for destructive actions, otherwise the confirm button. The ref runs before the
  // dialog's focus trap effect, so the trap keeps this focus instead of focusing the dialog container.
  const initialFocusRef = useCallback((element: HTMLButtonElement | null) => {
    element?.focus();
  }, []);

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={content ? contentId : undefined}
      {...other}
    >
      <DialogTitle id={titleId} sx={{ pb: 2 }}>
        {title}
      </DialogTitle>

      {content && (
        <DialogContent id={contentId} sx={{ typography: 'body2' }}>
          {content}
        </DialogContent>
      )}

      <DialogActions>
        <Button
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          disabled={confirmDisabled}
          ref={destructive ? undefined : initialFocusRef}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          ref={destructive ? initialFocusRef : undefined}
          onClick={onClose}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
