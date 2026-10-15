import type { Software, SoftwareOptions } from '../types';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

import { withCurrentOption } from '../software-editor-options';

// ----------------------------------------------------------------------

// The details section of the edit form (the template's invoice-create-edit-details.tsx position):
// category, owners, accessibility risk and notes.
type Props = { software: Software; options: SoftwareOptions; saving: boolean };

export function SoftwareEditorFields({ software, options, saving }: Props) {
  const owners = options.owners.map((option) => ({ id: option.userId, label: option.name }));
  const selects = [
    {
      name: 'softwareCategoryId',
      label: 'Category',
      options: withCurrentOption(
        options.categories.map((option) => ({ id: option.codeId, label: option.label })),
        software.softwareCategoryId,
        software.softwareCategoryLabel
      ),
    },
    {
      name: 'accessibilityRiskId',
      label: 'Accessibility risk',
      options: withCurrentOption(
        options.risks.map((option) => ({ id: option.codeId, label: option.label })),
        software.accessibilityRiskId,
        software.accessibilityRiskLabel
      ),
    },
    {
      name: 'businessOwnerId',
      label: 'Business owner',
      options: withCurrentOption(owners, software.businessOwnerId, software.businessOwnerName),
    },
    {
      name: 'technicalOwnerId',
      label: 'Technical owner',
      options: withCurrentOption(owners, software.technicalOwnerId, software.technicalOwnerName),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h6"
        component="h2"
        // text.secondary: the template's text.disabled is below 4.5:1.
        sx={{ color: 'text.secondary', mb: 3 }}
      >
        Details:
      </Typography>

      <Box
        sx={{
          gap: 3,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        {selects.map((select) => (
          <RHFSelect
            key={select.name}
            name={select.name}
            label={select.label}
            disabled={saving}
          >
            <MenuItem value="">Not set</MenuItem>
            {select.options.map((option) => (
              <MenuItem
                key={option.id}
                value={option.id.toString()}
              >
                {option.label}
              </MenuItem>
            ))}
          </RHFSelect>
        ))}
      </Box>

      <RHFTextField
        name="notes"
        label="Notes"
        multiline
        minRows={4}
        helperText="Optional. Up to 4000 characters."
        sx={{ mt: 3 }}
      />
    </Box>
  );
}
