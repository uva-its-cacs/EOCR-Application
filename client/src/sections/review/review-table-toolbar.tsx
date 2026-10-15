import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { ReviewQueueFilters } from './types';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const ASSIGNMENT_LABELS: Record<ReviewQueueFilters['assignment'], string> = {
  all: 'Anyone',
  mine: 'Assigned to me',
  unassigned: 'Unassigned',
};

// The requests table toolbar (the template's invoice-table-toolbar.tsx layout) with an "Assigned" select
// beside the search field. Both have visible labels.
type Props = {
  onResetPage: () => void;
  filters: UseSetStateReturn<ReviewQueueFilters>;
};

export function ReviewTableToolbar({ filters, onResetPage }: Props) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterAssignment = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      updateFilters({ assignment: event.target.value as ReviewQueueFilters['assignment'] });
    },
    [onResetPage, updateFilters]
  );

  return (
    <Box
      sx={{
        p: 2.5,
        gap: 2,
        display: 'flex',
        pr: { xs: 2.5, md: 1 },
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-end', md: 'center' },
      }}
    >
      <TextField
        select
        label="Assigned"
        value={currentFilters.assignment}
        onChange={handleFilterAssignment}
        sx={{ width: { xs: 1, md: 220 }, flexShrink: 0 }}
      >
        {Object.entries(ASSIGNMENT_LABELS).map(([value, label]) => (
          <MenuItem
            key={value}
            value={value}
          >
            {label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="Search requests"
        value={currentFilters.name}
        onChange={handleFilterName}
        placeholder="Search software, vendor or requester..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled' }}
                />
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}
