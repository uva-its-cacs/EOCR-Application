# Template provenance

Where files in `client/` come from. Template: Minimal UI `starter-vite-ts`, version v7.7.0. Source (outside the repo): `Minimal_TypeScript_v7.7.0/starter-vite-ts`. Files ported from the full demo (`Minimal_TypeScript_v7.7.0/vite-ts`, also outside the repo) are marked as such: the starter's vendor commit is not their baseline, their own `vendor:` commit is.

| Our path | Template path | Template version | Status | Note |
| --- | --- | --- | --- | --- |
| `client/` (whole starter) | `starter-vite-ts/` | v7.7.0 | verbatim | Vendored in commit `vendor: Minimal starter-vite-ts v7.7.0 (unmodified)`. SHA-256 compared with the source: 673 files identical (excluding `node_modules`, `.env`, `.gitattributes`). `.vscode/settings.json` is not tracked because the starter's `.gitignore` ignores `.vscode`. |
| `client/vite.config.ts` | `vite.config.ts` | v7.7.0 | modified | Port 8081 changed to 5173 (server and preview); added `/api` proxy to `http://localhost:5246`. Port and proxy target now read Aspire's injected `PORT` and `services__api__https__0` / `services__api__http__0` (fallbacks 5173 and 5246); proxy uses `secure: false` for the local dev certificate. `host: true` removed from server and preview so the dev server listens on localhost only (Slice 3). |
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

## Restored template navigation (2026-10-09)

The actual `NavSectionVertical` replaces the EOCR-built menu. These files are restored from `starter-vite-ts/src/components/nav-section/` in the purchased v7.7.0 source. Their existing starter vendor baseline (`bd436d9`), rather than the full-demo source, remains their provenance. No full-demo modules or new packages were copied, and no commits were created.

- Restored unchanged: `types.ts`, `vertical/index.ts`, `components/nav-collapse.tsx`, `components/nav-elements.tsx`, `utils/index.ts`.
- Restored/adapted `vertical/nav-section-vertical.tsx`: collapsible Overview/Management sections with accessible list names, real header buttons, expanded state and persistent controls IDs. Collapsed content is inert and unmounted; reduced motion skips collapse transitions. Parent items still use the template's nested navigation.
- Restored/adapted `vertical/nav-list.tsx`: complete effect dependencies without an inline lint suppression; parent disclosure state and controls IDs.
- Restored/adapted `vertical/nav-item.tsx`: leaf `aria-current`, no redundant title aria-label, disabled state forwarded to ButtonBase.
- Restored/adapted `utils/create-nav-item.ts`: `unknown` replaces `any`; parent items use real buttons rather than divs.
- Restored/adapted `components/nav-subheader.tsx`: doubled specificity preserves the shipped 11px typography/colors against MUI ListSubheader defaults. Native buttons reveal the template chevron on hover or keyboard focus and retain the visible focus ring.
- Adapted barrels: `components/index.ts` exports only vertical dependencies (no dropdown); `index.ts` exports vertical navigation, styles, and types. Mini/horizontal navigation and popover dependencies remain removed.
- EOCR `PrimaryNav` now only maps existing filtered data/icons to the template and reports link activation to the drawer. The custom EOCR nav-item/nav-group implementations were removed. Existing role filtering remains in `useNavGroups` and `nav-data`.
- Sidebar and drawer content use scoped dark color-scheme variables in both page modes. `--layout-nav-bg` is template grey 900 in both modes. Focus CSS targets the restored template item class.

This restoration supersedes the earlier rows describing vertical navigation/components/utils/types as removed. The commercially licensed starter remains the source; the repository must remain private.
## Software drawer editing (2026-10-13)

Software administration now edits existing rows in `src/sections/software/view/software-editor-drawer.tsx`. The purchased starter's `components/settings/drawer/settings-drawer.tsx` is a layout reference for the right anchor, header/close control, padded scrolling body and paper surface. The software drawer is an EOCR component using the existing MUI Drawer: no settings module, context, theme controls, Scrollbar dependency or demo code was restored. Its form is 520px on desktop and full width on small screens, with fixed Save/Cancel actions, native scrolling and reduced-motion support.

