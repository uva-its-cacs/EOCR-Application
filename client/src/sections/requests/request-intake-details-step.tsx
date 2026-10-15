import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { ErrorState, LoadingState } from 'src/components/feedback';
import { RHFCheckbox } from 'src/components/hook-form/rhf-checkbox';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

import { useFundingSources } from './use-request';

// ----------------------------------------------------------------------

/**
 * Intake step 2, laid out like the template's create/edit form (invoice-create-edit-form.tsx): the
 * software at the top, the neutral row for department and funding, then the business need and VPAT.
 * Required to submit (marked *): software name, vendor, department, business need and funding source.
 */
type Props = {
  busy: boolean;
  linkedSoftwareName: string | null;
};

export function RequestIntakeDetailsStep({ busy, linkedSoftwareName }: Props) {
  const fundingSources = useFundingSources();

  return (
    <Card>
      <Box
        component="fieldset"
        disabled={busy}
        sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
      >
        <Box
          sx={{
            p: 3,
            gap: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          {linkedSoftwareName && (
            <Typography
              variant="body2"
              sx={{ gridColumn: { md: '1 / -1' }, color: 'text.secondary' }}
            >
              This request is for {linkedSoftwareName}, from the software catalog.
            </Typography>
          )}
          <RHFTextField
            name="softwareName"
            label="Software name"
            required
            autoComplete="off"
          />
          <RHFTextField
            name="vendor"
            label="Vendor"
            required
            autoComplete="organization"
          />
          <RHFTextField
            name="url"
            label="Software or vendor website"
            type="url"
            autoComplete="url"
            helperText="Optional. Include http:// or https://."
            sx={{ gridColumn: { md: '1 / -1' } }}
          />
        </Box>

        <Box
          sx={{
            p: 3,
            gap: 2,
            display: 'flex',
            bgcolor: 'background.neutral',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <RHFTextField
            name="department"
            label="Your department"
            required
            autoComplete="organization-title"
          />
          {fundingSources.isError ? (
            <ErrorState
              onRetry={() => {
                void fundingSources.refetch();
              }}
              sx={{ width: 1 }}
            >
              Funding sources could not be loaded.
            </ErrorState>
          ) : (
            <RHFSelect
              fullWidth
              name="fundingSourceId"
              label="Funding source"
              required
              disabled={busy || fundingSources.isPending}
              slotProps={{ inputLabel: { shrink: true } }}
            >
              <MenuItem value="">Not selected</MenuItem>
              {(fundingSources.data ?? []).map((option) => (
                <MenuItem
                  key={option.codeId}
                  value={option.codeId.toString()}
                >
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
          )}
        </Box>
        {fundingSources.isPending && (
          <Box sx={{ px: 3, pt: 2 }}>
            <LoadingState message="Loading funding sources..." />
          </Box>
        )}

        <Box sx={{ p: 3, display: 'grid', gap: 3 }}>
          <RHFTextField
            name="businessNeed"
            label="Business need"
            required
            multiline
            minRows={4}
            helperText="What the software is for, who will use it, and how. Up to 4000 characters."
          />
          <RHFCheckbox
            name="vpatSubmitted"
            label="The vendor has provided a VPAT (accessibility conformance report)"
            helperText="Upload comes later; for now, tell us whether you have one."
          />
        </Box>
      </Box>
    </Card>
  );
}
