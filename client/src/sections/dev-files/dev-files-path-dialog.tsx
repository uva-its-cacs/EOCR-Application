import { useState, useCallback, type FormEvent } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { ErrorState } from 'src/components/feedback';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  title: string;
  label: string;
  helperText?: string;
  initialValue: string;
  submitLabel: string;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

// One text field in a dialog (the parent remounts it with a `key` to reset the value): new folder name, or the new path when moving or renaming.
export function DevFilesPathDialog({
  open,
  title,
  label,
  helperText,
  initialValue,
  submitLabel,
  pending,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [value, setValue] = useState(initialValue);

  // Runs once when the field mounts (with the dialog), before the focus trap, like ConfirmDialog.
  const focusField = useCallback((element: HTMLInputElement | null) => {
    element?.focus();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {error && <ErrorState sx={{ mb: 2 }}>{error}</ErrorState>}

          <TextField
            fullWidth
            inputRef={focusField}
            label={label}
            helperText={helperText}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={pending}
            disabled={!value.trim()}
          >
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
