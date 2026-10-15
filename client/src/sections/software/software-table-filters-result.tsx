import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { SoftwareTableFilters } from './types';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

// Adapted from the template's invoice-table-filters-result.tsx (Service becomes Category, the date
// block is removed). Each chip also removes its filter on click or Enter, and is named for that, since
// the chip's delete icon is not focusable on its own.
type Props = FiltersResultProps & {
  onResetPage: () => void;
  filters: UseSetStateReturn<SoftwareTableFilters>;
  statusLabel?: string;
};

export function SoftwareTableFiltersResult({
  filters,
  totalResults,
  onResetPage,
  statusLabel,
  sx,
}: Props) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  const handleRemoveCategory = useCallback(
    (inputValue: string) => {
      const newValue = currentFilters.category.filter((item) => item !== inputValue);

      onResetPage();
      updateFilters({ category: newValue });
    },
    [onResetPage, updateFilters, currentFilters.category]
  );

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  return (
    <FiltersResult
      totalResults={totalResults}
      onReset={() => {
        onResetPage();
        resetFilters();
      }}
      sx={sx}
    >
      <FiltersBlock
        label="Category:"
        isShow={!!currentFilters.category.length}
      >
        {currentFilters.category.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={item}
            aria-label={`Remove category filter: ${item}`}
            onClick={() => handleRemoveCategory(item)}
            onDelete={() => handleRemoveCategory(item)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock
        label="Status:"
        isShow={currentFilters.status !== 'all'}
      >
        <Chip
          {...chipProps}
          label={statusLabel ?? currentFilters.status}
          aria-label={`Remove status filter: ${statusLabel ?? currentFilters.status}`}
          onClick={handleRemoveStatus}
          onDelete={handleRemoveStatus}
        />
      </FiltersBlock>

      <FiltersBlock
        label="Keyword:"
        isShow={!!currentFilters.name}
      >
        <Chip
          {...chipProps}
          label={currentFilters.name}
          aria-label={`Remove keyword filter: ${currentFilters.name}`}
          onClick={handleRemoveKeyword}
          onDelete={handleRemoveKeyword}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
