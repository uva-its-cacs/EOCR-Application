import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { RequestTableFilters } from './types';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// The template's invoice-table-toolbar.tsx layout with the search field only (requests have no other
// filter yet). The search field has a visible label, not a placeholder alone.
type Props = {
  onResetPage: () => void;
  filters: UseSetStateReturn<RequestTableFilters>;
};

export function RequestTableToolbar({ filters, onResetPage }: Props) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      updateFilters({ name: event.target.value });
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
      <Box
        sx={{
          gap: 2,
          width: 1,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          label="Search requests"
          value={currentFilters.name}
          onChange={handleFilterName}
          placeholder="Search software or vendor..."
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
    </Box>
  );
}
