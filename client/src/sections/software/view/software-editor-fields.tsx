import type { Software, SoftwareOptions } from '../types';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

type Props = { software: Software; options: SoftwareOptions; saving: boolean };

export function SoftwareEditorFields({ software, options, saving }: Props) {
  const selects = [
    {
      name: 'softwareCategoryId',
      label: 'Category',
      options: options.categories.map((option) => ({ id: option.codeId, label: option.label })),
      currentId: software.softwareCategoryId,
      currentLabel: software.softwareCategoryLabel,
      optional: true,
    },
    {
      name: 'businessOwnerId',
      label: 'Business owner',
      options: options.owners.map((option) => ({ id: option.userId, label: option.name })),
      currentId: software.businessOwnerId,
      currentLabel: software.businessOwnerName,
      optional: true,
    },
    {
      name: 'technicalOwnerId',
      label: 'Technical owner',
      options: options.owners.map((option) => ({ id: option.userId, label: option.name })),
      currentId: software.technicalOwnerId,
      currentLabel: software.technicalOwnerName,
      optional: true,
    },
    {
      name: 'currentApprovalStatusId',
      label: 'Approval status',
      options: options.approvalStatuses.map((option) => ({
        id: option.codeId,
        label: option.label,
      })),
      currentId: software.currentApprovalStatusId,
      currentLabel: software.currentApprovalStatusLabel,
      optional: false,
    },
    {
      name: 'accessibilityRiskId',
      label: 'Accessibility risk',
      options: options.risks.map((option) => ({ id: option.codeId, label: option.label })),
      currentId: software.accessibilityRiskId,
      currentLabel: software.accessibilityRiskLabel,
      optional: true,
    },
  ];

  return (
    <Box
      component="fieldset"
      disabled={saving}
      sx={{ border: 0, p: 0, m: 0, minWidth: 0, display: 'grid', gap: 2.5 }}
    >
      <Typography
        variant="subtitle1"
        component="h3"
      >
        Software details
      </Typography>
      <RHFTextField
        name="softwareName"
        label="Software name"
        required
        autoComplete="off"
      />
      <RHFTextField
        name="vendorName"
        label="Vendor name"
        required
        autoComplete="organization"
      />
      <RHFTextField
        name="publisherWebsite"
        label="Publisher website"
        type="url"
        autoComplete="url"
        helperText="Optional. Include http:// or https://."
      />
      {selects.map((select) => {
        const available = [...select.options];
        if (
          select.currentId !== null &&
          !available.some((option) => option.id === select.currentId)
        ) {
          available.push({
            id: select.currentId,
            label: `${select.currentLabel ?? 'Current option'} (current)`,
          });
        }
        return (
          <RHFSelect
            key={select.name}
            name={select.name}
            label={select.label}
            required={!select.optional}
            disabled={saving}
          >
            {select.optional && <MenuItem value="">Not set</MenuItem>}
            {available.map((option) => (
              <MenuItem
                key={option.id}
                value={option.id.toString()}
              >
                {option.label}
              </MenuItem>
            ))}
          </RHFSelect>
        );
      })}
      <Typography
        variant="subtitle1"
        component="h3"
      >
        Approval dates and notes
      </Typography>
      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <RHFTextField
          name="approvalDate"
          label="Approval date"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <RHFTextField
          name="approvalExpirationDate"
          label="Expiration date"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>
      <RHFTextField
        name="notes"
        label="Notes"
        multiline
        minRows={4}
        helperText="Optional. Up to 4000 characters."
      />
    </Box>
  );
}
