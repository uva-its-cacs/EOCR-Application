import type { UseFormReturn } from 'react-hook-form';

import * as z from 'zod';
import { useId, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Adapted from the template's sections/user/user-quick-edit-form.tsx: a dialog form for a workflow step
// that carries a comment ("Request more information", "Send for EEAAP"). EOCR changes: one comment field
// (required when the step needs one), the dialog is named by its title and described by its text, errors
// are tied to the field and focus moves to it, the dialog stays open on a failed save, and no mock data.

export type ReviewActionValues = { comments: string };

type Props = {
  open: boolean;
  title: string;
  description: string;
  commentLabel: string;
  commentHelp?: string;
  commentRequired: boolean;
  confirmLabel: string;
  busy: boolean;
  onClose: () => void;
  // Resolves true when the step was saved (the dialog then closes).
  onConfirm: (comments: string, form: UseFormReturn<ReviewActionValues>) => Promise<boolean>;
};

export function ReviewActionDialog({
  open,
  title,
  description,
  commentLabel,
  commentHelp,
  commentRequired,
  confirmLabel,
  busy,
  onClose,
  onConfirm,
}: Props) {
  const titleId = useId();
  const descriptionId = useId();

  const schema = z.object({
    comments: commentRequired
      ? z
          .string()
          .trim()
          .min(1, `Enter the ${commentLabel.toLowerCase()}.`)
          .max(4000, 'Use 4000 characters or fewer.')
      : z.string().trim().max(4000, 'Use 4000 characters or fewer.'),
  });

  const methods = useForm<ReviewActionValues>({
    resolver: zodResolver(schema),
    defaultValues: { comments: '' },
  });

  const {
    reset,
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (open) reset({ comments: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (busy) return;
    if (await onConfirm(data.comments.trim(), methods)) onClose();
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={busy ? undefined : onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slotProps={{
        paper: {
          sx: { maxWidth: 560 },
        },
        // Focus starts in the comment field once the dialog has opened.
        transition: { onEntered: () => methods.setFocus('comments') },
      }}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>

      <Form
        methods={methods}
        onSubmit={onSubmit}
      >
        <DialogContent>
          <Box
            id={descriptionId}
            sx={{ mb: 3, typography: 'body2' }}
          >
            {description}
          </Box>

          {errors.comments && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              Check the highlighted field.
            </Alert>
          )}

          <Field.Text
            name="comments"
            label={commentLabel}
            helperText={commentHelp}
            required={commentRequired}
            multiline
            minRows={4}
          />
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
