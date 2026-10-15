import type { Theme, SxProps, CSSObject } from '@mui/material/styles';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

// ----------------------------------------------------------------------

const visuallyHidden: CSSObject = {
  border: 0,
  padding: 0,
  width: '1px',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

export type TableHeadCellProps = {
  id: string;
  // EOCR: a node, so a column without visible text still names its header (VisuallyHidden).
  label?: React.ReactNode;
  width?: CSSObject['width'];
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sx?: SxProps<Theme>;
};

// EOCR: the select-all checkbox is removed (no row selection). A head cell with `sortable: false` (such
// as an actions column) renders its label without a sort button; `label` may be visually hidden text.
export type TableHeadCustomProps = {
  orderBy?: string;
  sx?: SxProps<Theme>;
  order?: 'asc' | 'desc';
  headCells: TableHeadCellProps[];
  onSort?: (id: string) => void;
};

export function TableHeadCustom({ sx, order, onSort, orderBy, headCells }: TableHeadCustomProps) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={[
              { width: headCell.width },
              ...(Array.isArray(headCell.sx) ? headCell.sx : [headCell.sx]),
            ]}
          >
            {onSort && headCell.sortable !== false ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onSort(headCell.id)}
              >
                {headCell.label}

                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
