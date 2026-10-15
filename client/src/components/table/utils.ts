// ----------------------------------------------------------------------

export function rowInPage<T>(data: T[], page: number, rowsPerPage: number) {
  return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

// ----------------------------------------------------------------------

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

// EOCR: typed without `any`. Strings compare with localeCompare (case-insensitive), and empty values
// (null, undefined, '') sort last in both directions so "Not set" rows never lead the table.
type SortValue = string | number | null | undefined;

function isEmpty(value: SortValue) {
  return value === null || value === undefined || value === '';
}

function compareValues(a: SortValue, b: SortValue): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base', numeric: true });
}

export function getComparator<Row, Key extends keyof Row>(
  order: 'asc' | 'desc',
  orderBy: Key
): (a: Row, b: Row) => number {
  return (a, b) => {
    const aValue = a[orderBy] as SortValue;
    const bValue = b[orderBy] as SortValue;

    if (isEmpty(aValue) || isEmpty(bValue)) {
      return Number(isEmpty(aValue)) - Number(isEmpty(bValue));
    }

    const result = compareValues(aValue, bValue);
    return order === 'desc' ? -result : result;
  };
}
