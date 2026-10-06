import type { Theme, Components } from '@mui/material/styles'

export const navigationCustomizations: Components<Theme> = {
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRight: `1px solid ${theme.vars!.palette.divider}`,
        backgroundColor: theme.vars!.palette.background.paper,
        boxShadow: 'none',
      }),
    },
  },
  MuiMenuItem: { styleOverrides: { root: { borderRadius: 8 } } },
  MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
}
