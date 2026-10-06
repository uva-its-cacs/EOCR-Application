import { createTheme } from '@mui/material/styles'
import { systemFontStack } from './themePrimitives'
import { inputsCustomizations } from './customizations/inputs'
import { dataDisplayCustomizations } from './customizations/dataDisplay'
import { feedbackCustomizations } from './customizations/feedback'
import { navigationCustomizations } from './customizations/navigation'
import { surfacesCustomizations } from './customizations/surfaces'

// Dashboard template styling adapted for a system font and AA contrast.
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0059b3',
          light: '#e6f0ff',
          dark: '#00478f',
          contrastText: '#ffffff',
        },
        background: { default: '#fcfcfc', paper: '#ffffff' },
        DataGrid: { bg: '#ffffff', headerBg: '#f0f3f7', pinnedBg: '#ffffff' },
        text: { primary: '#101827', secondary: '#475569' },
        divider: '#dce0e6',
        action: { hover: '#f0f3f7', selected: '#e5e9ef' },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#9acbff',
          light: '#162b45',
          dark: '#bddcff',
          contrastText: '#101827',
        },
        background: { default: '#080b10', paper: '#10151e' },
        DataGrid: { bg: '#10151e', headerBg: '#1b2432', pinnedBg: '#10151e' },
        text: { primary: '#f1f5f9', secondary: '#aebacd' },
        divider: '#293343',
        action: { hover: '#1b2432', selected: '#252e3c' },
      },
    },
  },
  typography: {
    fontFamily: systemFontStack,
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.5 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.875rem' },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    ...inputsCustomizations,
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...surfacesCustomizations,
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        '*:focus-visible': {
          outline: `3px solid ${theme.vars!.palette.primary.main}`,
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      }),
    },
  },
})
