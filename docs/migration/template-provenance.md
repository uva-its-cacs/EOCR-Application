# Template provenance

Where files in `client/` come from. Template: Minimal UI `starter-vite-ts`, version v7.7.0. Source (outside the repo): `Minimal_TypeScript_v7.7.0/starter-vite-ts`.

| Our path | Template path | Template version | Status | Note |
| --- | --- | --- | --- | --- |
| `client/` (whole starter) | `starter-vite-ts/` | v7.7.0 | verbatim | Vendored in commit `vendor: Minimal starter-vite-ts v7.7.0 (unmodified)`. SHA-256 compared with the source: 673 files identical (excluding `node_modules`, `.env`, `.gitattributes`). `.vscode/settings.json` is not tracked because the starter's `.gitignore` ignores `.vscode`. |
| `client/vite.config.ts` | `vite.config.ts` | v7.7.0 | modified | Port 8081 changed to 5173 (server and preview); added `/api` proxy to `http://localhost:5246`. `host: true` removed from server and preview so the dev server listens on localhost only (Slice 3). |
| `client/package.json` | `package.json` | v7.7.0 | modified | Slice 4: removed `@fontsource-variable/dm-sans`, `@fontsource-variable/inter`, `@fontsource-variable/nunito-sans`, `@fontsource/barlow`; added `vitest` (5.0.3) and the `test` script. Slice 3: added `eslint-plugin-jsx-a11y` (devDependency), `lint` script now `eslint --max-warnings 0 ...`, `react-router` floor `^7.18.4`, `vite` floor `^8.0.16`. Removed `packageManager` and the `clean`, `re:dev`, `re:build`, `re:build-npm` scripts (yarn and `rm -rf`). |
| `client/.gitignore` | `.gitignore` | v7.7.0 | modified | Added `!.env.example` after `.env*`. |
| `client/src/global-config.ts` | `src/global-config.ts` | v7.7.0 | modified | `auth.skip` changed from `false` to `true` to bypass the auth guard until the strip slice. |
| `client/src/app.tsx` | `src/app.tsx` | v7.7.0 | modified | Removed `AuthProvider`, `SettingsProvider`, `SettingsDrawer`, `MotionLazy` and `ProgressBar`. Slice 4: passes `themeOverrides={eocrThemeOverrides}` to `ThemeProvider` (the one wiring edit for our theme). |
| `client/src/global-config.ts` | `src/global-config.ts` | v7.7.0 | modified | `appName` set to "EOCR". Removed `serverUrl` and the `auth`, `firebase`, `amplify`, `auth0`, `supabase` blocks (including the `skip` flag set in Slice 1) and the `paths` import. |
| `client/src/routes/paths.ts` | `src/routes/paths.ts` | v7.7.0 | modified | Reduced to `paths.dashboard.root`. |
| `client/src/routes/sections/index.tsx` | `src/routes/sections/index.tsx` | v7.7.0 | modified | Removed auth routes and the 404 page. `/` and `*` both redirect to `/dashboard` (temporary; Slice 9 builds the 404). |
| `client/src/routes/sections/dashboard.tsx` | `src/routes/sections/dashboard.tsx` | v7.7.0 | modified | Removed `AuthGuard`, the `CONFIG.auth.skip` branch and pages two to six. |
| `client/src/layouts/nav-config-dashboard.tsx` | `src/layouts/nav-config-dashboard.tsx` | v7.7.0 | modified | Reduced to one item ("One", `/dashboard`, icon `ic-dashboard`). |
| `client/src/layouts/dashboard/layout.tsx` | `src/layouts/dashboard/layout.tsx` | v7.7.0 | modified | Slice 3: `MenuButton` given `aria-label="Open navigation menu"` (jsx-a11y `control-has-associated-label`). Removed header widgets, horizontal nav, mocked user and role checks. Header keeps only the mobile `MenuButton`. Settings context removed: nav color `integrate`, nav layout `vertical`, no mini mode. |
| `client/src/layouts/dashboard/nav-vertical.tsx` | `src/layouts/dashboard/nav-vertical.tsx` | v7.7.0 | modified | Removed `NavToggleButton`, `onToggleNav`, `NavUpgrade`, and the mini variant (`isNavMini`, `NavSectionMini`). `Scrollbar` replaced by a plain `Box` with `overflowY: auto`. |
| `client/src/layouts/dashboard/nav-mobile.tsx` | `src/layouts/dashboard/nav-mobile.tsx` | v7.7.0 | modified | Removed `NavUpgrade`. `Scrollbar` replaced by a plain `Box` with `overflowY: auto`. |
| `client/src/theme/theme-provider.tsx` | `src/theme/theme-provider.tsx` | v7.7.0 | modified | Removed settings context and the `Rtl` wrapper. Keeps `defaultMode` and the mode storage key. |
| `client/src/theme/create-theme.ts` | `src/theme/create-theme.ts` | v7.7.0 | modified | Removed `settingsState` and `applySettingsTo*`; the theme is `baseTheme` plus overrides. With default settings the result is the same as before (typography already sets the primary font). |
| `client/src/layouts/dashboard/css-vars.ts` | `src/layouts/dashboard/css-vars.ts` | v7.7.0 | modified | `SettingsState` types replaced by local `NavColor` and `NavLayout` types. |
| `client/src/layouts/dashboard/content.tsx` | `src/layouts/dashboard/content.tsx` | v7.7.0 | modified | Removed settings context: `compactLayout` fixed at its shipped default (`true`), horizontal-nav padding removed. |
| `client/src/global.css` | `src/global.css` | v7.7.0 | modified | Slice 4: removed the Barlow, DM Sans, Inter and Nunito Sans font imports (Public Sans only). Removed the `@import` of the scrollbar styles (the component was removed). The now-empty "Plugins" comment block is left as shipped. |
| `client/src/components/loading-screen/index.ts` | `src/components/loading-screen/index.ts` | v7.7.0 | modified | Barrel no longer exports `splash-screen`. |
| `client/src/components/nav-section/index.ts` | `src/components/nav-section/index.ts` | v7.7.0 | modified | Barrel no longer exports `mini` and `horizontal`. `styles/` still contains the mini and horizontal css-vars and class names, unchanged. |
| `client/src/theme/core/components/index.ts` | `src/theme/core/components/index.ts` | v7.7.0 | modified | Removed the `timeline`, `treeView` and `datePicker` imports and spreads. |
| `client/src/theme/core/components/text-field.tsx` | `src/theme/core/components/text-field.tsx` | v7.7.0 | modified | `PickerTextFieldOwnerState` (from `@mui/x-date-pickers`) replaced by the local type `Partial<InputBaseProps> & { inputSize?: FilledInputProps['size'] }` for `InputSizeProps.ownerState`. The `Pickers*InputVariants` aliases (which referenced `MuiPickers*` theme keys) removed; the `satisfies` clauses use the plain MUI variant types. The `picker` input context and `inputSize` checks are unchanged (now unused). |
| `client/src/theme/extend-theme-types.d.ts` | `src/theme/extend-theme-types.d.ts` | v7.7.0 | modified | Removed the `@mui/lab`, `@mui/x-tree-view` and `@mui/x-date-pickers` theme augmentation imports. |
| `client/src/routes/hooks/use-router.ts` | `src/routes/hooks/use-router.ts` | v7.7.0 | modified | Removed the `NProgress.start()` calls (and the `isEqualPath` guard around them and its import). The doc comment still says "NProgress integration" (not changed). |
| `client/src/components/hook-form/index.ts` | `src/components/hook-form/index.ts` | v7.7.0 | modified | Removed the `rhf-date-picker` export. |
| `client/src/components/hook-form/fields.tsx` | `src/components/hook-form/fields.tsx` | v7.7.0 | modified | Removed `DatePicker`, `TimePicker` and `DateTimePicker` from `Field`. |
| `client/src/components/hook-form/schema-utils.ts` | `src/components/hook-form/schema-utils.ts` | v7.7.0 | modified | Removed `schemaUtils.date` and the `dayjs` import. |
| `client/package.json` | `package.json` | v7.7.0 | modified | Identity: `name` is `eocr-client`, `author` and `description` updated. Also removed the dependencies `axios`, `nprogress`, `simplebar-react`, `framer-motion`, `@mui/lab`, `@mui/x-date-pickers`, `@mui/x-tree-view`, `dayjs`, `autosuggest-highlight`, `@emotion/cache`, `@mui/stylis-plugin-rtl`, `stylis` and the types for `nprogress`, `autosuggest-highlight`, `stylis`. |
| `client/package-lock.json` | `package-lock.json` | v7.7.0 | modified | Updated by `npm uninstall` for the removed packages; package `name` changed to `eocr-client`. Slice 4: updated for the font removals and `vitest`. Slice 3: updated for `eslint-plugin-jsx-a11y`, `react-router` 7.18.4, and in-range security updates to dev tooling (vite 8.0.16 and others); `npm audit` reports 0. |
| `client/index.html` | `index.html` | v7.7.0 | modified | Title set to "EOCR". |
| `client/eslint.config.mjs` | `eslint.config.mjs` | v7.7.0 | modified | Slice 4: removed the `control-has-associated-label` file override (it suppressed nothing, and the rule now applies to the Slice 7 files). Slice 3: appended our own blocks at the end (template blocks unchanged, including `react/jsx-key: 0`): jsx-a11y recommended rules as errors with a component mapping (`Button`, `IconButton`, `MenuButton` to `button`; `Link`, `RouterLink` to `a`) and `control-has-associated-label`; `react/jsx-key`, `no-explicit-any` and the react-hooks compiler rules as errors; file-scoped overrides (see below). Added the `eslint-plugin-jsx-a11y` import. |
| `client/prettier.config.mjs` | `prettier.config.mjs` | v7.7.0 | modified | Slice 3: added an `overrides` entry with `singleAttributePerLine: true` for `src/sections/**` and `src/pages/**`, excluding the vendored `src/pages/dashboard/one.tsx` and `src/sections/blank/view.tsx`. Template options unchanged. |
| `client/src/routes/components/router-link.tsx` | `src/routes/components/router-link.tsx` | v7.7.0 | modified | Slice 3: `children` destructured and passed explicitly to `Link` (jsx-a11y `anchor-has-content` cannot see children forwarded through `...other`). No behavior change. |
| `client/src/theme/eocr-tokens.ts` | n/a | n/a | ours-only | Slice 4: AA color tokens (plain data) for both schemes. |
| `client/src/theme/eocr-overrides.ts` | n/a | n/a | ours-only | Slice 4: `themeOverrides` for the template's `createTheme`: palette tokens (with regenerated channels), Public Sans for headings, focus ring and reduced-motion CSS. |
| `client/src/theme/theme-contrast.test.ts` | n/a | n/a | ours-only | Slice 4: WCAG contrast guard for the real theme. |
| `client/vitest.config.ts` | n/a | n/a | ours-only | Slice 4: vitest config (our `src/` alias, no `vite-plugin-checker`). |
| `docs/migration/theme-contrast.md` | n/a | n/a | ours-only | Slice 4: ratio table, token sources, known failures. |
| `client/yarn.lock` | `yarn.lock` | v7.7.0 | deleted | npm is the package manager. `package-lock.json` is unchanged (`npm ci` succeeded). |
| `client/.env.example` | n/a | n/a | ours-only | Only `VITE_ASSETS_DIR` (the one variable still read, by `global-config.ts`), empty. |
| `client/.gitattributes` | n/a | n/a | ours-only | Line-ending rules, committed before the vendor commit. |

