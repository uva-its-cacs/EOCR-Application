import type { DecideValues } from './review-schema';
import type { ReviewOptions, ReviewRequestDetail } from './types';

import { useId, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import AlertTitle from '@mui/material/AlertTitle';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { formatDateOnly } from 'src/utils/format';

import { Form, Field } from 'src/components/hook-form';

import { decideRequest } from './api';
import { useReviewWrite } from './use-review-actions';
import { todayDate, decideInput, decideSchema } from './review-schema';
import { DENIED, APPROVED, defaultExpiryDate, APPROVED_WITH_CONDITIONS } from './review-workflow';

// ----------------------------------------------------------------------

// Adapted from the template's sections/user/user-quick-edit-form.tsx: the decision dialog. EOCR changes:
// the decision, expiry, risk, conditions and comments fields (options from the server's codes); the
// expiry defaults to twelve months from today (and is not shown for a denial), conditions and risk start
// from the review; a live
// preview says what the decision will change in the software catalog; the dialog is named by its title,
// errors are summarized and tied to their fields with focus on the first, and it stays open on failure.

type Props = {
  open: boolean;
  detail: ReviewRequestDetail;
  options: ReviewOptions | undefined;
  onClose: () => void;
  // Called after a successful decision (the dialog closes first).
  onDecided: () => void;
};

export function ReviewDecideDialog({ open, detail, options, onClose, onDecided }: Props) {
  const titleId = useId();
  const { request, review } = detail;
  const today = todayDate();
  // A submitted EEAAP is decided with the request: approved with conditions, or denied.
  const eeaap = request.exception?.statusCode === 'Submitted' ? request.exception : null;
  const schema = useMemo(() => decideSchema(today, !!eeaap), [today, eeaap]);

  const defaultValues: DecideValues = useMemo(
    () => ({
      outcome: '',
      approvalExpirationDate: defaultExpiryDate(),
      accessibilityRiskId: review?.riskRatingId?.toString() ?? '',
      conditions: review?.conditions ?? eeaap?.mitigationPlan ?? '',
      comments: '',
    }),
    [review, eeaap]
  );

  const methods = useForm<DecideValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, submitCount },
  } = methods;

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, reset, defaultValues]);

  const write = useReviewWrite(
    request.requestId,
    (values: DecideValues) =>
      decideRequest(request.requestId, decideInput(values, request.updatedAt)),
    'Decision recorded and the software catalog updated.'
  );

  const onSubmit = handleSubmit(async (values) => {
    if (write.pending) return;
    if (await write.run(values, methods)) {
      onClose();
      onDecided();
    }
  });

  const outcome = useWatch({ control, name: 'outcome' });
  const expiry = useWatch({ control, name: 'approvalExpirationDate' });
  const approved = outcome !== '' && outcome !== DENIED;
  const outcomeLabel = options?.outcomes.find((option) => option.value === outcome)?.label;

  const existing = detail.catalogVersions.find(
    (version) => version.version.toLowerCase() === request.version.toLowerCase()
  );
  const product = `${request.softwareName} ${request.version} (${request.vendor})`;
  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={write.pending ? undefined : onClose}
      aria-labelledby={titleId}
      slotProps={{
        paper: {
          sx: { maxWidth: 720 },
        },
        // Focus starts on the Decision select (the dialog's first combobox) once the dialog has opened;
        // react-hook-form's setFocus does not reach the select's display element here.
        transition: {
          onEntered: (node: HTMLElement) =>
            node.querySelector<HTMLElement>('[role="combobox"]')?.focus(),
        },
      }}
    >
      <DialogTitle id={titleId}>Record the decision</DialogTitle>

      <Form
        methods={methods}
        onSubmit={onSubmit}
      >
        <DialogContent>
          {hasErrors && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              Check the highlighted fields.
            </Alert>
          )}

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Select
              name="outcome"
              label="Decision"
              required
              disabled={!options}
              slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            >
              <MenuItem
                value=""
                disabled
              >
                Select a decision
              </MenuItem>
              {options?.outcomes
                .filter((option) => !eeaap || option.value !== APPROVED)
                .map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
            </Field.Select>

            {outcome === DENIED ? (
              <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
            ) : (
              <Field.Text
                name="approvalExpirationDate"
                label="Approval expires"
                type="date"
                required
                helperText="Twelve months from today unless you change it."
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}

            <Field.Select
              name="accessibilityRiskId"
              label="Accessibility risk"
              disabled={!options}
              slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            >
              <MenuItem value="">Not rated</MenuItem>
              {options?.risks.map((option) => (
                <MenuItem
                  key={option.codeId}
                  value={option.codeId.toString()}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            {outcome === APPROVED_WITH_CONDITIONS && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Field.Text
                  name="conditions"
                  label="Conditions"
                  required
                  multiline
                  minRows={3}
                />
              </Box>
            )}

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Field.Text
                name="comments"
                label="Comments for the requester"
                helperText="Shown in the request's history."
                multiline
                minRows={2}
              />
            </Box>
          </Box>

          {/* A polite live region: the preview changes as the decision is chosen. */}
          <Alert
            severity="info"
            variant="outlined"
            role="status"
            sx={{ mt: 3 }}
          >
            <AlertTitle component="h3">Software catalog change</AlertTitle>
            {!outcome ? (
              'Select a decision to see how the catalog will change.'
            ) : (
              <>
                {existing
                  ? `The catalog entry for ${product} will be updated`
                  : `A new catalog entry will be added for ${product}`}
                {`: status ${outcomeLabel ?? outcome}`}
                {approved
                  ? `, approved today, expires ${expiry ? formatDateOnly(expiry) : 'not set'}.`
                  : ', with no approval or expiry dates.'}
                {eeaap &&
                  (approved
                    ? ` The exception (EEAAP) is approved until ${expiry ? formatDateOnly(expiry) : 'the expiry date'}.`
                    : ' The exception (EEAAP) is denied.')}
              </>
            )}
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={write.pending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={write.pending}
          >
            Record decision
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
