import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { RequestTableFilters } from './types';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

// The template's invoice-table-filters-result.tsx with Status and Keyword blocks. Each chip also removes
// its filter on click or Enter, and is named for that (its delete icon is not focusable on its own).
type Props = FiltersResultProps & {
  onResetPage: () => void;
  filters: UseSetStateReturn<RequestTableFilters>;
  statusLabel?: string;
};

export function RequestTableFiltersResult({
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
