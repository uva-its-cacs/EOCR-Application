import type { Software } from '../types';

import { useId, useState } from 'react';
import { FormProvider } from 'react-hook-form';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { useSoftwareEditor } from '../use-software-editor';
import { SoftwareEditorFields } from './software-editor-fields';

type Props = { software: Software; onClose: () => void; onSaved: () => void };

export function SoftwareEditorDrawer({ software, onClose, onSaved }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { methods, options, submit, saveError, saving } = useSoftwareEditor(software, onSaved);
  const dirty = methods.formState.isDirty;
  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={requestClose}
        transitionDuration={reducedMotion ? 0 : undefined}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': titleId,
            'aria-describedby': descriptionId,
            sx: { width: { xs: '100%', sm: 520 }, maxWidth: '100%', bgcolor: 'background.paper' },
          },
        }}
      >
        <Box sx={{ py: 2, pl: 2.5, pr: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              id={titleId}
              variant="h6"
              component="h2"
            >
              Edit software
            </Typography>
            <Typography
              id={descriptionId}
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {software.softwareName}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close software editor"
            aria-disabled={saving}
            onClick={requestClose}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
        <Divider />
        <FormProvider {...methods}>
          <Box
            component="form"
            noValidate
            onSubmit={submit}
            aria-busy={saving}
            sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
          >
            <Box sx={{ p: 2.5, flex: 1, overflowY: 'auto' }}>
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
              {saveError && (
                <Alert
                  severity="error"
                  sx={{ mb: 3 }}
                >
                  {saveError}
                </Alert>
              )}
              {options.data && !options.isError && (
                <SoftwareEditorFields
                  software={software}
                  options={options.data}
                  saving={saving}
                />
              )}
            </Box>
            <Divider />
            <Box
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1.5,
              }}
            >
              <Typography
                role="status"
                variant="body2"
                sx={{ mr: 'auto' }}
              >
                {saving ? 'Saving software...' : ''}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                aria-disabled={saving}
                onClick={requestClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!options.data || options.isError}
                aria-disabled={saving}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </Box>
          </Box>
        </FormProvider>
      </Drawer>
      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        content="Your changes to this software have not been saved."
        destructive
        confirmLabel="Discard changes"
        onClose={() => setConfirmDiscard(false)}
        onConfirm={onClose}
      />
    </>
  );
}
