import type { Software, SoftwareOptions } from './types';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

import { withCurrentOption } from './software-editor-options';

// ----------------------------------------------------------------------

// Adapted from the template's invoice-create-edit-status-date.tsx: the neutral row holds the approval
// status and dates. Options come from the server (no hard-coded status list), and the dates are native
// date fields because @mui/x-date-pickers is not approved.
type Props = {
  software: Software;
  options: SoftwareOptions;
  saving: boolean;
};

export function SoftwareCreateEditStatusDate({ software, options, saving }: Props) {
  const statuses = withCurrentOption(
    options.approvalStatuses.map((option) => ({ id: option.codeId, label: option.label })),
    software.currentApprovalStatusId,
    software.currentApprovalStatusLabel
  );

  return (
    <Box
      sx={{
        p: 3,
        gap: 2,
        display: 'flex',
        bgcolor: 'background.neutral',
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      <RHFSelect
        fullWidth
        name="currentApprovalStatusId"
        label="Approval status"
        required
        disabled={saving}
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {statuses.map((option) => (
          <MenuItem
            key={option.id}
            value={option.id.toString()}
          >
            {option.label}
          </MenuItem>
        ))}
      </RHFSelect>

      <RHFTextField
        fullWidth
        name="approvalDate"
        label="Approval date"
        type="date"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <RHFTextField
        fullWidth
        name="approvalExpirationDate"
        label="Expiration date"
        type="date"
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </Box>
  );
}