Adapted shared starter fields:

- `src/components/hook-form/rhf-text-field.tsx`: stable input/helper IDs, controller ref passed through `inputRef`, blur forwarded, explicit invalid state, and no forced `autoComplete="new-password"`. The caller chooses autocomplete appropriate to the field.
- `src/components/hook-form/rhf-select.tsx` (`RHFSelect`): stable select/label IDs, controller input ref, helper/error description on the actual combobox, and invalid state. The unused multi-select implementation remains unchanged.

The form uses existing react-hook-form, Zod and TanStack Query packages and the existing admin update/options endpoints. Current inactive selections are preserved. Client and server validation, stale-update conflicts and loss of administrator access retain the user's edits. Successful saves update and invalidate the software list. Dirty drawer dismissal requires the existing destructive ConfirmDialog; closing or saving restores row focus (or the page heading if the row disappeared). No server, authorization, palette or package changes were needed.
## Catalog list and shell matched to the template (2026-10-15)

The software catalog and the app shell now follow the full demo's invoice section and dashboard layout. Each file below was copied unmodified from `Minimal_TypeScript_v7.7.0/vite-ts` (commit `38b94b3`, "moving template stuff"; note that this commit also contains the earlier catalog merge, so it is not vendor-only) and then adapted. This section supersedes the "Removed groups" rows for `custom-popover`, `logo`, `nav-toggle-button` and `nav-section/mini`, and the dark-sidebar note under "Restored template navigation".

