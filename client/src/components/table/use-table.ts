import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

// EOCR: row selection and the delete-page helpers are removed (tables have no checkbox selection).
export type UseTableReturn = {
  dense: boolean;
  page: number;
  rowsPerPage: number;
  order: 'asc' | 'desc';
  orderBy: string;
  /********/
  onResetPage: () => void;
  onSort: (id: string) => void;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /********/
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setDense: React.Dispatch<React.SetStateAction<boolean>>;
  setOrderBy: React.Dispatch<React.SetStateAction<string>>;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  setOrder: React.Dispatch<React.SetStateAction<'desc' | 'asc'>>;
};

export type UseTableProps = {
  defaultDense?: boolean;
  defaultOrderBy?: string;
  defaultRowsPerPage?: number;
  defaultCurrentPage?: number;
  defaultOrder?: 'asc' | 'desc';
};

export function useTable(props?: UseTableProps): UseTableReturn {
  const [dense, setDense] = useState(!!props?.defaultDense);

  const [page, setPage] = useState(props?.defaultCurrentPage ?? 0);

  const [orderBy, setOrderBy] = useState(props?.defaultOrderBy ?? 'name');

  const [rowsPerPage, setRowsPerPage] = useState(props?.defaultRowsPerPage ?? 5);

  const [order, setOrder] = useState<'asc' | 'desc'>(props?.defaultOrder ?? 'asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      if (id !== '') {
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(id);
      }
    },
    [order, orderBy]
  );

  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  }, []);

  const onChangeDense = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    dense,
    order,
    page,
    orderBy,
    rowsPerPage,
    /********/
    onSort,
    onChangePage,
    onChangeDense,
    onResetPage,
    onChangeRowsPerPage,
    /********/
    setPage,
    setDense,
    setOrder,
    setOrderBy,
    setRowsPerPage,
  };
}
