import type { SoftwareCatalogItem } from './types';

import { formatDateOnly } from 'src/utils/format';

// ----------------------------------------------------------------------

// A catalog version's EEAAP exception, in words ("until" or "expired" and the date).
export function exceptionText(
  row: Pick<SoftwareCatalogItem, 'exceptionExpirationDate' | 'exceptionExpired'>
): string {
  const date = formatDateOnly(row.exceptionExpirationDate);
  return row.exceptionExpired
    ? `Exception (EEAAP) expired ${date}`
    : `Exception (EEAAP) until ${date}`;
}
