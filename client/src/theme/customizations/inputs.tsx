import type { Theme, Components } from '@mui/material/styles'

export const inputsCustomizations: Components<Theme> = {
  MuiButtonBase: {
    defaultProps: { disableTouchRipple: true, disableRipple: true },
    styleOverrides: {
      root: ({ theme }) => ({
        boxSizing: 'border-box',
        '&:focus-visible': {
          outline: `3px solid ${theme.vars!.palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
      contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        color: theme.vars!.palette.text.secondary,
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      notchedOutline: ({ theme }) => ({
        borderColor: theme.vars!.palette.text.secondary,
      }),
    },
  },
  MuiSelect: {
    styleOverrides: {
      select: ({ theme }) => ({
        '&:focus-visible': {
          outline: `3px solid ${theme.vars!.palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
  },
}
