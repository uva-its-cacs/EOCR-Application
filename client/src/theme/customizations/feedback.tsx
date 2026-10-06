import type { Theme, Components } from '@mui/material/styles'
import { brand } from '../themePrimitives'

export const feedbackCustomizations: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: 12 },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: brand[100],
      },
      bar: { backgroundColor: brand[700] },
    },
  },
}
