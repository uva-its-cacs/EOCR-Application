import type { Software } from '../types';

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FormProvider } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { useSoftwareEditor } from '../use-software-editor';
import { SoftwareEditorFields } from './software-editor-fields';

// ----------------------------------------------------------------------

type Props = { software: Software };

export function SoftwareEditorView({ software }: Props) {
  const navigate = useNavigate();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { methods, options, submit, saveError, saving } = useSoftwareEditor(software, () => {
    navigate(paths.catalog.root);
  });
  const dirty = methods.formState.isDirty;
  const requestBack = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else navigate(paths.catalog.root);
  };

  return (
    <>
      <Card>
        <FormProvider {...methods}>
          <Box
            component="form"
            noValidate
            onSubmit={submit}
            aria-busy={saving}
          >
            <CardContent sx={{ display: 'grid', gap: 2.5 }}>
              {options.isPending && <LoadingState message="Loading editing options..." />}
              {options.isError && (
                <ErrorState
                  onRetry={() => {
                    void options.refetch();
                  }}
                >
                  Editing options could not be loaded.
                </ErrorState>
              )}
              {saveError && <Alert severity="error">{saveError}</Alert>}
              {options.data && !options.isError && (
                <SoftwareEditorFields
                  software={software}
                  options={options.data}
                  saving={saving}
                />
              )}
              <Typography
                role="status"
                variant="body2"
                color="text.secondary"
              >
                {saving ? 'Saving software...' : ''}
              </Typography>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end', p: 2.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                aria-disabled={saving}
                onClick={requestBack}
              >
                Back to software catalog
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!options.data || options.isError}
                aria-disabled={saving}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </CardActions>
          </Box>
        </FormProvider>
      </Card>
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
