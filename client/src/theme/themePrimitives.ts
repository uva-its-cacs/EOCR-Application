// Color tokens adapted from MUI Dashboard template (MIT License).
// See THIRD_PARTY_NOTICES.md at repo root.
//
// Contrast notes (WCAG 2.1 AA, computed from hsl values):
//   brand[700] = hsl(210,100%,35%) = #0047b3 approx
//   brand[50]  = hsl(210,100%,95%) = #e6f0ff approx
//   brand[50] on brand[700]:  contrast ≈ 6.0:1  ✓ (AA large + small)
//   white on brand[700]:      contrast ≈ 7.6:1  ✓
//   brand[700] on white:      contrast ≈ 7.6:1  ✓  (links, text)
//   brand[700] on gray[50]:   contrast ≈ 7.3:1  ✓
//   text.warning = hsl(20,100%,30%) = #993300 approx on white ≈ 7.0:1 ✓
//   Non-text (focus ring, borders): brand[700] on white ≈ 7.6:1 ✓ (≥3:1 required)

export const brand = {
  50:  'hsl(210, 100%, 95%)',
  100: 'hsl(210, 100%, 85%)',
  200: 'hsl(210, 100%, 75%)',
  300: 'hsl(210, 100%, 60%)',
  400: 'hsl(210, 98%, 48%)',
  500: 'hsl(210, 98%, 42%)',
  600: 'hsl(210, 100%, 38%)',
  700: 'hsl(210, 100%, 35%)',
  800: 'hsl(210, 100%, 28%)',
  900: 'hsl(210, 100%, 22%)',
}

export const gray = {
  50:  'hsl(220, 35%, 97%)',
  100: 'hsl(220, 30%, 94%)',
  200: 'hsl(220, 20%, 88%)',
  300: 'hsl(220, 20%, 80%)',
  400: 'hsl(220, 20%, 65%)',
  500: 'hsl(220, 20%, 42%)',
  600: 'hsl(220, 20%, 35%)',
  700: 'hsl(220, 20%, 25%)',
  800: 'hsl(220, 30%,  6%)',
  900: 'hsl(220, 35%,  3%)',
}

export const green = {
  50:  'hsl(120, 80%, 98%)',
  200: 'hsl(120, 75%, 87%)',
  400: 'hsl(120, 61%, 50%)',
  500: 'hsl(120, 61%, 42%)',
  700: 'hsl(120, 61%, 30%)',
}

export const orange = {
  100: 'hsl(45, 90%, 88%)',
  400: 'hsl(45, 90%, 40%)',
  // orange[400] (~2.72:1) fails on white. Use orange[700] for text.
  700: 'hsl(20, 100%, 30%)',
}

export const red = {
  100: 'hsl(0, 100%, 96%)',
  300: 'hsl(0, 90%, 65%)',
  400: 'hsl(0, 90%, 45%)',
  500: 'hsl(0, 90%, 40%)',
  700: 'hsl(0, 90%, 30%)',
  900: 'hsl(0, 90%, 20%)',
}

export const systemFontStack = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(', ')
