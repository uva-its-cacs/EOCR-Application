import { useRef, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SoftwareSelectField } from './SoftwareSelectField'
import type { Software, SoftwareDraft, SoftwareFieldErrors, SoftwareOptions } from '../types'

interface Props {
  software: Software
  draft: SoftwareDraft
  fieldErrors: SoftwareFieldErrors
  options?: SoftwareOptions
  isLoadingOptions: boolean
  optionsError: boolean
  isSaving: boolean
  saveError: string
  onChange: (field: keyof SoftwareDraft, value: string) => void
  onCancel: () => void
  onSave: () => keyof SoftwareDraft | undefined
  onRetryOptions: () => void
}

const fieldsetSx = { border: 0, p: 0, m: 0, minWidth: 0 }
const fieldsSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
  gap: 2,
  mt: 2,
}
const legendSx = { fontWeight: 600, fontSize: '0.875rem' }

function withCurrent(
  options: { value: string; label: string }[],
  id: number | null,
  label: string | null,
) {
  if (id === null || options.some((option) => option.value === String(id))) return options
  return [...options, { value: String(id), label: `${label ?? 'Current value'} (current; unavailable for new selection)` }]
}

export function SoftwareEditDialog({
  software,
  draft,
  fieldErrors,
  options,
  isLoadingOptions,
  optionsError,
  isSaving,
  saveError,
  onChange,
  onCancel,
  onSave,
  onRetryOptions,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const selectsDisabled = isSaving || isLoadingOptions || optionsError || !options
  const categoryOptions = withCurrent(
    (options?.categories ?? []).map((option) => ({ value: String(option.codeId), label: option.label })),
    software.softwareCategoryId,
    software.softwareCategoryLabel,
  )
  const statusOptions = withCurrent(
    (options?.approvalStatuses ?? []).map((option) => ({ value: String(option.codeId), label: option.label })),
    software.currentApprovalStatusId,
    software.currentApprovalStatusLabel,
  )
  const riskOptions = withCurrent(
    (options?.risks ?? []).map((option) => ({ value: String(option.codeId), label: option.label })),
    software.accessibilityRiskId,
    software.accessibilityRiskLabel,
  )
  const ownerOptions = (options?.owners ?? []).map((owner) => ({
    value: String(owner.userId),
    label: owner.name,
  }))

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalidField = onSave()
    if (invalidField) {
      formRef.current?.querySelector<HTMLElement>(`#software-${invalidField}`)?.focus()
    }
  }

  return (
    <Dialog
      open
      onClose={isSaving ? undefined : onCancel}
      fullWidth
      maxWidth="md"
      aria-labelledby="software-edit-title"
      aria-describedby="software-edit-description"
      slotProps={{ transition: { onEntered: () => nameInputRef.current?.focus() } }}
    >
      <Box
        component="form"
        ref={formRef}
        onSubmit={submit}
        noValidate
        aria-busy={isSaving}
        sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(100dvh - 64px)' }}
      >
        <DialogTitle id="software-edit-title">Edit software</DialogTitle>
        <DialogContent dividers>
          <DialogContentText id="software-edit-description" sx={{ mb: 3 }}>
            Update {software.softwareName}. Fields marked with an asterisk are required.
          </DialogContentText>
          {isLoadingOptions && (
            <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={18} aria-hidden="true" />
              <Typography>Loading editing options...</Typography>
            </Box>
          )}
          {optionsError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={<Button onClick={onRetryOptions}>Retry</Button>}
            >
              Editing options could not be loaded. Retry before saving.
            </Alert>
          )}
          {Object.values(fieldErrors).some(Boolean) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Check the highlighted fields before saving.
            </Alert>
          )}
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <Box component="fieldset" disabled={isSaving} sx={fieldsetSx}>
            <Typography component="legend" sx={legendSx}>Software details</Typography>
            <Box sx={fieldsSx}>
              <TextField
                id="software-softwareName"
                label="Software name"
                value={draft.softwareName}
                required
                inputRef={nameInputRef}
                fullWidth
                onChange={(event) => onChange('softwareName', event.target.value)}
                error={Boolean(fieldErrors.softwareName)}
                helperText={fieldErrors.softwareName}
                slotProps={{ htmlInput: { maxLength: 200 } }}
              />
              <TextField
                id="software-vendorName"
                label="Vendor"
                value={draft.vendorName}
                required
                fullWidth
                onChange={(event) => onChange('vendorName', event.target.value)}
                error={Boolean(fieldErrors.vendorName)}
                helperText={fieldErrors.vendorName}
                slotProps={{ htmlInput: { maxLength: 200 } }}
              />
              <TextField
                id="software-publisherWebsite"
                label="Publisher website"
                value={draft.publisherWebsite}
                type="url"
                fullWidth
                onChange={(event) => onChange('publisherWebsite', event.target.value)}
                error={Boolean(fieldErrors.publisherWebsite)}
                helperText={fieldErrors.publisherWebsite || 'Use an HTTP or HTTPS address.'}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
              />
              <SoftwareSelectField
                id="software-softwareCategoryId"
                label="Category"
                value={draft.softwareCategoryId}
                options={categoryOptions}
                onChange={(value) => onChange('softwareCategoryId', value)}
                error={fieldErrors.softwareCategoryId}
                disabled={selectsDisabled}
              />
            </Box>
          </Box>
          <Box component="fieldset" disabled={isSaving} sx={{ ...fieldsetSx, mt: 3 }}>
            <Typography component="legend" sx={legendSx}>Accessibility review</Typography>
            <Box sx={fieldsSx}>
              <SoftwareSelectField
                id="software-currentApprovalStatusId"
                label="Approval status"
                value={draft.currentApprovalStatusId}
                options={statusOptions}
                required
                onChange={(value) => onChange('currentApprovalStatusId', value)}
                error={fieldErrors.currentApprovalStatusId}
                disabled={selectsDisabled}
              />
              <SoftwareSelectField
                id="software-accessibilityRiskId"
                label="Accessibility risk"
                value={draft.accessibilityRiskId}
                options={riskOptions}
                onChange={(value) => onChange('accessibilityRiskId', value)}
                error={fieldErrors.accessibilityRiskId}
                disabled={selectsDisabled}
              />
              <TextField
                id="software-approvalDate"
                label="Approval date"
                type="date"
                value={draft.approvalDate}
                fullWidth
                onChange={(event) => onChange('approvalDate', event.target.value)}
                error={Boolean(fieldErrors.approvalDate)}
                helperText={fieldErrors.approvalDate}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                id="software-approvalExpirationDate"
                label="Approval expiration"
                type="date"
                value={draft.approvalExpirationDate}
                fullWidth
                onChange={(event) => onChange('approvalExpirationDate', event.target.value)}
                error={Boolean(fieldErrors.approvalExpirationDate)}
                helperText={fieldErrors.approvalExpirationDate}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          </Box>
          <Box component="fieldset" disabled={isSaving} sx={{ ...fieldsetSx, mt: 3 }}>
            <Typography component="legend" sx={legendSx}>Owners and notes</Typography>
            <Box sx={fieldsSx}>
              <SoftwareSelectField
                id="software-businessOwnerId"
                label="Business owner"
                value={draft.businessOwnerId}
                options={ownerOptions}
                onChange={(value) => onChange('businessOwnerId', value)}
                error={fieldErrors.businessOwnerId}
                disabled={selectsDisabled}
              />
              <SoftwareSelectField
                id="software-technicalOwnerId"
                label="Technical owner"
                value={draft.technicalOwnerId}
                options={ownerOptions}
                onChange={(value) => onChange('technicalOwnerId', value)}
                error={fieldErrors.technicalOwnerId}
                disabled={selectsDisabled}
              />
              <TextField
                id="software-notes"
                label="Notes"
                value={draft.notes}
                multiline
                minRows={3}
                fullWidth
                sx={{ gridColumn: '1 / -1' }}
                onChange={(event) => onChange('notes', event.target.value)}
                error={Boolean(fieldErrors.notes)}
                helperText={fieldErrors.notes || `${draft.notes.length} / 4000 characters`}
                slotProps={{ htmlInput: { maxLength: 4000 } }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving || isLoadingOptions || optionsError || !options}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
