import type { SoftwareCatalogItem } from './types';

import { useId } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { formatTime, formatDateOnly, formatDateTime } from 'src/utils/format';

import { Iconify } from 'src/components/iconify';
import { StatusChip } from 'src/components/status-chip';
import { CustomPopover } from 'src/components/custom-popover';

import { APPROVAL_STATUS_COLORS } from 'src/sections/requests/status-colors';

import { exceptionText } from './exception-text';

// ----------------------------------------------------------------------

// Adapted from the template's invoice-table-row.tsx. There is no checkbox (no row selection) and no
// View or Delete action (no details page or delete endpoint). The status uses StatusChip, secondary
// text uses text.secondary (text.disabled is below 4.5:1), and the menu button is named per row.
type Props = {
  row: SoftwareCatalogItem;
  // Present only for admins; without it the row has no actions cell.
  editHref?: string;
};

const NOT_SET = 'Not set';

export function SoftwareTableRow({ row, editHref }: Props) {
  const menuActions = usePopover();
  const menuId = useId();

  const renderMenuActions = (href: string) => (
    <CustomPopover
      id={menuId}
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      // As MUI's Menu does: the list focuses its first item, so the popover must not move focus to its
      // paper afterwards (keyboard users would land on the paper, not on Edit).
      disableAutoFocus
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList
        autoFocusItem={menuActions.open}
        aria-label={`Actions for ${row.softwareName}`}
      >
        <MenuItem
          component={RouterLink}
          href={href}
          onClick={menuActions.onClose}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar aria-hidden>{row.softwareName.charAt(0).toUpperCase()}</Avatar>

            <ListItemText
              primary={row.softwareName}
              secondary={row.vendorName}
              slotProps={{
                primary: { noWrap: true, sx: { typography: 'body2' } },
                secondary: { sx: { color: 'text.secondary' } },
              }}
            />
          </Box>
        </TableCell>

        <TableCell>{row.version}</TableCell>

        <TableCell>{row.softwareCategoryLabel ?? NOT_SET}</TableCell>

        <TableCell>{row.accessibilityRiskLabel ?? NOT_SET}</TableCell>

        <TableCell>
          <ListItemText
            primary={formatDateTime(row.createdAt)}
            secondary={formatTime(row.createdAt)}
            slotProps={{
              primary: { noWrap: true, sx: { typography: 'body2' } },
              secondary: { sx: { mt: 0.5, typography: 'caption' } },
            }}
          />
        </TableCell>

        <TableCell>
          {row.approvalExpirationDate ? (
            <time dateTime={row.approvalExpirationDate}>
              {formatDateOnly(row.approvalExpirationDate)}
            </time>
          ) : (
            NOT_SET
          )}
        </TableCell>

        <TableCell>
          <StatusChip
            code={row.currentApprovalStatusCode}
            label={row.currentApprovalStatusLabel}
            colors={APPROVAL_STATUS_COLORS}
          />
          {row.exceptionExpirationDate && (
            <Box
              component="span"
              sx={{ display: 'block', mt: 0.5, typography: 'caption', color: 'text.secondary' }}
            >
              {exceptionText(row)}
            </Box>
          )}
        </TableCell>

        {editHref && (
          <TableCell
            align="right"
            sx={{ px: 1 }}
          >
            <IconButton
              aria-label={`Actions for ${row.softwareName}`}
              aria-haspopup="menu"
              aria-expanded={menuActions.open}
              aria-controls={menuActions.open ? menuId : undefined}
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>

      {editHref && renderMenuActions(editHref)}
    </>
  );
}
