import type { Theme, Components } from '@mui/material/styles'
import type {} from '@mui/x-data-grid/themeAugmentation'

export const dataDisplayCustomizations: Components<Theme> = {
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 999, fontWeight: 600 },
      sizeSmall: { height: 22, fontSize: '0.75rem' },
      label: { paddingLeft: 8, paddingRight: 8 },
    },
  },
  MuiList: { styleOverrides: { root: { padding: 0 } } },
  MuiListItem: { styleOverrides: { root: { padding: 0 } } },
  MuiListItemText: { styleOverrides: { primary: { fontWeight: 500 } } },
  MuiDataGrid: {
    styleOverrides: {
      root: ({ theme }) => ({
        '--DataGrid-rowBorderColor': theme.vars!.palette.divider,
        backgroundColor: theme.vars!.palette.background.paper,
        border: `1px solid ${theme.vars!.palette.divider}`,
        borderRadius: 8,
        fontSize: theme.typography.body2.fontSize,
        '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600 },
        '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
          outline: `3px solid ${theme.vars!.palette.primary.main}`,
          outlineOffset: -3,
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: theme.vars!.palette.action.hover,
        },
        '& .MuiDataGrid-footerContainer': {
          backgroundColor: theme.vars!.palette.background.paper,
        },
      }),
    },
  },
}