| Our path | Template path (`vite-ts/`) | Status | Changes |
| --- | --- | --- | --- |
| `client/src/components/table/{index,use-table,utils,table-head-custom,table-no-data}.ts(x)` | `src/components/table/*` | modified | No row selection: select-all checkbox, `selected` state and the delete-page helpers removed. `getComparator` typed without `any`; strings use `localeCompare`; empty values sort last. Head cells take a `ReactNode` label and `sortable: false`. `TableNoData` passes `title`/`description` to `EmptyContent`. |
| `client/src/components/table/{table-empty-rows,table-pagination-custom}.tsx` | same | verbatim | |
| `client/src/components/table/{table-selected-action,table-skeleton}.tsx` | same | removed | No selection; no skeleton use. |
| `client/src/components/empty-content/*` | `src/components/empty-content/*` | modified | Title and description use `text.secondary` (template `text.disabled` is below 4.5:1); the image is decorative (`alt=""`). |
| `client/public/assets/icons/empty/ic-content.svg` | `public/assets/icons/empty/ic-content.svg` | verbatim | |
| `client/src/components/filters-result/*` | `src/components/filters-result/*` | verbatim | |
| `client/src/components/custom-popover/{custom-popover,hooks}.ts(x)` | `src/components/custom-popover/*` | modified | React compiler lint fixes: the paper element is held in state (callback ref) instead of reading a ref during render; `useElementRect` no longer calls `setState` synchronously in its effect (ResizeObserver's initial report measures); the inline `eslint-disable consistent-return` replaced by `return undefined`. |
| `client/src/components/custom-popover/{index,styles,types,utils}.ts(x)` | same | verbatim | |
| `client/src/components/logo/logo.tsx` | `src/components/logo/logo.tsx` | modified | Minimal artwork replaced by a placeholder EOCR mark (check in a rounded square, plus "EOCR" text in the full variant); SVGs `aria-hidden`; link named "EOCR home". Real branding still needed. |
| `client/src/components/logo/{classes,index}.ts` | same | verbatim | |
| `client/src/layouts/components/nav-toggle-button.tsx` | `src/layouts/components/nav-toggle-button.tsx` | verbatim | The caller passes `aria-label`, `aria-expanded` and `aria-controls`. |
| `client/src/components/nav-section/mini/nav-item.tsx` | `src/components/nav-section/mini/nav-item.tsx` | modified | As the vertical item: leaf `aria-current="page"`, no redundant `aria-label`, `disabled` forwarded to ButtonBase. |
| `client/src/components/nav-section/mini/nav-list.tsx` | same | modified | The hover-only `NavDropdown` popover (not reachable by keyboard or touch) removed; leaf links only. EOCR nav has no child items. |
| `client/src/components/nav-section/mini/{index,nav-section-mini}.tsx` | same | verbatim | |
| `client/src/components/nav-section/components/nav-dropdown.tsx` | same | removed | Only used by the mini dropdown. |
| `client/src/components/nav-section/index.ts` | `src/components/nav-section/index.ts` | modified | Exports `mini`, `styles`, `vertical` and types. |
| `client/src/components/analytic-summary/analytic-summary.tsx` (was `sections/software/software-analytic.tsx`) | `src/sections/invoice/invoice-analytic.tsx` | modified | Count and percent of the catalog instead of an invoice total; ring and icon `aria-hidden`; title is an `h3`; count in `text.secondary`. |
| `client/src/sections/software/view/software-list-view.tsx` | `src/sections/invoice/view/invoice-list-view.tsx` | modified | API rows instead of `_mock`; tabs per approval status found in the rows; filters name/category/status; no selection, bulk actions, Delete or date filters; native scrolling regions (focusable, named) replace `Scrollbar`; `PageHeader` replaces `CustomBreadcrumbs`; a polite result-count status; loading row; actions column only with `editHref` (admins). |
| `client/src/sections/software/software-table-row.tsx` | `src/sections/invoice/invoice-table-row.tsx` | modified | No checkbox; cells for software/vendor, category, risk, added (date and time), expires, `StatusChip`; the kebab (named "Actions for {name}", `aria-haspopup`, `aria-expanded`) opens `CustomPopover` with an Edit link only. |
| `client/src/sections/software/software-table-toolbar.tsx` | `src/sections/invoice/invoice-table-toolbar.tsx` | modified | Service becomes Category (options from the rows); date pickers and the Print/Import/Export menu removed; the search field has a visible label; option checkboxes are decorative. |
| `client/src/sections/software/software-table-filters-result.tsx` | `src/sections/invoice/invoice-table-filters-result.tsx` | modified | Category/Status/Keyword blocks; chips removable by click or Enter and named "Remove … filter: …"; Clear also resets the page. |
| `client/src/sections/software/software-create-edit-form.tsx` | `src/sections/invoice/invoice-create-edit-form.tsx` | modified | Edit only, through `useSoftwareEditor`; identity fields, the status/date row and details in one Card; right-aligned large Back and Save buttons; Save uses `aria-disabled` instead of `loading` (which disables and drops focus); discard confirm kept. |
| `client/src/sections/software/software-create-edit-status-date.tsx` | `src/sections/invoice/invoice-create-edit-status-date.tsx` | modified | Approval status from the server plus native date fields (no date pickers). |

Ours, changed to match the template shell: `layouts/eocr/layout.tsx` (integrate nav colors, the template's widths and padding transition, header gap), `layouts/eocr/nav-sidebar.tsx` (structure of `layouts/dashboard/nav-vertical.tsx`, Logo, NavToggleButton, mini nav), `layouts/eocr/nav-drawer.tsx` (Logo, light background), `components/eocr-nav/primary-nav.tsx` and `primary-nav.styles.ts` (template tokens; only the section heading color changes), and `theme/eocr-tokens.ts` (light `background.default` white). `layouts/eocr/wordmark.tsx`, `sections/software/view/software-catalog-view.tsx`, `software-grid.tsx`, `software-grid-toolbar.tsx` and `software-editor-view.tsx` were removed.

## Breadcrumbs, settings, error views and account popover (2026-10-15)

Copied unmodified from `Minimal_TypeScript_v7.7.0/vite-ts` in commit `bcfb9f2` ("vendor: Minimal UI v7.7.0 breadcrumbs, settings, error views and account popover (unmodified)"), then adapted. This section supersedes the "Removed groups" row for "Settings and RTL" (the settings context and drawer are back with safe options only; RTL stays out) and the "Header widgets" row for `settings-button` and `account-popover`.

| Our path | Template path (`vite-ts/`) | Status | Changes |
| --- | --- | --- | --- |
| `client/src/components/custom-breadcrumbs/custom-breadcrumbs.tsx` | `src/components/custom-breadcrumbs/custom-breadcrumbs.tsx` | modified | Breadcrumbs named "Breadcrumb"; the current crumb is text with `aria-current="page"` (no link); the back arrow is its own link named by `backLabel`, beside the heading (the template links the whole heading). |
| `client/src/components/custom-breadcrumbs/styles.tsx` | same | modified | Added `BreadcrumbsHeadingRow` (back link and heading side by side). |
| `client/src/components/custom-breadcrumbs/breadcrumb-link.tsx` | same | modified | Current crumb in `text.secondary` (template `text.disabled` is below 4.5:1). |
| `client/src/components/custom-breadcrumbs/back-link.tsx` | same | modified | Icon `aria-hidden`; the caller names the link. |
| `client/src/components/custom-breadcrumbs/{index,more-links}.ts(x)` | same | verbatim | |
| `client/src/components/settings/types.ts`, `settings-config.ts` | `src/components/settings/*` | modified | State reduced to `fontSize`, `compactLayout`, `navLayout` (`vertical` or `mini`) and `version`; mode stays with MUI's color scheme. `FONT_SIZE_RANGE` is 16 to 20. |
| `client/src/components/settings/context/settings-provider.tsx` | same | modified | The inline `eslint-disable` replaced by complete effect dependencies. |
| `client/src/components/settings/context/{index,settings-context,use-settings-context}.ts` | same | verbatim | |
| `client/src/components/settings/drawer/settings-drawer.tsx` | same | modified | Only dark mode, compact, nav layout and font size; a dialog named by its heading; named Reset all and Close buttons; native scrolling instead of `Scrollbar`. |
| `client/src/components/settings/drawer/base-option.tsx` | same | modified | A `<label>` around a real `Switch` (the template nests a Switch in a ButtonBase); the switch is named by the option label and described by the former tooltip text. |
| `client/src/components/settings/drawer/styles.tsx` | same | modified | Blocks are named groups; reset icons are buttons named "Reset …"; the small label is text unless resettable; hover-only tooltips removed; option buttons expose `aria-pressed` and use `text.secondary` when unselected. |
| `client/src/components/settings/drawer/nav-layout-option.tsx` | same | modified | Options have labels (accessible names); `NavColorOptions` removed. |
| `client/src/components/settings/drawer/font-options.tsx` | same | modified | `FontFamilyOptions` removed; the slider is named "Font size" and speaks px. |
| `client/src/components/settings/drawer/fullscreen-button.tsx` | same | modified | Named "Fullscreen" with `aria-pressed`. |
| `client/src/components/settings/drawer/{index,icons}.ts(x)`, `components/settings/index.ts` | same | verbatim | |
| `client/src/components/settings/drawer/presets-options.tsx` | same | removed | Color presets are not offered. |
| `client/src/theme/with-settings/update-components.ts` | `src/theme/with-settings/update-components.ts` | modified | Returns global styles for a `GlobalStyles` element (EOCR's `MuiCssBaseline` override is a function and would drop an object override); scales the browser's text size as a percentage, only above the default; the high-contrast card shadow removed. |
| `client/src/theme/with-settings/index.ts` | same | modified | Exports `update-components` only. |
| `client/src/theme/with-settings/{update-core,color-presets}.ts` | same | removed | Only used by the options that are not offered. `right-to-left.tsx` was never copied (RTL packages are not approved). |
| `client/src/layouts/components/settings-button.tsx` | same | modified | No framer-motion: tap and hover scaling and the endlessly rotating gear removed; named "Settings" with `aria-haspopup="dialog"` and `aria-expanded`. |
| `client/src/layouts/components/account-popover.tsx` | same | modified | Fed by `/api/me` (loading, error, signed-out states) instead of the mocked user; the framer-motion `AccountButton` replaced by a static 40px ring; a dialog named "Account"; the email wraps; menu items are the links; no sign-out yet. `account-button.tsx` was not copied. |
| `client/src/sections/error/{not-found-view,403-view,500-view}.tsx` | `src/sections/error/*` | modified | framer-motion bounce removed; rendered inside EOCR's layout (`ErrorContent`, ours, copies `SimpleCompactContent`'s 448px column) instead of `SimpleLayout`; the heading is the page's `h1` (styled `h3`, focusable); `title`, `documentTitle`, `description` and `action` props. |
| `client/src/assets/illustrations/{background-shape,page-not-found,forbidden,server-error}-illustration.tsx` | `src/assets/illustrations/*` | verbatim | Decorative (`SvgIcon` is `aria-hidden` without a title). |
| `client/src/assets/illustrations/index.ts` | same | ours | Exports the three illustrations used. |
| `client/public/assets/illustrations/characters/character-{question,reject,study}.webp` | `public/assets/...` | verbatim | |

Ours, changed to use these: `components/page-header/page-header.tsx` (built on CustomBreadcrumbs), `pages/not-found.tsx`, `routes/components/require-admin.tsx` and `eocr-error-boundary.tsx` (the error views), `layouts/eocr/layout.tsx` (settings button, account popover, nav layout from settings), `layouts/dashboard/content.tsx` (compact layout from settings again, as in the template), `theme/theme-provider.tsx` (settings font size), `app.tsx` (SettingsProvider and SettingsDrawer), `sections/requests/view/my-requests-view.tsx` plus `request-table-{row,toolbar,filters-result}.tsx` (the invoice list layout, as the catalog) and `new-request-view.tsx` (the invoice create-view framing). Removed: `layouts/eocr/account-menu.tsx`, `sections/requests/view/requests-grid.tsx`, `components/stat-card/**` and `components/feedback/empty-state.tsx` (replaced by the template's analytic and EmptyContent).

## Animation, scrollbar, toasts and splash screen (2026-10-15)

`framer-motion` 12.38.0, `sonner` 2.0.7 and `simplebar-react` 3.3.2 were approved and added in commit `26ebe49`. The template files below were copied unmodified in commit `1e5944e` ("vendor: Minimal UI v7.7.0 animate, scrollbar, snackbar, splash screen and account button (unmodified)") and then adapted. This section supersedes the "Removed groups" row for "Animation, progress bar, scrollbar and unused components" for these files, and the earlier notes that the account avatar ring, error-view bounce and settings button motion were removed.

| Our path | Template path (`vite-ts/`) | Status | Changes |
| --- | --- | --- | --- |
| `client/src/components/animate/index.ts` | `src/components/animate/index.ts` | modified | Exports only the ported parts (variants, logo, border, motion container). `animate-text`, `motion-viewport`, `scroll-progress`, `animate-count-up` and `back-to-top-button` are not ported. |
| `client/src/components/animate/motion-lazy.tsx` | same | modified | Adds `<MotionConfig reducedMotion="user">` inside `LazyMotion` (AGENTS.md). |
| `client/src/components/animate/animate-border.tsx` | same | modified | `active` prop: the border moves only while active, and never under reduced motion (the template's moves forever); the visibility measurement runs on the next frame instead of synchronously in an effect. |
| `client/src/components/animate/{animate-logo,motion-container}.tsx`, `variants/*` | same | verbatim | |
| `client/src/components/scrollbar/scrollbar.tsx`, `types.ts` | `src/components/scrollbar/*` | modified | `label` prop: a named, focusable region with a label; without one, simplebar's `role="region"`, `aria-label="scrollable content"` and `tabindex` are removed. The caller's `scrollableNodeProps` are kept, and one callback ref forwards the node (no ref access during render). |
| `client/src/components/scrollbar/styles.css` | same | modified | Thumb in `text.secondary` at 0.64 (the template's `text.disabled` at 0.48 is below 3:1): 3.17 to 3.29:1 light, 4.82 to 5.17:1 dark. |
| `client/src/components/scrollbar/{index,classes}.ts` | same | verbatim | |
| `client/src/components/snackbar/styles.tsx` | `src/components/snackbar/styles.tsx` | modified | Toast descriptions in `text.secondary` instead of opacity 0.64 (about 4:1). |
| `client/src/components/snackbar/snackbar.tsx` | same | modified | Comment only: error toasts are raised with `{ duration: Infinity }`. |
| `client/src/components/snackbar/{index,classes}.ts` | same | verbatim | |
| `client/src/components/loading-screen/splash-screen.tsx` | same | modified | A polite status announced as "Loading"; the logo is `aria-hidden` and out of the tab order. |
| `client/src/components/loading-screen/index.ts` | same | modified | Exports `splash-screen` again. |
| `client/src/layouts/components/account-button.tsx` | same | modified | The border moves only on hover or focus; the caller names the button; the avatar is decorative; `pending` shows a skeleton. |

Ours, changed to use these: `app.tsx` (`MotionLazy` and the template `Snackbar` replace `ToastProvider`, which is removed with `components/toast`), `test/render-with-theme.tsx` (the same), `sections/software/use-software-editor.ts` (`toast.success` / `toast.error` with persistent errors), `global.css` (imports the scrollbar styles again, as the template), `layouts/eocr/nav-sidebar.tsx` and `nav-drawer.tsx` (the template's `Scrollbar` around the vertical nav, as `nav-vertical.tsx` and `nav-mobile.tsx`), `components/settings/drawer/settings-drawer.tsx` (`Scrollbar` again), the catalog and My requests lists (labelled `Scrollbar`s for the summary strip and the table), `sections/error/*` and `routes/components/eocr-error-boundary.tsx` (the template's bounce-in again, inside `MotionLazy`), `layouts/components/settings-button.tsx` (tap and hover scaling again, static gear), `layouts/components/account-popover.tsx` (the adapted `AccountButton`), and `routes/components/require-admin.tsx` (the splash screen while the session is checked, as the template's auth guard).

## Request intake and status pages (2026-10-15)

Copied unmodified from `Minimal_TypeScript_v7.7.0/vite-ts` in commit `72d9d4a` ("vendor: Minimal UI v7.7.0 checkout steps and order details (unmodified)"), then adapted.

| Our path | Template path (`vite-ts/`) | Status | Changes |
| --- | --- | --- | --- |
| `client/src/sections/requests/request-intake-steps.tsx` | `src/sections/checkout/checkout-steps.tsx` | modified | An ordered list named "Request steps", the current step marked `aria-current="step"`, completed and current state in visually hidden text, decorative icons, upcoming dots in `text.secondary`; plain step labels instead of the checkout context type. |
| `client/src/sections/requests/request-details-toolbar.tsx` | `src/sections/order/order-details-toolbar.tsx` | modified | The heading is the page's `h1` (styled `h4`, focusable) and sets the document title; named back link; `StatusChip`; date in `text.secondary` with `<time>`; the status menu, Print and Edit replaced by "Continue draft" for drafts. |
| `client/src/sections/requests/request-details-history.tsx` | `src/sections/order/order-details-history.tsx` | modified | The `@mui/lab` Timeline (not approved) rebuilt as an ordered list with the same dot, connector and spacing; entries in words (status, who, when, comments); the summary panel is a description list of the request dates; "Show more" removed. |
| `client/src/sections/requests/view/request-details-view.tsx` | `src/sections/order/view/order-details-view.tsx` | modified | The same toolbar plus 8/4 grid: business need and history on the left, software, funding and VPAT sections with dashed dividers on the right; no mock data. |

Ours, built on these: `request-intake-view.tsx`, `request-intake-catalog-step.tsx`, `request-intake-details-step.tsx` (the invoice create/edit form layout), `request-intake-review-step.tsx`, `request-details-page-view.tsx`, `request-edit-page-view.tsx`, `use-request.ts`, `use-request-intake.ts` and `request-intake-schema.ts`. `components/hook-form/rhf-checkbox.tsx` (starter) now passes the controller ref to the input and sets `aria-invalid` and `aria-describedby` (AGENTS.md shared field rules). `sections/requests/view/new-request-view.tsx` was removed.

## Review queue and review page (2026-10-15)

Copied unmodified from `Minimal_TypeScript_v7.7.0/vite-ts` in commit `142571f` ("vendor: Minimal UI v7.7.0 user quick edit form and kanban nav icon (unmodified)"), then adapted.

| Our path | Template path (`vite-ts/`) | Status | Changes |
| --- | --- | --- | --- |
| `client/src/sections/review/review-action-dialog.tsx` | `src/sections/user/user-quick-edit-form.tsx` | modified | One comment field (required for "Request more information"); named by its title and described by its text; focus moves to the field on open; errors summarized, tied to the field and focused; stays open on a failed save; no mock data or phone/country fields. |
| `client/src/sections/review/review-decide-dialog.tsx` | `src/sections/user/user-quick-edit-form.tsx` | modified | Decision, expiry (default twelve months, hidden for a denial), risk, conditions (for "approved with conditions") and comments, with options from the server's codes; a polite status region previews the catalog change; focus starts on the Decision select; errors summarized and tied to their fields; stays open on failure. |
| `client/public/assets/icons/navbar/ic-kanban.svg` | `public/assets/icons/navbar/ic-kanban.svg` | unmodified | The Review queue nav icon. |

Ours, built on these: `sections/review/view/review-queue-view.tsx` and `review-table-{row,toolbar,filters-result}.tsx` (the My requests list layout, from the invoice list), `view/review-request-view.tsx` and `review-request-page-view.tsx` (the request status layout), `review-form.tsx`, `review-people-card.tsx`, `review-catalog-versions.tsx`, `review-schema.ts`, `review-workflow.ts`, `use-review.ts`, `use-review-actions.ts`, `api.ts` and `types.ts`. Changed: `sections/requests/request-details-toolbar.tsx` (optional back label and actions; "Update request" when more information is needed), `view/request-details-view.tsx` (the details card moved to `request-details-summary.tsx`; the reviewer's message), `view/request-intake-view.tsx` and `view/request-edit-page-view.tsx` (update and resubmit a request sent back), and `components/eocr-nav/nav-data.ts` (the Management group, admins only).

## Outlined buttons (2026-10-16)

`client/src/components/custom-breadcrumbs/back-link.tsx` (template, already adapted): the back arrow is a 36px outlined circle (`shared.buttonOutlined`) with a hover tint instead of the template's floating arrow that fades on hover. Theme default in our `eocr-components.ts` (no template theme file edited).

## Development tooling (2026-10-16)

`client/src/layouts/components/account-popover.tsx` (template, already adapted) renders our `layouts/eocr/dev-user-switcher.tsx` in development builds only, and widens to 300px there. `client/scripts/dev-all.mjs` (ours) runs the API and Vite together (`npm run dev:all`).

## Catalog page as the home dashboard (2026-10-16)

Copied unmodified from `Minimal_TypeScript_v7.7.0/vite-ts` in commit `ae5c6ab` ("vendor: Minimal UI v7.7.0 app new invoices card (unmodified)"), then adapted.

| Our path | Template path (`vite-ts/`) | Status | Changes |
| --- | --- | --- | --- |
| `client/src/sections/requests/recent-requests-card.tsx` | `src/sections/overview/app/app-new-invoices.tsx` | modified | The viewer's five most recent requests (software linked to its status page, version, last updated, `StatusChip`) instead of mock invoices; the row menu removed; the title is an `h2`; the scroll region is named; "View all requests" links to My requests; loading, empty (`EmptyContent` with Request software) and error states. |

Ours: `sections/requests/my-requests-summary.tsx` (the "Your requests" strip on `AnalyticSummary`), `sections/review/review-queue-summary-card.tsx` (admins). Changed: `sections/software/view/software-list-view.tsx` (the catalog-wide analytics strip removed; a "Find your software" card header; the page header moved to `software-catalog-page-view.tsx`, which composes the page), and `sections/requests/status-groups.ts` (now holds `GROUP_STYLE`, shared with `my-requests-view.tsx`).

## EEAAP exceptions (2026-10-15)

No template files were ported. Ours, built on existing layouts: `sections/requests/view/request-eeaap-view.tsx` and `request-eeaap-page-view.tsx` (the intake card layout), `request-details-exception.tsx` (the order details description list, shared with the review page), `request-eeaap-schema.ts`, `use-request-exception.ts`, `sections/software/exception-text.ts`. Changed: `request-details-toolbar.tsx` ("Complete the EEAAP"), `view/request-details-view.tsx`, `request-intake-catalog-step.tsx` and `software-table-row.tsx` (exception expiry text), and on the review page `view/review-request-view.tsx` and `review-decide-dialog.tsx` (adapted from the template's quick edit form in an earlier commit: outcomes and conditions with a submitted EEAAP).
