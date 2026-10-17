import { useState, useCallback } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ErrorState } from 'src/components/feedback';

import { useUploadDevBlobs } from './use-dev-files';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  prefix: string;
  onClose: () => void;
};

// The template's "Add files" dialog (file-manager-create-folder-dialog.tsx), wired to the upload endpoint.
export function DevFilesUploadDialog({ open, prefix, onClose }: Props) {
  const [files, setFiles] = useState<(File | string)[]>([]);
  const upload = useUploadDevBlobs(prefix);

  const handleClose = () => {
    setFiles([]);
    upload.reset();
    onClose();
  };

  const handleDrop = useCallback((accepted: File[]) => {
    setFiles((current) => [...current, ...accepted]);
  }, []);

  const handleUpload = () => {
    const toSend = files.filter((file): file is File => file instanceof File);

    upload.mutate(toSend, {
      onSuccess: () => {
        toast.success(`Uploaded ${toSend.length} ${toSend.length === 1 ? 'file' : 'files'}.`);
        handleClose();
      },
    });
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <DialogTitle sx={[(theme) => ({ p: theme.spacing(3, 3, 2, 3) })]}>
        Upload files{prefix ? ` to ${prefix}` : ''}
      </DialogTitle>

      <IconButton
        aria-label="Close"
        onClick={handleClose}
        sx={{ top: 8, right: 8, position: 'absolute' }}
      >
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      <DialogContent
        dividers
        sx={{ pt: 1, pb: 2, border: 'none' }}
      >
        {upload.isError && <ErrorState sx={{ mb: 2 }}>{upload.error.message}</ErrorState>}

        <Upload
          multiple
          value={files}
          onDrop={handleDrop}
          onRemove={(file) => setFiles((current) => current.filter((f) => f !== file))}
        />
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          disabled={files.length === 0}
          loading={upload.isPending}
          loadingPosition="start"
          onClick={handleUpload}
        >
          Upload
        </Button>

        {files.length > 0 && (
          <Button
            variant="outlined"
            color="inherit"
            disabled={upload.isPending}
            onClick={() => setFiles([])}
          >
            Remove all
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
