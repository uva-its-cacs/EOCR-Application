import js from '@eslint/js'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Tell the rule that our <Label> component renders a label,
    // so every use of it is still checked for an associated control.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'jsx-a11y/label-has-associated-control': [
        'error',
        { labelComponents: ['Label'], assert: 'either' },
      ],
    },
  },
  {
    // The shadcn Label primitive only forwards props. The association
    // is made where it is used, so exempt just this one file.
    files: ['src/components/ui/label.tsx'],
    rules: {
      'jsx-a11y/label-has-associated-control': 'off',
    },
  },
    {
    // shadcn components export a component plus helpers (e.g. buttonVariants).
    // The rule only affects dev hot-reload, so exempt generated UI files.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },  
])