// EOCR color tokens. Plain data: no imports, no enums.
// These replace template palette values that fail WCAG 2.1 AA. The template's own files stay as shipped.
// Source of each value (template, ramp step, derived) and the measured ratios:
// docs/migration/theme-contrast.md. The contrast test (theme-contrast.test.ts) guards them.

export const eocrTokens = {
  light: {
    background: { default: '#F4F6F8', paper: '#FFFFFF' },
    primary: { main: '#007565', dark: '#004B50', contrastText: '#FFFFFF' },
    secondary: { main: '#8E33FF', dark: '#5119B7', contrastText: '#FFFFFF' },
    info: { main: '#006C9C', dark: '#003768', contrastText: '#FFFFFF' },
    success: { main: '#108150', dark: '#0D6740', contrastText: '#FFFFFF' },
    warning: { main: '#996700', dark: '#7A5200', contrastText: '#FFFFFF' },
    error: { main: '#B71D18', dark: '#7A0916', contrastText: '#FFFFFF' },
    textSecondary: '#454F5B',
    inputOutlined: '#637381',
    buttonOutlined: '#637381',
  },
  dark: {
    background: { default: '#141A21', paper: '#1C252E' },
    primary: { main: '#00AE74', dark: '#5BE49B', contrastText: '#1C252E' },
    secondary: { main: '#B67BFF', dark: '#EFD6FF', contrastText: '#1C252E' },
    info: { main: '#00B8D9', dark: '#61F3F3', contrastText: '#1C252E' },
    success: { main: '#22C55E', dark: '#77ED8B', contrastText: '#1C252E' },
    warning: { main: '#FFAB00', dark: '#FFD666', contrastText: '#1C252E' },
    error: { main: '#FF6744', dark: '#FFAC82', contrastText: '#1C252E' },
    textSecondary: '#C4CDD5',
    inputOutlined: '#919EAB',
    buttonOutlined: '#919EAB',
  },
};
