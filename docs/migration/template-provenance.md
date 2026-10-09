# Template provenance

Where files in `client/` come from. Template: Minimal UI `starter-vite-ts`, version v7.7.0. Source (outside the repo): `Minimal_TypeScript_v7.7.0/starter-vite-ts`.

| Our path | Template path | Template version | Status | Note |
| --- | --- | --- | --- | --- |
| `client/` (whole starter) | `starter-vite-ts/` | v7.7.0 | verbatim | Vendored in commit `vendor: Minimal starter-vite-ts v7.7.0 (unmodified)`. SHA-256 compared with the source: 673 files identical (excluding `node_modules`, `.env`, `.gitattributes`). `.vscode/settings.json` is not tracked because the starter's `.gitignore` ignores `.vscode`. |
| `client/vite.config.ts` | `vite.config.ts` | v7.7.0 | modified | Port 8081 changed to 5173 (server and preview); added `/api` proxy to `http://localhost:5246`. |
| `client/package.json` | `package.json` | v7.7.0 | modified | Removed `packageManager` and the `clean`, `re:dev`, `re:build`, `re:build-npm` scripts (yarn and `rm -rf`). |
| `client/.gitignore` | `.gitignore` | v7.7.0 | modified | Added `!.env.example` after `.env*`. |
| `client/src/global-config.ts` | `src/global-config.ts` | v7.7.0 | modified | `auth.skip` changed from `false` to `true` to bypass the auth guard until the strip slice. |
| `client/src/app.tsx` | `src/app.tsx` | v7.7.0 | modified | Removed `AuthProvider`, `SettingsProvider` and `SettingsDrawer`. |
| `client/src/global-config.ts` | `src/global-config.ts` | v7.7.0 | modified | Removed `serverUrl` and the `auth`, `firebase`, `amplify`, `auth0`, `supabase` blocks (including the `skip` flag set in Slice 1) and the `paths` import. |
| `client/src/routes/paths.ts` | `src/routes/paths.ts` | v7.7.0 | modified | Reduced to `paths.dashboard.root`. |
| `client/src/routes/sections/index.tsx` | `src/routes/sections/index.tsx` | v7.7.0 | modified | Removed auth routes and the 404 page. `/` and `*` both redirect to `/dashboard` (temporary; Slice 9 builds the 404). |
| `client/src/routes/sections/dashboard.tsx` | `src/routes/sections/dashboard.tsx` | v7.7.0 | modified | Removed `AuthGuard`, the `CONFIG.auth.skip` branch and pages two to six. |
| `client/src/layouts/nav-config-dashboard.tsx` | `src/layouts/nav-config-dashboard.tsx` | v7.7.0 | modified | Reduced to one item ("One", `/dashboard`, icon `ic-dashboard`). |
| `client/src/layouts/dashboard/layout.tsx` | `src/layouts/dashboard/layout.tsx` | v7.7.0 | modified | Removed header widgets, horizontal nav, mocked user and role checks. Header keeps only the mobile `MenuButton`. Settings context removed: nav color `integrate`, nav layout `vertical`, no mini mode. |
| `client/src/layouts/dashboard/nav-vertical.tsx` | `src/layouts/dashboard/nav-vertical.tsx` | v7.7.0 | modified | Removed `NavToggleButton`, `onToggleNav`, `NavUpgrade`, and the mini variant (`isNavMini`, `NavSectionMini`). |
| `client/src/layouts/dashboard/nav-mobile.tsx` | `src/layouts/dashboard/nav-mobile.tsx` | v7.7.0 | modified | Removed `NavUpgrade`. |
| `client/src/theme/theme-provider.tsx` | `src/theme/theme-provider.tsx` | v7.7.0 | modified | Removed settings context and the `Rtl` wrapper. Keeps `defaultMode` and the mode storage key. |
| `client/src/theme/create-theme.ts` | `src/theme/create-theme.ts` | v7.7.0 | modified | Removed `settingsState` and `applySettingsTo*`; the theme is `baseTheme` plus overrides. With default settings the result is the same as before (typography already sets the primary font). |
| `client/src/layouts/dashboard/css-vars.ts` | `src/layouts/dashboard/css-vars.ts` | v7.7.0 | modified | `SettingsState` types replaced by local `NavColor` and `NavLayout` types. |
| `client/src/layouts/dashboard/content.tsx` | `src/layouts/dashboard/content.tsx` | v7.7.0 | modified | Removed settings context: `compactLayout` fixed at its shipped default (`true`), horizontal-nav padding removed. |
| `client/yarn.lock` | `yarn.lock` | v7.7.0 | deleted | npm is the package manager. `package-lock.json` is unchanged (`npm ci` succeeded). |
| `client/.env.example` | n/a | n/a | ours-only | Same variable names as the starter's `.env`, empty values. |
| `client/.gitattributes` | n/a | n/a | ours-only | Line-ending rules, committed before the vendor commit. |

## Removed groups

Removed with `git rm`; the files stay available in the vendor commit `bd436d9`.

| Group | Paths | Removed in |
| --- | --- | --- |
| Auth and mock demo layer | `src/auth/**`, `src/routes/sections/auth.tsx`, `src/pages/auth/**`, `src/layouts/auth-split/**`, `src/layouts/simple/**`, `src/layouts/components/{sign-in-button,sign-out-button}.tsx`, `src/lib/axios.ts`, `src/_mock/**`, `src/pages/dashboard/{two..six}`, `src/layouts/nav-config-{account,workspace}.tsx`, `src/pages/error/**`, `src/sections/error/**` | Slice 2 (a+b) |
| Header widgets and nav extras | `src/layouts/components/{account-*,language-popover,contacts-popover,workspaces-popover,notifications-drawer,searchbar,settings-button,nav-toggle-button,nav-upgrade}`, `src/layouts/dashboard/nav-horizontal.tsx` | Slice 2 (a+b) |
| Settings and RTL | `src/components/settings/**`, `src/theme/with-settings/**` | Slice 2 (c) |
