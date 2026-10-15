import type { SoftwareCatalogItem } from 'src/sections/software/types';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { formatDateOnly } from 'src/utils/format';

import { Iconify } from 'src/components/iconify';
import { StatusChip } from 'src/components/status-chip';
import { VisuallyHidden } from 'src/components/visually-hidden';
import { ErrorState, LoadingState } from 'src/components/feedback';

import { exceptionText } from 'src/sections/software/exception-text';
import { useSoftwareCatalog } from 'src/sections/software/use-software';

import { APPROVAL_STATUS_COLORS } from './status-colors';

// ----------------------------------------------------------------------

/**
 * Intake step 1, the workflow's "Historical cases" check: search the catalog for the software or vendor
 * and see each version's approval status before starting a review. "Request a review of <version>" links
 * the request to that catalog version; "Request a different version" prefills the product for a new
 * version (each version is reviewed on its own); "It's not listed" continues with an empty request. A
 * version approved under an EEAAP exception shows the exception's expiry, with the workflow's guidance:
 * within its time frame, submit your own request for an exception; expired, a new review is needed.
 */
type Props = {
  // `sameVersion`: review this catalog version (linked); otherwise a different version of the product.
  onChoose: (software: SoftwareCatalogItem | null, sameVersion: boolean) => void;
};

const MIN_SEARCH = 2;

export function RequestIntakeCatalogStep({ onChoose }: Props) {
  const catalog = useSoftwareCatalog(true);
  const [search, setSearch] = useState('');
  const term = search.trim().toLocaleLowerCase();

  const matches = useMemo(() => {
    if (term.length < MIN_SEARCH || !catalog.data) return [];
    return catalog.data.filter((row) =>
      [row.softwareName, row.vendorName, row.version].some((field) =>
        field.toLocaleLowerCase().includes(term)
      )
    );
  }, [catalog.data, term]);

  return (
    <Card sx={{ p: 3 }}>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', mb: 3 }}
      >
        Before you request a review, check whether the software is already in the catalog. Its
        approval may already cover your use.
      </Typography>

      <TextField
        fullWidth
        label="Software or vendor name"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Type at least two letters..."
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

      {catalog.isPending && (
        <Box sx={{ mt: 3 }}>
          <LoadingState message="Loading the software catalog..." />
        </Box>
      )}
      {catalog.isError && (
        <ErrorState
          onRetry={() => {
            void catalog.refetch();
          }}
          sx={{ mt: 3 }}
        >
          The software catalog could not be loaded. You can still start a new request.
        </ErrorState>
      )}

      <VisuallyHidden>
        <span role="status">
          {term.length >= MIN_SEARCH && catalog.data
            ? `${matches.length} ${matches.length === 1 ? 'match' : 'matches'} in the catalog`
            : ''}
        </span>
      </VisuallyHidden>

      {matches.length > 0 && (
        <Box
          component="ul"
          aria-label="Matching software"
          sx={{ listStyle: 'none', p: 0, m: 0, mt: 3, display: 'grid', gap: 2 }}
        >
          {matches.map((row) => (
            <Box
              component="li"
              key={row.softwareId}
              sx={(theme) => ({
                p: 2,
                gap: 2,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                borderRadius: 1.5,
                border: `dashed 1px ${theme.vars.palette.divider}`,
              })}
            >
              <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
                <Typography variant="subtitle2">
                  {row.softwareName} {row.version}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  {row.vendorName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  {guidanceFor(row)}
                </Typography>
              </Box>

              <Box
                sx={{ gap: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
              >
                <StatusChip
                  code={row.currentApprovalStatusCode}
                  label={row.currentApprovalStatusLabel}
                  colors={APPROVAL_STATUS_COLORS}
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                >
                  Expires: {formatDateOnly(row.approvalExpirationDate)}
                </Typography>
                {row.exceptionExpirationDate && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    {exceptionText(row)}
                  </Typography>
                )}
              </Box>

              <Box sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  aria-label={`Request a review of ${row.softwareName} ${row.version}`}
                  onClick={() => onChoose(row, true)}
                >
                  Request a review of {row.version}
                </Button>
                <Button
                  color="inherit"
                  aria-label={`Request a different version of ${row.softwareName}`}
                  onClick={() => onChoose(row, false)}
                >
                  Request a different version
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {term.length >= MIN_SEARCH && catalog.data && matches.length === 0 && (
        <Typography
          variant="body2"
          sx={{ mt: 3 }}
        >
          No software in the catalog matches “{search.trim()}”.
        </Typography>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => onChoose(null, false)}
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          It’s not listed: start a new request
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

// What the catalog entry means for the requester (the workflow's VPAT and exception decisions).
function guidanceFor(row: SoftwareCatalogItem): string {
  const today = new Date().toISOString().slice(0, 10);
  const expired =
    row.currentApprovalStatusCode === 'Expired' ||
    (!!row.approvalExpirationDate && row.approvalExpirationDate < today);

  if (row.exceptionExpirationDate) {
    return row.exceptionExpired
      ? `The exception (EEAAP) expired on ${formatDateOnly(row.exceptionExpirationDate)}. A new review is needed.`
      : 'Approved under an exception (EEAAP). An exception covers specific uses: submit your own request for an exception.';
  }

  if (expired) return 'The approval has expired. A new review is needed.';

  switch (row.currentApprovalStatusCode) {
    case 'Approved':
      return 'This version is approved. You may not need a request; another version needs its own review.';
    case 'ApprovedWithConditions':
      return 'Approved with conditions. Check that the conditions cover your use before requesting a review.';
    case 'Denied':
      return 'Not approved. A new review with an updated VPAT may be needed.';
    case 'UnderReview':
      return 'A review is already in progress.';
    default:
      return 'Not reviewed yet. You can request a review.';
  }
}
