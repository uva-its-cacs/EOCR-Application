import type { DevBlobItem } from './types';
import type { FileItemProps } from './file-item-slots';

import { usePopover } from 'minimal-shared/hooks';

import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';

import { fData } from 'src/utils/format-number';
import { formatDateTime } from 'src/utils/format';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

import { devBlobDownloadUrl } from './api';
import { FileItem, FileItemIcon, FileItemInfo, FileItemActions } from './file-item-slots';

// ----------------------------------------------------------------------

type Props = FileItemProps & {
  item: DevBlobItem;
  onOpenFolder: (path: string) => void;
  onMove: () => void;
  onDelete: () => void;
};

// The template's folder and file cards in one: a folder opens, a file downloads.
export function DevFilesCard({ item, onOpenFolder, onMove, onDelete, ...other }: Props) {
  const menu = usePopover();

  const details = item.isFolder
    ? ['Folder']
    : [fData(item.size), item.modifiedAt ? formatDateTime(item.modifiedAt) : ''].filter(Boolean);

  return (
    <>
      <FileItem
        variant="outlined"
        {...other}
      >
        <FileItemIcon
          id={item.path}
          fileType={item.isFolder ? undefined : item.name}
        />

        <FileItemInfo
          type={item.isFolder ? 'folder' : 'file'}
          title={
            item.isFolder ? (
              <ButtonBase
                disableRipple
                onClick={() => onOpenFolder(item.path)}
                sx={{
                  textAlign: 'left',
                  typography: 'inherit',
                  fontWeight: 'inherit',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {item.name}
              </ButtonBase>
            ) : (
              item.name
            )
          }
          values={details}
        />

        <FileItemActions
          label={item.name}
          openMenu={menu.open}
          onOpenMenu={menu.onOpen}
        />
      </FileItem>

      <CustomPopover
        open={menu.open}
        anchorEl={menu.anchorEl}
        onClose={menu.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          {item.isFolder ? (
            <MenuItem
              onClick={() => {
                menu.onClose();
                onOpenFolder(item.path);
              }}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" />
              Open
            </MenuItem>
          ) : (
            <MenuItem
              component="a"
              href={devBlobDownloadUrl(item.path)}
              download={item.name}
              onClick={menu.onClose}
            >
              <Iconify icon="eva:cloud-download-fill" />
              Download
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              menu.onClose();
              onMove();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Move or rename
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              menu.onClose();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
