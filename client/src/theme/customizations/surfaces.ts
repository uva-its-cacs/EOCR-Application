import type { Theme, Components } from '@mui/material/styles'

export const surfacesCustomizations: Components<Theme> = {
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        border: `1px solid ${theme.vars!.palette.divider}`,
        boxShadow: 'none',
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: { padding: 16, '&:last-child': { paddingBottom: 16 } },
    },
  },
  MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
}