## Removed groups

Removed with `git rm`; the files stay available in the vendor commit `bd436d9`.

| Group | Paths | Removed in |
| --- | --- | --- |
| Auth and mock demo layer | `src/auth/**`, `src/routes/sections/auth.tsx`, `src/pages/auth/**`, `src/layouts/auth-split/**`, `src/layouts/simple/**`, `src/layouts/components/{sign-in-button,sign-out-button}.tsx`, `src/lib/axios.ts`, `src/_mock/**`, `src/pages/dashboard/{two..six}`, `src/layouts/nav-config-{account,workspace}.tsx`, `src/pages/error/**`, `src/sections/error/**` | Slice 2 (a+b) |
| Header widgets and nav extras | `src/layouts/components/{account-*,language-popover,contacts-popover,workspaces-popover,notifications-drawer,searchbar,settings-button,nav-toggle-button,nav-upgrade}`, `src/layouts/dashboard/nav-horizontal.tsx` | Slice 2 (a+b) |
| Settings and RTL | `src/components/settings/**`, `src/theme/with-settings/**` | Slice 2 (c) |
| Animation, progress bar, scrollbar and unused components | `src/components/{animate,progress-bar,scrollbar,file-thumbnail,flag-icon,search-not-found}/**`, `src/components/loading-screen/splash-screen.tsx`, `src/components/nav-section/{mini,horizontal}/**` | Slice 2 (d) |

