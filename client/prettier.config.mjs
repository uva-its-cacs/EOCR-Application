/**
 * @type {import("prettier").Config}
 * Need to restart IDE when changing configuration
 * Open the command palette (Ctrl + Shift + P) and execute the command > Reload Window.
 */
const config = {
  semi: true,
  tabWidth: 2,
  endOfLine: 'lf',
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'es5',
  // EOCR: our own code uses one attribute per line. Vendored template files keep the
  // template's formatting so they stay diffable (list them in excludeFiles).
  overrides: [
    {
      files: ['src/sections/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}'],
      options: { singleAttributePerLine: true },
    },
  ],
};

export default config;
