# Template provenance

Where files in `client/` come from. Template: Minimal UI `starter-vite-ts`, version v7.7.0. Source (outside the repo): `Minimal_TypeScript_v7.7.0/starter-vite-ts`. Files ported from the full demo (`Minimal_TypeScript_v7.7.0/vite-ts`, also outside the repo) are marked as such: the starter's vendor commit is not their baseline, their own `vendor:` commit is.

| Our path | Template path | Template version | Status | Note |
| --- | --- | --- | --- | --- |
| `client/` (whole starter) | `starter-vite-ts/` | v7.7.0 | verbatim | Vendored in commit `vendor: Minimal starter-vite-ts v7.7.0 (unmodified)`. SHA-256 compared with the source: 673 files identical (excluding `node_modules`, `.env`, `.gitattributes`). `.vscode/settings.json` is not tracked because the starter's `.gitignore` ignores `.vscode`. |
| `client/vite.config.ts` | `vite.config.ts` | v7.7.0 | modified | Port 8081 changed to 5173 (server and preview); added `/api` proxy to `http://localhost:5246`. `host: true` removed from server and preview so the dev server listens on localhost only (Slice 3). |
| `client/package.json` | `package.json` | v7.7.0 | modified | `@fontsource/barlow` (`^5.2.8`) added back. Slice 4: removed `@fontsource-variable/dm-sans`, `@fontsource-variable/inter`, `@fontsource-variable/nunito-sans`, `@fontsource/barlow`; added `vitest` (5.0.3) and the `test` script. Slice 3: added `eslint-plugin-jsx-a11y` (devDependency), `lint` script now `eslint --max-warnings 0 ...`, `react-router` floor `^7.18.4`, `vite` floor `^8.0.16`. Removed `packageManager` and the `clean`, `re:dev`, `re:build`, `re:build-npm` scripts (yarn and `rm -rf`). Slice 6: added `@tanstack/react-query` (`^5.104.1`). Slice 8: added the devDependencies `@testing-library/react` (`^16.3.3`), `@testing-library/dom` (`^10.4.2`) and `jsdom` (`^30.1.2`). Slice 9: `jsdom` pinned to exactly `30.1.1`, a release older than 14 days. |
| `client/.gitignore` | `.gitignore` | v7.7.0 | modified | Added `!.env.example` after `.env*`. |
| `client/src/global-config.ts` | `src/global-config.ts` | v7.7.0 | modified | `auth.skip` changed from `false` to `true` to bypass the auth guard until the strip slice. |
| `client/src/app.tsx` | `src/app.tsx` | v7.7.0 | modified | Removed `AuthProvider`, `SettingsProvider`, `SettingsDrawer`, `MotionLazy` and `ProgressBar`. Slice 4: passes `themeOverrides={eocrThemeOverrides}` to `ThemeProvider` (the one wiring edit for our theme). Slice 6: `children` wrapped in `QueryClientProvider` (`src/lib/query-client.ts`). |
| `client/src/global-config.ts` | `src/global-config.ts` | v7.7.0 | modified | `appName` set to "EOCR". Removed `serverUrl` and the `auth`, `firebase`, `amplify`, `auth0`, `supabase` blocks (including the `skip` flag set in Slice 1) and the `paths` import. |
| `client/src/routes/paths.ts` | `src/routes/paths.ts` | v7.7.0 | modified | Reduced to `paths.dashboard.root`. Slice 6: `dashboard` replaced by `requests.root` (`/`), `requests.new` (`/requests/new`) and `admin.software` (`/admin/software`). No other use of `paths.dashboard` or `/dashboard` existed in `src/` (checked: `global-config.ts`, the error boundary and the nav files). |
| `client/src/routes/sections/index.tsx` | `src/routes/sections/index.tsx` | v7.7.0 | modified | Removed auth routes and the 404 page. `/` and `*` both redirect to `/dashboard` (temporary; Slice 9 builds the 404). Slice 6: uses `eocrRoutes` (`routes/sections/eocr.tsx`); `/` is now the My requests page and `*` redirects to `/`. Slice 9: the `*` redirect (and the `Navigate` and `paths` imports) removed; `*` is the not-found page inside `eocrRoutes`. |
| `client/src/layouts/nav-config-dashboard.tsx` | `src/layouts/nav-config-dashboard.tsx` | v7.7.0 | removed | Removed in Slice 7 (replaced by `src/layouts/eocr/` and `src/components/eocr-nav/`). An upgrade of the template will show this file as deleted by us. |
| `client/src/layouts/dashboard/layout.tsx` | `src/layouts/dashboard/layout.tsx` | v7.7.0 | removed | Removed in Slice 7 (replaced by `src/layouts/eocr/` and `src/components/eocr-nav/`). An upgrade of the template will show this file as deleted by us. |
| `client/src/layouts/dashboard/nav-vertical.tsx` | `src/layouts/dashboard/nav-vertical.tsx` | v7.7.0 | removed | Removed in Slice 7 (replaced by `src/layouts/eocr/` and `src/components/eocr-nav/`). An upgrade of the template will show this file as deleted by us. |
| `client/src/layouts/dashboard/nav-mobile.tsx` | `src/layouts/dashboard/nav-mobile.tsx` | v7.7.0 | removed | Removed in Slice 7 (replaced by `src/layouts/eocr/` and `src/components/eocr-nav/`). An upgrade of the template will show this file as deleted by us. |
| `client/src/theme/theme-provider.tsx` | `src/theme/theme-provider.tsx` | v7.7.0 | modified | Removed settings context and the `Rtl` wrapper. Keeps `defaultMode` and the mode storage key. |
| `client/src/theme/create-theme.ts` | `src/theme/create-theme.ts` | v7.7.0 | modified | Removed `settingsState` and `applySettingsTo*`; the theme is `baseTheme` plus overrides. With default settings the result is the same as before (typography already sets the primary font). |
| `client/src/layouts/dashboard/css-vars.ts` | `src/layouts/dashboard/css-vars.ts` | v7.7.0 | modified | `SettingsState` types replaced by local `NavColor` and `NavLayout` types. |
| `client/src/layouts/dashboard/content.tsx` | `src/layouts/dashboard/content.tsx` | v7.7.0 | modified | Removed settings context: `compactLayout` fixed at its shipped default (`true`), horizontal-nav padding removed. |
| `client/src/global.css` | `src/global.css` | v7.7.0 | modified | Barlow restored for headings: only the 700 and 800 weights (used by `h1` to `h3`). Slice 4: removed the Barlow, DM Sans, Inter and Nunito Sans font imports; DM Sans, Inter and Nunito Sans stay removed. Removed the `@import` of the scrollbar styles (the component was removed). The now-empty "Plugins" comment block is left as shipped. |
| `client/src/components/loading-screen/index.ts` | `src/components/loading-screen/index.ts` | v7.7.0 | modified | Barrel no longer exports `splash-screen`. |
| `client/src/components/nav-section/index.ts` | `src/components/nav-section/index.ts` | v7.7.0 | modified | Slice 7: exports `./styles` only (the nav tokens our nav and `layouts/dashboard/css-vars.ts` use); `vertical`, `components`, `utils` and `types` were removed. |
| `client/src/theme/core/components/index.ts` | `src/theme/core/components/index.ts` | v7.7.0 | modified | Removed the `timeline`, `treeView` and `datePicker` imports and spreads. |
| `client/src/theme/core/components/text-field.tsx` | `src/theme/core/components/text-field.tsx` | v7.7.0 | modified | `PickerTextFieldOwnerState` (from `@mui/x-date-pickers`) replaced by the local type `Partial<InputBaseProps> & { inputSize?: FilledInputProps['size'] }` for `InputSizeProps.ownerState`. The `Pickers*InputVariants` aliases (which referenced `MuiPickers*` theme keys) removed; the `satisfies` clauses use the plain MUI variant types. The `picker` input context and `inputSize` checks are unchanged (now unused). |
| `client/src/theme/extend-theme-types.d.ts` | `src/theme/extend-theme-types.d.ts` | v7.7.0 | modified | Removed the `@mui/lab`, `@mui/x-tree-view` and `@mui/x-date-pickers` theme augmentation imports. |
| `client/src/routes/hooks/use-router.ts` | `src/routes/hooks/use-router.ts` | v7.7.0 | modified | Removed the `NProgress.start()` calls (and the `isEqualPath` guard around them and its import). The doc comment still says "NProgress integration" (not changed). |
| `client/src/components/hook-form/index.ts` | `src/components/hook-form/index.ts` | v7.7.0 | modified | Removed the `rhf-date-picker` export. |
| `client/src/components/hook-form/fields.tsx` | `src/components/hook-form/fields.tsx` | v7.7.0 | modified | Removed `DatePicker`, `TimePicker` and `DateTimePicker` from `Field`. |
| `client/src/components/hook-form/schema-utils.ts` | `src/components/hook-form/schema-utils.ts` | v7.7.0 | modified | Removed `schemaUtils.date` and the `dayjs` import. |
| `client/package.json` | `package.json` | v7.7.0 | modified | Identity: `name` is `eocr-client`, `author` and `description` updated. Also removed the dependencies `axios`, `nprogress`, `simplebar-react`, `framer-motion`, `@mui/lab`, `@mui/x-date-pickers`, `@mui/x-tree-view`, `dayjs`, `autosuggest-highlight`, `@emotion/cache`, `@mui/stylis-plugin-rtl`, `stylis` and the types for `nprogress`, `autosuggest-highlight`, `stylis`. |
| `client/package-lock.json` | `package-lock.json` | v7.7.0 | modified | Updated by `npm uninstall` for the removed packages; package `name` changed to `eocr-client`. Slice 4: updated for the font removals and `vitest`. Slice 3: updated for `eslint-plugin-jsx-a11y`, `react-router` 7.18.4, and in-range security updates to dev tooling (vite 8.0.16 and others); `npm audit` reports 0. Slice 6: `@tanstack/react-query`. Slice 8: Testing Library and jsdom (47 packages, no install scripts, `npm audit` 0). Slice 9: jsdom 30.1.1. |
| `client/index.html` | `index.html` | v7.7.0 | modified | Title set to "EOCR". |
| `client/eslint.config.mjs` | `eslint.config.mjs` | v7.7.0 | modified | Slice 4: removed the `control-has-associated-label` file override (it suppressed nothing, and the rule now applies to the Slice 7 files). Slice 3: appended our own blocks at the end (template blocks unchanged, including `react/jsx-key: 0`): jsx-a11y recommended rules as errors with a component mapping (`Button`, `IconButton`, `MenuButton` to `button`; `Link`, `RouterLink` to `a`) and `control-has-associated-label`; `react/jsx-key`, `no-explicit-any` and the react-hooks compiler rules as errors; file-scoped overrides (see below). Added the `eslint-plugin-jsx-a11y` import. |
| `client/prettier.config.mjs` | `prettier.config.mjs` | v7.7.0 | modified | Slice 3: added an `overrides` entry with `singleAttributePerLine: true` for `src/sections/**` and `src/pages/**`, excluding the vendored `src/pages/dashboard/one.tsx` and `src/sections/blank/view.tsx`. Template options unchanged. Both excluded files were removed (Slices 6 and 8), and Slice 9 removed the `excludeFiles` entry. |
| `client/src/routes/components/router-link.tsx` | `src/routes/components/router-link.tsx` | v7.7.0 | modified | Slice 3: `children` destructured and passed explicitly to `Link` (jsx-a11y `anchor-has-content` cannot see children forwarded through `...other`). No behavior change. |
| `client/src/theme/eocr-tokens.ts` | n/a | n/a | ours-only | Slice 4: AA color tokens (plain data) for both schemes. |
| `client/src/theme/eocr-overrides.ts` | n/a | n/a | ours-only | Slice 4: `themeOverrides` for the template's `createTheme`: palette tokens (with regenerated channels), focus ring and reduced-motion CSS. Slice 5: `mixins` and component overrides from `eocr-components.ts`, soft hover opacity 0.24, and focus rules for DataGrid, Menu and List items, Checkbox, Radio, Switch and inline Links. The Public Sans heading override was added in Slice 4 and removed again with the Barlow restore, so headings use the template's secondary font (Barlow). |
| `client/src/theme/theme-contrast.test.ts` | n/a | n/a | ours-only | Slice 4: WCAG contrast guard for the real theme. Slice 8: default (grey) soft Label pairs. |
| `client/vitest.config.ts` | n/a | n/a | ours-only | Slice 4: vitest config (our `src/` alias, no `vite-plugin-checker`). Slice 8: `include` also matches `.test.tsx`; the default environment stays `node` and component tests opt in to jsdom per file. |
| `docs/migration/theme-contrast.md` | n/a | n/a | ours-only | Slice 4: ratio table, token sources, known failures. |
| `client/src/theme/eocr-components.ts` | n/a | n/a | ours-only | Slice 5: component overrides composed with the template's (`extend()`): field placeholder and label colors, Link, Breadcrumbs, Button, Chip, Avatar, and the `softStyles` mixin override. No template file is edited. |
| `client/src/theme/theme-composition.test.ts` | n/a | n/a | ours-only | Slice 5: proves the template's styles survive composition, and guards each fix and the focus-ring rules. |
| `client/src/routes/components/index.ts` | `src/routes/components/index.ts` | v7.7.0 | modified | Slice 6: the barrel also exports `require-admin`. Slice 9: exports `eocr-error-boundary` instead of `error-boundary`. |
| `client/src/main.tsx` | `src/main.tsx` | v7.7.0 | modified | Slice 9: imports `EocrErrorBoundary` and uses it as the root `errorElement` (two lines; nothing else changed). |
| `client/src/routes/components/error-boundary.tsx` | `src/routes/components/error-boundary.tsx` | v7.7.0 | removed | Slice 9 (`git rm`): replaced by `eocr-error-boundary.tsx`. It rendered stack traces and used undefined font variables. Deleted by us on upgrade. |
| `client/src/routes/components/eocr-error-boundary.tsx`, `route-error-message.ts` | n/a | n/a | ours-only | Slice 9: the route error page (own ThemeProvider, `main#main-content`, one focused h1, Reload, link home, no stack trace; the message is shown in development only) and its message helper, with tests. |
| `client/src/pages/not-found.tsx` | n/a | n/a | ours-only | Slice 9: the 404 page inside the layout (`*` route). |
| `client/src/components/stat-card/` | n/a | n/a | ours-only | Slice 9: `StatCard` and `StatCardGroup` (the old dashboard's card, rewritten as one named `dl`), with tests. |
| `client/src/components/data-grid/` | n/a | n/a | ours-only | Slice 9: `EocrDataGrid` and its empty and loading overlays. |
| `client/src/components/page-header/focus-page-heading.ts` | n/a | n/a | ours-only | Slice 9: moves focus to the page h1 after a successful Retry. |
| `client/src/sections/requests/use-my-requests.ts`, `client/src/sections/requests/view/`, `client/src/sections/software/view/` | n/a | n/a | ours-only | Slice 9: the request and software views, grids and toolbar (based on the mui-template pages, see below), with tests. `status-groups.ts` gains `countByGroup`. |
| `client/src/test/render-view.tsx` | n/a | n/a | ours-only | Slice 9: view test helper (QueryClient, data router, fetch mock). |
| `client/src/routes/components/require-admin.tsx` | n/a | n/a | ours-only | Slice 6: route guard for admin pages (three views: not signed in, no access, could not check). Slice 8: the views use `PageHeader` (and `ErrorState` for the failed check); loading uses `PageLoading`. |
| `client/src/routes/sections/eocr.tsx` | n/a | n/a | ours-only | Slice 6: our route table (`/`, `/requests/new`, `/admin/software`) inside the template's `DashboardLayout`, with `handle.crumb`. Slice 8: `handle.parent` on New request (breadcrumb trail), `PageLoading` as the Suspense fallback. |
| `client/src/components/custom-dialog/index.ts` | `vite-ts/src/components/custom-dialog/index.ts` (full demo) | v7.7.0 | verbatim | Slice 8: vendored from the **full `vite-ts` demo**, not the starter, in commit `4d6a6c3` (`vendor: custom-dialog (ConfirmDialog) from Minimal vite-ts v7.7.0 (unmodified)`; SHA-256 identical to the source). That commit, not the starter vendor commit, is the upgrade baseline for the three custom-dialog files. |
| `client/src/components/custom-dialog/confirm-dialog.tsx` | `vite-ts/src/components/custom-dialog/confirm-dialog.tsx` (full demo) | v7.7.0 | modified | Slice 8, baseline `4d6a6c3`: `aria-labelledby` (title) and `aria-describedby` (content, when given) through `useId`. The free-form `action` node is replaced by a dialog-owned confirm button (`confirmLabel`, `onConfirm`, `confirmDisabled`, `destructive`) so the dialog controls initial focus: Cancel for destructive dialogs, the confirm button otherwise (set by a callback ref, since jsx-a11y forbids `autoFocus`). Stray space before the content removed. |
| `client/src/components/custom-dialog/types.ts` | `vite-ts/src/components/custom-dialog/types.ts` (full demo) | v7.7.0 | modified | Slice 8, baseline `4d6a6c3`: `action` removed; `confirmLabel`, `onConfirm`, `confirmDisabled`, `destructive` added; `onClose` omitted from `DialogProps` before it is redefined. |
| `client/src/components/page-header/` | n/a | n/a | ours-only | Slice 8 (ported from mui-template, see below): `PageHeader` (the page's `h1`, styled as the template's `h4`, `tabIndex -1`; `<title>` "title - EOCR"; breadcrumbs from route handles when the trail has more than one crumb; actions; description) and its tests. |
| `client/src/components/feedback/` | n/a | n/a | ours-only | Slice 8 (ported from mui-template, see below): `LoadingState` (polite status, hidden spinner), `ErrorState` (Alert with optional Retry), `EmptyState`, and tests (including `PageLoading`). |
| `client/src/components/page-loading/` | n/a | n/a | ours-only | Slice 8: `PageLoading` wraps the unchanged template `LoadingScreen`: the progress bar is named "Loading" through its `slotsProps`, and a visually hidden status says "Loading page". |
| `client/src/components/status-chip/` | n/a | n/a | ours-only | Slice 8: `StatusChip` on the template `Label` (soft, label text always shown, no `aria-label`, the default chip pins `text.primary`) and tests. |
| `client/src/sections/requests/status-colors.ts` | n/a | n/a | ours-only | Slice 8: Label color per `RequestStatus` and `ApprovalStatus` code, with a `default` fallback for unknown codes. |
| `client/src/test/render-with-theme.tsx` | n/a | n/a | ours-only | Slice 8: test helpers that render inside the app theme, optionally with a memory router. |
| `client/src/pages/requests/list.tsx`, `client/src/pages/requests/new.tsx`, `client/src/pages/admin/software.tsx` | n/a | n/a | ours-only | Slice 6: placeholder pages. Slice 8: they render `PageHeader` (one `h1`, document title, breadcrumbs) instead of the template `BlankView`, which is removed. |
| `client/src/layouts/dashboard/index.ts` | `src/layouts/dashboard/index.ts` | v7.7.0 | modified | Slice 7: no longer exports `./layout` (removed); still exports `./content`. |
| `client/index.html` | `index.html` | v7.7.0 | modified | Slice 7: inline no-flash color scheme script (the exact output of MUI `InitColorSchemeScript` for our config, guarded by `src/theme/color-scheme-script.test.ts`; a strict CSP needs a nonce or hash for it); favicon link changed to `/favicon.svg`. |
| `client/public/assets/icons/navbar/ic-file.svg`, `ic-blank.svg`, `ic-course.svg` | `public/assets/icons/navbar/` | v7.7.0 | verbatim | Slice 7: vendored nav icons (commit `vendor: nav icons from Minimal v7.7.0 (unmodified)`). |
| `client/src/components/eocr-nav/` | n/a | n/a | ours-only | Slice 7: primary nav (`primary-nav.tsx`, `nav-item.tsx`), nav data and pure role filtering and active matching (`nav-data.ts`), `use-nav-groups.ts`, tests. Uses the template's nav tokens from `nav-section/styles`. |
| `client/src/layouts/eocr/` | n/a | n/a | ours-only | Slice 7: the shell (`layout.tsx` composed from `layouts/core`), `skip-link.tsx`, `nav-sidebar.tsx`, `nav-drawer.tsx`, `wordmark.tsx`, `color-mode-toggle.tsx`, `account-menu.tsx`, `use-route-focus.ts` and `route-focus.ts` (with tests). |
| `client/src/theme/color-scheme-script.test.ts` | n/a | n/a | ours-only | Slice 7: guards the inline script in `index.html` against MUI's `InitColorSchemeScript`. |
| `client/public/favicon.svg` | n/a | n/a | ours-only | Slice 7: placeholder favicon (the letter E). Real branding is still needed. |
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
| Dashboard demo routes and page | `src/routes/sections/dashboard.tsx`, `src/pages/dashboard/one.tsx` | Slice 6 (replaced by `routes/sections/eocr.tsx` and the three placeholder pages; `src/sections/blank/view.tsx` stayed and was reused unchanged until Slice 8) |
| Blank placeholder view | `src/sections/blank/view.tsx` | Slice 8 (the placeholder pages use `PageHeader`; nothing else used it). Deleted by us on upgrade. |
| Template dashboard layout and nav | `src/layouts/dashboard/{layout,nav-vertical,nav-mobile}.tsx`, `src/layouts/nav-config-dashboard.tsx`, `src/components/nav-section/{vertical,components,utils}/**`, `src/components/nav-section/types.ts`, `public/assets/icons/navbar/ic-dashboard.svg` | Slice 7 (replaced by our own files). An upgrade of the template will show these as deleted by us. |
| Custom popover | `src/components/custom-popover/**` | Slice 7 (the account menu uses MUI `Popover`). Deleted by us on upgrade. |
| Minimal logo and favicon | `src/components/logo/**`, `public/logo/*`, `public/favicon.ico` | Slice 7 (replaced by the "EOCR Application" wordmark and a placeholder favicon; real branding needed). Deleted by us on upgrade. |

Kept from `public/`: `favicon.ico`, `logo/*` (4 files, only the two SVGs are referenced), `assets/icons/navbar/ic-dashboard.svg` (the one nav item).

## ESLint overrides (eslint.config.mjs)

File-scoped exceptions for template files that violate the rules we enabled (Slice 3). A template file ported later that trips these rules is added here in its own `vendor:` commit.

| Files | Rule turned off | Removed in |
| --- | --- | --- |
| `src/components/hook-form/form-provider.tsx`, `src/components/hook-form/rhf-autocomplete.tsx` | `@typescript-eslint/no-explicit-any` | Slice 10 |

The `control-has-associated-label` override for the Slice 7 files was removed in Slice 4 (it suppressed nothing). Slice 9 removed the `error-boundary.tsx` override with the file.

## Ported from mui-template (our own code, not template code)

Read with `git show mui-template:client/src/<path>`. They are ours, so they are not `vendor:` commits. Adapted to the current structure (kebab-case, `src/` imports, template ESLint and Prettier rules).

| Our path | Source path | Changes |
| --- | --- | --- |
| `src/lib/api.ts` | `lib/api.ts` | Rewritten: `ApiError` (status and ProblemDetails), 204 handling, network failure as status 0, abort rethrown as is. |
| `src/lib/query-client.ts` | `lib/query-client.ts` | As is. |
| `src/sections/auth/types.ts` | `sections/auth/types.ts` | `MeDto` corrected to the server (`userId`, was `id`); added `ADMIN_ROLE_CODE`. |
| `src/sections/auth/use-current-user.ts` | `sections/auth/use-current-user.ts` | Typed result (`loading`, `authenticated`, `unauthenticated`, `error`), `refetch`, no retries, 10 minute `staleTime`. |
| `src/sections/requests/api.ts`, `types.ts` | `sections/requests/api.ts`, `types.ts` | As is. |
| `src/sections/requests/status-groups.ts` | `sections/requests/status-groups.ts` | Added `getStatusGroup` and `UNKNOWN_STATUS_GROUP`; existing exports unchanged. |
| `src/sections/software/api.ts`, `use-software.ts` | `sections/software/api.ts`, `use-software.ts` | As is. |
| `src/sections/software/types.ts` | `sections/software/types.ts` | `SoftwareDraft` and `SoftwareFieldErrors` left out (only the editor, rewritten in Slice 10, uses them). |
| `src/utils/format.ts` | `utils/format.ts` | As is. |
| `src/routes/route-handle.ts` | `routes/route-handle.ts` | `useMatches` imported from `react-router` (not `react-router-dom`). Slice 8: `parent` in the handle, plus `crumbsFromMatches` and `useCrumbs` for breadcrumbs (with tests). |
| `src/components/visually-hidden/visually-hidden.tsx` | `components/visually-hidden.tsx` | Slice 8: moved into its own folder with a barrel; code unchanged. Slice 9: optional `component` and `id` props. |
| `src/sections/requests/view/my-requests-view.tsx`, `requests-grid.tsx` | `pages/dashboard-page.tsx` | Slice 9: split into a view and a grid; the query moved to `useMyRequests`; StatCard moved to `components/stat-card` (em dash while loading instead of 0); title "My requests" (was "My Requests"); Retry added to the error; EmptyState, StatusChip and EocrDataGrid. |
| `src/sections/requests/view/new-request-view.tsx` | `pages/new-request-page.tsx` | Slice 9: title "New request"; the "←" glyph dropped from "Back to My requests". |
| `src/sections/software/view/software-view.tsx`, `software-grid.tsx`, `software-grid-toolbar.tsx` | `pages/software-page.tsx`, `sections/software/components/software-grid.tsx`, `software-grid-toolbar.tsx` | Slice 9: read only (no Edit column, editor or dialog until Slice 10); admin checks left to RequireAdmin; Refresh uses `aria-disabled` and `aria-busy` with a polite status; StatusChip instead of an outlined Chip; the toolbar buttons have visible text ("Columns", "Filters") with the grid's own icon slots instead of `@mui/icons-material` icons and tooltips. |
| `src/components/page-header/page-header.tsx` | `components/page-header.tsx` | Slice 8: the title is set by a React 19 `<title>` element (was `document.title` in an effect), suffix " - EOCR" (was an em dash); breadcrumbs and `description` added; `flushTop` removed. |
| `src/components/feedback/loading-state.tsx` | `components/loading-state.tsx` | Slice 8: as is apart from formatting, a comment and `aria-hidden` as a boolean. |
| `src/components/feedback/error-state.tsx` | `components/error-state.tsx` | Slice 8: the free-form `action` replaced by `onRetry` (renders a Retry button). |
| `src/components/feedback/empty-state.tsx` | `components/empty-state.tsx` | Slice 8: rewritten with `title`, `description` and `action` (was a single paragraph). |

Not ported: `use-software-editor.ts` (Slice 10) and every UI component, page, layout and theme file, except the shared components listed above (Slice 8). `form-select-field.tsx` waits for Slice 10.

Slice 7 removed the overrides for `custom-popover/custom-popover.tsx`, `custom-popover/hooks.ts` and `nav-section/utils/create-nav-item.ts` (the files are gone). The `hook-form` and `error-boundary` overrides stay.

Note (Slice 6): the template `LoadingScreen` progress bar had no accessible name. Fixed in Slice 8 by `PageLoading`, without editing the template file.