Kept but unused until later slices: `src/components/custom-popover/**` (Slice 7) and `src/components/hook-form/**` (Slice 10).
| Unapproved-package theme and form hooks | `src/theme/core/components/{mui-x-date-picker,mui-x-tree-view,timeline}.tsx`, `src/components/hook-form/rhf-date-picker.tsx`, `src/utils/format-time.ts` | Slice 2 (e) |
| Demo assets | `src/assets/**` (25 files: countries data, icon and illustration components), `public/assets/**` except `icons/navbar/ic-dashboard.svg` (images, video, backgrounds, illustrations, other icon sets), `public/fonts/Roboto-*.ttf`. 321 files, about 7.7 MB. | Slice 2 (f) |

Kept from `public/`: `favicon.ico`, `logo/*` (4 files, only the two SVGs are referenced), `assets/icons/navbar/ic-dashboard.svg` (the one nav item).

## ESLint overrides (eslint.config.mjs)

File-scoped exceptions for template files that violate the rules we enabled (Slice 3). A template file ported later that trips these rules is added here in its own `vendor:` commit.

| Files | Rule turned off | Removed in |
| --- | --- | --- |
| `src/components/custom-popover/custom-popover.tsx` | `react-hooks/refs` | Slice 7 |
| `src/components/custom-popover/hooks.ts` | `react-hooks/set-state-in-effect` | Slice 7 |
| `src/components/hook-form/form-provider.tsx`, `src/components/hook-form/rhf-autocomplete.tsx` | `@typescript-eslint/no-explicit-any` | Slice 10 |
| `src/components/nav-section/utils/create-nav-item.ts` | `@typescript-eslint/no-explicit-any` | Slice 7 |
| `src/routes/components/error-boundary.tsx` | `@typescript-eslint/no-explicit-any` | Slice 9 |

The `control-has-associated-label` override for the Slice 7 files was removed in Slice 4 (it suppressed nothing).
