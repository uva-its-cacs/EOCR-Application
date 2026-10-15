import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { ReviewQueueFilters } from './types';
import type { FiltersResultProps } from 'src/components/filters-result';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

import { ASSIGNMENT_LABELS } from './review-table-toolbar';

// ----------------------------------------------------------------------

// As the requests table's filter chips (the template's invoice-table-filters-result.tsx), with Status,
// Assigned and Keyword blocks. Each chip removes its filter on click or Enter and is named for that.
type Props = FiltersResultProps & {
  onResetPage: () => void;
  filters: UseSetStateReturn<ReviewQueueFilters>;
  statusLabel?: string;
};

export function ReviewTableFiltersResult({
  filters,
  totalResults,
  onResetPage,
  statusLabel,
  sx,
}: Props) {
  const { state: currentFilters, setState: updateFilters, resetState: resetFilters } = filters;

  const removeKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  const removeStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  const removeAssignment = useCallback(() => {
    onResetPage();
    updateFilters({ assignment: 'all' });
  }, [onResetPage, updateFilters]);

  const assignmentLabel = ASSIGNMENT_LABELS[currentFilters.assignment];

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
          onClick={removeStatus}
          onDelete={removeStatus}
        />
      </FiltersBlock>

      <FiltersBlock
        label="Assigned:"
        isShow={currentFilters.assignment !== 'all'}
      >
        <Chip
          {...chipProps}
          label={assignmentLabel}
          aria-label={`Remove assigned filter: ${assignmentLabel}`}
          onClick={removeAssignment}
          onDelete={removeAssignment}
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
          onClick={removeKeyword}
          onDelete={removeKeyword}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
