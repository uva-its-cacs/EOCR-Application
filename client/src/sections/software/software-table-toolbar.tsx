import type { SelectChangeEvent } from '@mui/material/Select';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { SoftwareTableFilters } from './types';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Adapted from the template's invoice-table-toolbar.tsx. The Service select becomes Category. The date
// pickers (@mui/x-date-pickers is not approved) and the Print/Import/Export menu (no such features) are
// removed. The search field has a visible label, not a placeholder alone.
type Props = {
  onResetPage: () => void;
  filters: UseSetStateReturn<SoftwareTableFilters>;
  options: {
    categories: string[];
  };
};

export function SoftwareTableToolbar({ filters, options, onResetPage }: Props) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterCategory = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      updateFilters({ category: newValue });
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
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 180 } }}>
        <InputLabel id="filter-category-label">Category</InputLabel>
        <Select
          multiple
          labelId="filter-category-label"
          label="Category"
          value={currentFilters.category}
          onChange={handleFilterCategory}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={{
            slotProps: { paper: { sx: { maxHeight: 240 } } },
          }}
        >
          {options.categories.map((option) => (
            <MenuItem
              key={option}
              value={option}
            >
              {/* The option itself carries the selected state (aria-selected); the box is visual. */}
              <Checkbox
                disableRipple
                size="small"
                tabIndex={-1}
                aria-hidden
                checked={currentFilters.category.includes(option)}
              />
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
          label="Search software"
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
