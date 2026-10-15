import type { Theme, SxProps } from '@mui/material/styles';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { EmptyContent } from '../empty-content';

// ----------------------------------------------------------------------

// EOCR: `title` and `description` are passed to EmptyContent (the template always shows "No data").
export type TableNoDataProps = {
  notFound: boolean;
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function TableNoData({ notFound, title, description, sx }: TableNoDataProps) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title={title}
            description={description}
            sx={[{ py: 10 }, ...(Array.isArray(sx) ? sx : [sx])]}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
