import type { DevBlobItem } from '../types';

import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page-header';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { DevFilesCard } from '../dev-files-card';
import { DevFilesPathDialog } from '../dev-files-path-dialog';
import { DevFilesUploadDialog } from '../dev-files-upload-dialog';
import {
  useDevBlobs,
  useMoveDevBlob,
  useDeleteDevBlob,
  useCreateDevFolder,
} from '../use-dev-files';

// ----------------------------------------------------------------------

function joinPath(prefix: string, name: string) {
  return prefix ? `${prefix}/${name}` : name;
}

// Dev-only proof of concept: the template's file manager (grid view) over Azure Blob Storage. The current
// folder lives in the URL (?path=a/b). Not the real document flow.
export function DevFilesView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefix = searchParams.get('path') ?? '';
  const segments = prefix ? prefix.split('/') : [];

  const listing = useDevBlobs(prefix);
  const createFolder = useCreateDevFolder();
  const moveBlob = useMoveDevBlob();
  const deleteBlob = useDeleteDevBlob();

  const uploadDialog = useBoolean();
  const folderDialog = useBoolean();
  const [moving, setMoving] = useState<DevBlobItem | null>(null);
  const [deleting, setDeleting] = useState<DevBlobItem | null>(null);

  const openFolder = (path: string) => setSearchParams(path ? { path } : {});

  const items = [...(listing.data?.items ?? [])].sort(
    (a, b) => Number(b.isFolder) - Number(a.isFolder) || a.name.localeCompare(b.name)
  );

  const renderBreadcrumbs = () => (
    <Breadcrumbs
      aria-label="Folder path"
      sx={{ mb: 3 }}
    >
      {segments.length === 0 ? (
        <Typography color="text.primary">Container root</Typography>
      ) : (
        <Button
          size="small"
          onClick={() => openFolder('')}
        >
          Container root
        </Button>
      )}

      {segments.map((segment, index) => {
        const path = segments.slice(0, index + 1).join('/');

        return index === segments.length - 1 ? (
          <Typography
            key={path}
            color="text.primary"
            aria-current="page"
          >
            {segment}
          </Typography>
        ) : (
          <Button
            key={path}
            size="small"
            onClick={() => openFolder(path)}
          >
            {segment}
          </Button>
        );
      })}
    </Breadcrumbs>
  );

  const renderContent = () => {
    if (listing.isPending) return <LoadingState message="Loading files" />;

    if (listing.isError) {
      return <ErrorState onRetry={() => listing.refetch()}>{listing.error.message}</ErrorState>;
    }

    if (items.length === 0) {
      return (
        <EmptyContent
          filled
          title="This folder is empty"
          description="Upload files or create a folder."
          slotProps={{ title: { component: 'p' } }}
          sx={{ py: 10 }}
        />
      );
    }

    return (
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          gap: 3,
          display: 'grid',
          listStyle: 'none',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
        }}
      >
        {items.map((item) => (
          <li key={item.path}>
            <DevFilesCard
              item={item}
              onOpenFolder={openFolder}
              onMove={() => {
                moveBlob.reset();
                setMoving(item);
              }}
              onDelete={() => setDeleting(item)}
            />
          </li>
        ))}
      </Box>
    );
  };

  return (
    <>
      <DashboardContent>
        <PageHeader
          title="Dev file manager"
          description="Development only: a proof of concept for storing documents in Azure Blob Storage."
          actions={
            <Box sx={{ gap: 1.5, display: 'flex' }}>
              <Button
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => {
                  createFolder.reset();
                  folderDialog.onTrue();
                }}
              >
                New folder
              </Button>
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                onClick={uploadDialog.onTrue}
              >
                Upload
              </Button>
            </Box>
          }
        />

        <Alert
          severity="info"
          sx={{ mb: 3 }}
        >
          This page and its endpoints exist in Development only and will not ship.
        </Alert>

        {renderBreadcrumbs()}
        {renderContent()}
      </DashboardContent>

      <DevFilesUploadDialog
        open={uploadDialog.value}
        prefix={prefix}
        onClose={uploadDialog.onFalse}
      />

      <DevFilesPathDialog
        key={`folder-${folderDialog.value}`}
        open={folderDialog.value}
        title="New folder"
        label="Folder name"
        helperText={prefix ? `Created inside ${prefix}.` : 'Created at the container root.'}
        initialValue=""
        submitLabel="Create"
        pending={createFolder.isPending}
        error={createFolder.error?.message}
        onClose={folderDialog.onFalse}
        onSubmit={(name) =>
          createFolder.mutate(joinPath(prefix, name), {
            onSuccess: () => {
              toast.success('Folder created.');
              folderDialog.onFalse();
            },
          })
        }
      />

      <DevFilesPathDialog
        key={`move-${moving?.path ?? ''}`}
        open={!!moving}
        title={moving ? `Move or rename ${moving.name}` : 'Move or rename'}
        label="New path"
        helperText="Full path from the container root, for example reports/2026/vpat.pdf."
        initialValue={moving?.path ?? ''}
        submitLabel="Move"
        pending={moveBlob.isPending}
        error={moveBlob.error?.message}
        onClose={() => setMoving(null)}
        onSubmit={(toPath) => {
          if (!moving) return;

          moveBlob.mutate(
            { item: moving, toPath },
            {
              onSuccess: () => {
                toast.success('Moved.');
                setMoving(null);
              },
            }
          );
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        destructive
        title="Delete"
        content={
          deleting?.isFolder
            ? `Delete the folder "${deleting.name}" and everything in it?`
            : `Delete "${deleting?.name}"?`
        }
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;

          deleteBlob.mutate(deleting, {
            onSuccess: () => toast.success('Deleted.'),
            onError: (error) => toast.error(error.message, { duration: Infinity }),
            onSettled: () => setDeleting(null),
          });
        }}
      />
    </>
  );
}
