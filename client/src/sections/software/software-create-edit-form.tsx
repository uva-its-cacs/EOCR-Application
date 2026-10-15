import type { Software } from './types';

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FormProvider } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { ErrorState, LoadingState } from 'src/components/feedback';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

import { useSoftwareEditor } from './use-software-editor';
import { SoftwareEditorFields } from './view/software-editor-fields';
import { SoftwareCreateEditStatusDate } from './software-create-edit-status-date';

// ----------------------------------------------------------------------

// Adapted from the template's invoice-create-edit-form.tsx: a Card with the identity fields, the
// neutral status/date row and the details, then right-aligned large buttons below the card. Saving
// goes through useSoftwareEditor (zod validation, server field errors, conflict and access messages).
// Edit only: there is no create endpoint yet.
type Props = {
  software: Software;
};

export function SoftwareCreateEditForm({ software }: Props) {
  const navigate = useNavigate();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { methods, options, submit, saveError, saving } = useSoftwareEditor(software, () => {
    navigate(paths.catalog.root);
  });
  const dirty = methods.formState.isDirty;
  const ready = !!options.data && !options.isError;

  const requestBack = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else navigate(paths.catalog.root);
  };

  return (
    <>
      <FormProvider {...methods}>
        <Box
          component="form"
          noValidate
          onSubmit={submit}
          aria-busy={saving}
        >
          <Card>
            {options.isPending && (
              <Box sx={{ p: 3 }}>
                <LoadingState message="Loading editing options..." />
              </Box>
            )}
            {options.isError && (
              <Box sx={{ p: 3 }}>
                <ErrorState
                  onRetry={() => {
                    void options.refetch();
                  }}
                >
                  Editing options could not be loaded.
                </ErrorState>
              </Box>
            )}
            {saveError && (
              <Box sx={{ p: 3, pb: 0 }}>
                <Alert severity="error">{saveError}</Alert>
              </Box>
            )}

            {ready && options.data && (
              <Box
                component="fieldset"
                disabled={saving}
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
                    sx={{ gridColumn: { md: '1 / -1' } }}
                  />
                </Box>

                <SoftwareCreateEditStatusDate
                  software={software}
                  options={options.data}
                  saving={saving}
                />

                <SoftwareEditorFields
                  software={software}
                  options={options.data}
                  saving={saving}
                />
              </Box>
            )}
          </Card>

          <Typography
            role="status"
            variant="body2"
            color="text.secondary"
            sx={{ mt: saving ? 2 : 0 }}
          >
            {saving ? 'Saving software...' : ''}
          </Typography>

          <Box
            sx={{
              mt: 3,
              gap: 2,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              color="inherit"
              size="large"
              variant="outlined"
              aria-disabled={saving}
              onClick={requestBack}
            >
              Back to software catalog
            </Button>

            <Button
              type="submit"
              size="large"
              variant="contained"
              disabled={!ready}
              // aria-disabled (not the template's `loading`, which disables the button) keeps focus here.
              aria-disabled={saving}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </Box>
        </Box>
      </FormProvider>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        content="Your changes to this software have not been saved."
        destructive
        confirmLabel="Discard changes"
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => navigate(paths.catalog.root)}
      />
    </>
  );
}
