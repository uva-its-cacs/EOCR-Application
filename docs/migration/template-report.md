# Minimal UI template discovery report

Read-only survey of the Minimal UI v7.7.0 starter (`starter-vite-ts`) and its full-featured sibling (`vite-ts`) against our `client/`. Nothing in the repo or template was modified. Paths are relative to `starter-vite-ts/` unless stated; `client/src/...` paths are ours.

Headline facts:

- Package `@minimal-kit/starter-vite-ts` 7.7.0 (the 7.7.0 is the kit version, not MUI). It uses React 19.2, MUI 9.0.1, react-router 7.15, Vite 8, TS 5.9, ESLint 9.39, Prettier 3.8, Zod 4, react-hook-form 7, axios, framer-motion, iconify, simplebar. About 213 files under `src/`.
- Our client is already on the same majors (MUI 9, Data Grid 9, React 19, Vite 8), so there is no MUI v7→v9 migration to do. See section 12.
- The starter is not buildable as delivered. Several directories are empty in every variant of the archive (see section 0).

## 0. IMPORTANT extraction caveat
The delivered copy is incomplete. Empty directories (files missing from the archive, in BOTH starter-vite-ts and vite-ts, and in the next variants):
- `src/theme/core/components/` (all MUI component overrides) and `src/theme/core/mixins/` are EMPTY in starter-vite-ts. They exist populated in the sibling `vite-ts/src/theme/core/components/*.tsx` (46 files) and `vite-ts/src/theme/core/mixins/*.ts`. `theme/core/index.ts` re-exports them, so the starter does not compile as delivered. Copy these from `vite-ts`.
- `src/components/settings/context/` and `settings/drawer/` are empty in every variant (SettingsProvider, useSettingsContext, SettingsDrawer are imported by app.tsx but present nowhere).
- `src/components/nav-section/{components,horizontal,mini,styles,utils,vertical}/` empty in every variant (only `index.ts` and `types.ts` exist).
- `src/auth/context/jwt/`, `src/auth/view/jwt/`, `src/pages/auth/jwt/` empty (app.tsx imports `src/auth/context/jwt`; routes import `src/pages/auth/jwt/sign-in|sign-up`).
- Also empty: `components/animate/{scroll-progress,variants}`, `layouts/components/{notifications-drawer,searchbar}`.
Anything below about those missing pieces is inferred from types/imports and flagged "(missing)".

## 1. Folder structure

```
src/
  main.tsx                 entry: createBrowserRouter + RouterProvider
  app.tsx                  App: providers wrapper, imports global.css, scroll-to-top
  global-config.ts         CONFIG object (app name, env, auth method)
  global.css               font imports, baseline html/body resets, scrollbar css
  vite-env.d.ts
  _mock/                   fake data files (_user, _blog, _order, ...), only for demo
  assets/
    data/ icons/ illustrations/   static data and svg assets
  auth/
    components/            sign-in/up form pieces (form-head, form-divider, form-socials, ...)
    context/               auth-context + jwt/ provider
    guard/                 AuthGuard, GuestGuard, RoleBasedGuard
    hooks/                 useAuthContext, useMockedUser
    utils/                 error-message
    view/jwt/              sign-in/sign-up views
    types.ts
  components/              shared reusable UI, one folder per component
    animate/ (scroll-progress, variants), custom-popover/, file-thumbnail/, flag-icon/,
    hook-form/ (RHF-bound fields: rhf-text-field, rhf-select, rhf-autocomplete, ... plus fields.tsx `Field` namespace, form-provider, schema-utils),
    iconify/, label/, loading-screen/, logo/, nav-section/ (types + barrel; see observation),
    progress-bar/ (nprogress), scrollbar/ (simplebar), search-not-found/, settings/ (config/types/barrel), svg-color/
  layouts/
    core/                  LayoutSection, HeaderSection, MainSection, classes, css-vars (generic skeleton)
    dashboard/             DashboardLayout, nav-vertical, nav-mobile, nav-horizontal, content (DashboardContent), css-vars
    auth-split/            two-pane auth layout
    simple/                minimal header+content layout
    components/            header widgets: account-*, menu-button, nav-toggle-button, nav-upgrade, language/contacts/workspaces popovers, notifications-drawer, searchbar, settings-button, sign-in/out buttons
    nav-config-dashboard.tsx, nav-config-account.tsx, nav-config-workspace.tsx   nav data
  lib/
    axios.ts               axios instance
  pages/                   route-level components (default export, set <title>)
    dashboard/ (one..six), auth/jwt/ (sign-in, sign-up), error/404.tsx
  routes/
    paths.ts               `paths` constant object of URL strings
    components/            ErrorBoundary, RouterLink
    hooks/                 usePathname, useParams, useSearchParams, useRouter (wrappers over react-router)
    sections/              index.tsx, auth.tsx, dashboard.tsx route arrays
  sections/                feature views composed by pages (blank/view.tsx, error/not-found-view.tsx)
  theme/
    core/ (+ components/, mixins/)   palette, typography, shadows, component overrides
    with-settings/         settings-driven theme adjustments (e.g. right-to-left)
    create-theme.ts, create-classes.ts, theme-config.ts, theme-overrides.ts, theme-provider.tsx, extend-theme-types.d.ts, types.ts, index.ts
  utils/
    format-time.ts
```

Conventions:
- File names: kebab-case (`nav-mobile.tsx`, `use-pathname.ts`, `rhf-text-field.tsx`), pages named by route (`one.tsx`, `404.tsx`).
- Components: PascalCase named exports (`DashboardLayout`, `NavMobile`); page files use `export default function Page()`. Hooks `useX` in kebab files.
- Component folders are "folder per component/feature with barrel `index.ts`" for `components/*`, `layouts/*`, `auth/guard`, `routes/hooks`; within a folder files are flat. Some layout parts are flat files inside `layouts/components/`.
- Imports use `src/...` absolute alias (not `@/`).
- Every file has a `// ------` separator line after imports and between sections.
- Pages (route-level) -> `sections/<name>/view.tsx` (feature view) -> `layouts/` wrappers, i.e. pages are thin.

## 2. Config

### ESLint (`eslint.config.mjs`, flat config, ESLint 9)
Extends: `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-react` flat recommended; plugins react-hooks (recommended rules + several v7 compiler rules off: refs, immutability, set-state-in-effect, incompatible-library, preserve-manual-memoization), import, unused-imports, perfectionist. No `jsx-a11y`. globalIgnores `out/**`, `dist/**`, `build/**`. Globals browser+node. Lint script covers `src/**/*.{js,jsx,ts,tsx}`.
Rules that would affect our code:
- `perfectionist/sort-imports` ERROR (2): asc, ignoreCase, type `line-length` (sort by line length, shortest first), `newlinesBetween: 'always'`, internalPattern `^src/.+`. Group order: style, side-effect, type imports (`type`, external-type, builtin-type; then no newline; then index/parent/sibling/internal types), builtin+external, `@mui/*`, `src/routes`, `src/hooks`, `src/utils`, other internal (`src/...`), `src/components`, `src/sections`, `src/auth`, `src/types`, parent/sibling/index, object, unknown. Blank line between groups.
- `perfectionist/sort-named-imports`, `sort-named-exports`, `sort-exports` warn (1), line-length asc, values-first.
- `import/newline-after-import` error; `import` recommended rules (e.g. `import/no-unresolved`, `no-duplicates`) with TS resolver on `./tsconfig.json`; named/default/namespace/export/no-named-as-default off; `import/no-cycle` off.
- `unused-imports/no-unused-imports` warn; `unused-imports/no-unused-vars` warn (vars all, `^_` ignored, args not checked); base `no-unused-vars` and TS version off.
- `@typescript-eslint/consistent-type-imports` warn (use `import type`); `@typescript-eslint/no-shadow` error; `no-explicit-any` OFF (conflicts with our "no any without comment" rule only by convention); `no-empty-object-type` off.
- Core: `consistent-return` error, `default-case` error (comment `no default`), `default-case-last` error, `no-bitwise` error, `arrow-body-style` as-needed error, `lines-around-directive` error, `func-names` warn, `object-shorthand` warn, `no-useless-rename` warn, `no-constant-condition` warn.
- React: `react/jsx-boolean-value` error (no `={true}`), `react/self-closing-comp` error, `react/jsx-curly-brace-presence` error (no unneeded braces for props/children), `react/jsx-no-useless-fragment` warn, `react-in-jsx-scope` off, `prop-types` off, `jsx-key` off (note: disabled), `display-name` off, `no-children-prop` off.
- `react-hooks` recommended rules (rules-of-hooks, exhaustive-deps).
- Conflicts to note vs our AGENTS.md: ESLint v9 matches our pin. Template prefers compact single-line JSX props sometimes; Prettier width 100 governs.

### Prettier (`prettier.config.mjs`)
`semi: true`, `tabWidth: 2`, `endOfLine: 'lf'`, `printWidth: 100`, `singleQuote: true`, `trailingComma: 'es5'`. `.prettierignore` exists. Scripts `fm:check`/`fm:fix`, `fix:all`. `.editorconfig`: utf-8, 2 spaces, lf, final newline, trim trailing whitespace.

### tsconfig.json
`baseUrl: "."`, module esnext, moduleResolution bundler, `types: ["vite/client","node"]`, jsx react-jsx, allowJs, resolveJsonModule, target es2023, lib ES2023+DOM, moduleDetection force, incremental with tsBuildInfoFile in node_modules/.tmp, skipLibCheck, esModuleInterop, isolatedModules, `strict: true`, `strictNullChecks`, `noEmit`. No `paths` entry; the `src/...` imports resolve via `baseUrl: "."` (TS) plus a Vite regex alias. No `noUnusedLocals`, `verbatimModuleSyntax`. `include: ["src"]`, references `tsconfig.node.json`. Build script: `tsc && vite build`.

### tsconfig.node.json
`composite: true`, module esnext, moduleResolution bundler, allowSyntheticDefaultImports; include `vite.config.ts`.

### vite.config.ts
Plugins: `@vitejs/plugin-react`, `vite-plugin-checker` (typescript: true; eslint lintCommand `eslint "./src/**/*.{js,jsx,ts,tsx}"`; overlay top-left, collapsed). `resolve.alias`: regex `/^src(.+)/` -> `path.resolve(process.cwd(), 'src/$1')`. `PORT = 8081` for dev server and preview, `host: true`. No proxy configured (we need `/api` proxy, port 5173).

### Other config
- `.env`: `VITE_SERVER_URL` (demo api), `VITE_ASSETS_DIR` (empty), blank Firebase/AWS/Auth0/Supabase vars.
- `index.html`: `lang="en"`, `<title>Minimal UI Kit</title>`, theme-color #000000, root div, `/src/main.tsx`.
- `vercel.json` present (deploy). `package.json` engines node >=22.12, packageManager yarn 1.22.22 (both package-lock and yarn.lock exist).
- `src/global-config.ts` exports `CONFIG: ConfigValue`: `appName` ('Minimal UI', used in page titles), `appVersion` (from package.json), `serverUrl` (VITE_SERVER_URL), `assetsDir` (VITE_ASSETS_DIR, prefixes `/assets/...` URLs), `auth.method` ('jwt' | amplify | firebase | supabase | auth0), `auth.skip` (false; when true dashboard routes skip AuthGuard), `auth.redirectPath` (`paths.dashboard.root`, where `/` redirects), plus `firebase`, `amplify`, `auth0`, `supabase` blocks reading env vars.
- `src/theme/theme-config.ts` exports `themeConfig`: `defaultMode: 'light'`, `modeStorageKey: 'theme-mode'`, `direction: 'ltr'`, `classesPrefix: 'minimal'`, `cssVariables {cssVarPrefix: '', colorSchemeSelector: 'data-color-scheme'}`, `fontFamily {primary: 'Public Sans Variable', secondary: 'Barlow'}`, palette tokens primary (#00A76F green), secondary (#8E33FF), info, success, warning, error (each lighter/light/main/dark/darker/contrastText), grey 50-900, common black/white. Contrast not verified by the template (e.g. primary main #00A76F with white text is under 4.5:1; warning uses dark contrastText).
- `src/components/settings/settings-config.ts`: `SETTINGS_STORAGE_KEY = 'app-settings'`; `defaultSettings`: mode (from theme), direction, contrast 'default', navLayout 'vertical', primaryColor 'default', navColor 'integrate', compactLayout true, fontSize 16, fontFamily primary, version.

## 3. App bootstrap

`index.html` -> `src/main.tsx`:
- `createBrowserRouter([{ Component: () => <App><Outlet/></App>, errorElement: <ErrorBoundary/>, children: routesSection }])` (data router, route-object style, not JSX routes).
- `createRoot(#root).render(<StrictMode><RouterProvider router={router}/></StrictMode>)`.
- So `App` is the root route element and sits inside the router (can use router hooks).

`src/app.tsx`: imports `src/global.css` (fonts via @fontsource, scrollbar css, html/body baseline). Calls `useScrollToTop()` (effect on pathname -> `window.scrollTo(0,0)`; no focus management). Provider order, outermost first:
1. `StrictMode` (main.tsx)
2. `RouterProvider` (main.tsx)
3. `ErrorBoundary` as route `errorElement`, root route component wraps `App`
4. `AuthProvider` (`src/auth/context/jwt`)
5. `SettingsProvider defaultSettings={defaultSettings}` (localStorage-backed UI settings)
6. `ThemeProvider` (own wrapper at `src/theme/theme-provider.tsx`; props `modeStorageKey`, `defaultMode` from themeConfig). Inside: MUI `ThemeProvider` (CSS-vars, `disableTransitionOnChange`) -> `CssBaseline` -> `Rtl` (direction from settings, emotion RTL cache). Theme built by `createTheme({settingsState, themeOverrides})` so settings (primary color, contrast, font, direction) alter the theme at runtime.
7. `MotionLazy` (framer-motion LazyMotion)
8. Inside it: `ProgressBar` (nprogress), `SettingsDrawer`, then `{children}` (the routed Outlet).
No QueryClientProvider, no LocalizationProvider, no i18n provider in the starter (language popover is cosmetic).
Fonts: Public Sans Variable + Barlow (self-hosted via @fontsource imports in global.css, plus DM Sans/Inter/Nunito options). Dark mode and CSS-var color schemes are enabled by default (`data-color-scheme`); mode toggle lives in the settings drawer.
Page title: each page renders React 19 `<title>` element (`const metadata = { title: \`Page one | Dashboard - ${CONFIG.appName}\` }` then `<title>{metadata.title}</title>`). No central title hook, no focus-to-h1.

## 4. Routing

- Library: `react-router` v7 (imports from `'react-router'`, not `react-router-dom`), data router via `createBrowserRouter` in main.tsx, `RouteObject[]` arrays.
- `src/routes/sections/index.tsx` exports `routesSection`: `/` -> `<Navigate to={CONFIG.auth.redirectPath} replace/>`, `...authRoutes`, `...dashboardRoutes`, `{ path: '*', element: <Page404/> }` (Page404 lazy).
- `src/routes/sections/dashboard.tsx`: pages declared with `lazy(() => import('src/pages/dashboard/one'))` etc. (pages have default exports). `dashboardLayout()` = `<DashboardLayout><SuspenseOutlet/></DashboardLayout>`; `SuspenseOutlet` = `<Suspense key={pathname} fallback={<LoadingScreen/>}><Outlet/></Suspense>`. Route: `{ path: 'dashboard', element: CONFIG.auth.skip ? layout : <AuthGuard>{layout}</AuthGuard>, children: [index, 'two', 'three', { path: 'group', children: [index, 'five', 'six'] }] }`.
- `src/routes/sections/auth.tsx`: `path: 'auth'` with Suspense(SplashScreen)+Outlet; children grouped per provider (`jwt` with `sign-in`/`sign-up`), each element = `<GuestGuard><AuthSplitLayout>...page...</AuthSplitLayout></GuestGuard>`.
- Layouts wrap routes by being the parent route `element` (layout component renders `children`, which is the Suspense Outlet), not via a layout route using `Component`/`Outlet` inside the layout itself.
- URL constants: `src/routes/paths.ts` `paths` object (ROOTS AUTH `/auth`, DASHBOARD `/dashboard`), used in nav config, guards, config.
- Helpers: `src/routes/hooks` (`usePathname`, `useRouter`, `useParams`, `useSearchParams`), `routes/components/router-link.tsx` (`RouterLink` for MUI `component`), `error-boundary.tsx` (uses `useRouteError`/`isRouteErrorResponse`, renders unstyled-ish page; no landmarks).
- Route `handle` / breadcrumbs: NOT present. No `useMatches`, no `handle`, no breadcrumb component in the starter (grep for handle/breadcrumb in layouts/routes/pages found nothing). Note our repo already has route-handle breadcrumbs (commit c86a597), so nothing to adopt here.
- No loaders/actions; no per-route document title mechanism beyond each page's `<title>`.

## 5. Theme

### Build pipeline
- `src/theme/theme-config.ts`: single source of truth (`themeConfig`): defaultMode `'light'`, modeStorageKey `'theme-mode'`, direction `ltr`, classesPrefix `minimal`, cssVariables `{cssVarPrefix: '', colorSchemeSelector: 'data-color-scheme'}`, fontFamily primary `Public Sans Variable`, secondary `Barlow`, base palette hexes (below), grey 50-900, common black/white.
- `src/theme/core/palette.ts`: wraps config with `createPaletteChannel` (minimal-shared; adds `*Channel` rgb strings for alpha use). Defines text, background, action per mode, `divider`, `TableCell.border`, and `shared` (inputOutlined, inputUnderline, paperOutlined, buttonOutlined). `colorKeys` lists the six palette keys.
- `src/theme/core/typography.ts`, `shadows.ts` (MUI default shadows re-tinted: light uses grey500 channel, dark uses black), `custom-shadows.ts` (z1..z24, card, dialog, dropdown, per-color shadows), `opacity.ts` (soft/outlined/filled alpha tokens), `core/mixins/*` (missing in starter: filledStyles, softStyles, paperStyles, menuItemStyles, bgBlur...), `core/components/*` (missing in starter; one file per MUI component incl. DataGrid, DatePicker, TreeView).
- `src/theme/create-theme.ts`: `baseTheme` = `{colorSchemes:{light,dark}, mixins, components, typography, shape.borderRadius 8, direction, cssVariables}`; `createTheme({settingsState, themeOverrides, localeComponents})` calls MUI `createTheme(applySettingsToTheme(...), applySettingsToComponents(...), localeComponents, themeOverrides)`.
- `src/theme/theme-overrides.ts`: demo override replacing primary with purple `#6950E8` (lighter #E4DCFD, light #A996F8, dark #3828A7, darker #180F6F) in both schemes. Only applied if passed to ThemeProvider; app.tsx does not pass it, so unused by default.
- `src/theme/theme-provider.tsx`: reads `useSettingsContext()`, builds the theme, wraps MUI `ThemeProvider` (`disableTransitionOnChange`, modeStorageKey/defaultMode passed from app.tsx) + `CssBaseline` + `Rtl` (emotion stylis RTL plugin, `theme/with-settings/right-to-left.tsx`).
- Augmentation: `src/theme/extend-theme-types.d.ts`, `types.ts` (adds lighter/darker, neutral background, fontWeightSemiBold/ExtraBold, fontSecondaryFamily, Button size xLarge / variant soft, etc.).

### Dark mode
Native MUI CSS-variables color schemes: `light` and `dark` registered under `colorSchemes`; `colorSchemeSelector: 'data-color-scheme'` (attribute on html). Mode persisted by MUI in localStorage key `theme-mode`; default `'light'`. No `InitColorSchemeScript` in index.html (possible flash for dark users). The toggle UI is in the settings drawer (missing).

### Settings system
- `src/components/settings/settings-config.ts`: `SETTINGS_STORAGE_KEY = 'app-settings'`; `defaultSettings`: mode 'light', direction ltr, contrast 'default', navLayout 'vertical', primaryColor 'default', navColor 'integrate', compactLayout true, fontSize 16, fontFamily 'Public Sans Variable', version = package.json version.
- `types.ts`: SettingsState / SettingsContextValue (state, setState, setField, onReset, canReset, drawer open/close/toggle), SettingsProviderProps (defaultSettings, storageKey), SettingsDrawerProps.
- Provider, hook, and drawer implementations are missing (context/, drawer/ empty). `layouts/components/settings-button.tsx` calls `useSettingsContext().onToggleDrawer`; app.tsx mounts `<SettingsProvider><ThemeProvider><SettingsDrawer/>`.
- `src/theme/with-settings/`: `update-core.ts` (applies direction, fontFamily via `setFont`, `primaryColor` preset into both schemes' primary + custom shadow, and `contrast: 'high'` swaps light `background.default` to grey200 #F4F6F8), `update-components.ts` (CssBaseline html fontSize from settings; high contrast sets `--card-shadow`), `color-presets.ts` (primary presets: default, preset1 blue #078DEE, preset2 purple #7635DC, preset3 blue #0C68E9, preset4 amber #FDA92D with contrastText #1C252E, preset5 red #FF3030), `right-to-left.tsx`.

### Fonts and typography
Default font: `Public Sans Variable` (body, h4-h6, subtitles, button) via `@fontsource-variable/public-sans`; `Barlow` (400-800) for h1-h3 (`fontSecondaryFamily`). Optional font choices bundled: DM Sans, Inter, Nunito Sans. All fonts load from npm packages through `@import` in `src/global.css` (offline, no CDN). Weights 300/400/500/600/700/800. Sizes: body1 16px, body2 14px, caption/overline 12px; h1 40 to 64px responsive, h2 32 to 48, h3 24 to 32, h4 20 to 24, h5 18 to 19, h6 17 to 18; button 14px bold, `textTransform: unset`. Shape radius 8.

### Palette (themeConfig.palette; identical for light and dark, the dark scheme does not override the six colors or contrastText)
| color | lighter | light | main | dark | darker | contrastText |
|---|---|---|---|---|---|---|
| primary | #C8FAD6 | #5BE49B | #00A76F | #007867 | #004B50 | #FFFFFF |
| secondary | #EFD6FF | #C684FF | #8E33FF | #5119B7 | #27097A | #FFFFFF |
| info | #CAFDF5 | #61F3F3 | #00B8D9 | #006C9C | #003768 | #FFFFFF |
| success | #D3FCD2 | #77ED8B | #22C55E | #118D57 | #065E49 | #ffffff |
| warning | #FFF5CC | #FFD666 | #FFAB00 | #B76E00 | #7A4100 | #1C252E |
| error | #FFE9D5 | #FFAC82 | #FF5630 | #B71D18 | #7A0916 | #FFFFFF |

Grey: 50 #FCFDFD, 100 #F9FAFB, 200 #F4F6F8, 300 #DFE3E8, 400 #C4CDD5, 500 #919EAB, 600 #637381, 700 #454F5B, 800 #1C252E, 900 #141A21. common black #000, white #FFF.

Mode-specific:
- Light: text primary #1C252E (grey800), secondary #637381 (grey600), disabled #919EAB (grey500); background paper #FFFFFF, default #FFFFFF, neutral #F4F6F8; action.active grey600.
- Dark: text primary #FFFFFF, secondary #919EAB, disabled #637381; background paper #1C252E, default #141A21, neutral #28323D; action.active grey500.
- Both: divider = grey500 @ 20% alpha; TableCell.border same; action hover/selected/focus/disabledBackground = grey500 @ 8/16/24/24% (disabled text @80%); shared.inputOutlined 20%, paperOutlined 16%, buttonOutlined 32%, inputUnderline 32% (all grey500 alpha).

## 6. Layouts

Core skeleton (`src/layouts/core/`):
- `LayoutSection` (`layout-section.tsx`): props `headerSection`, `sidebarSection`, `footerSection`, `children`, `cssVars`, `sx`. Renders `<div id="root__layout" class="layout__root">`. If a sidebar exists: `[sidebar] + <div.sidebarContainer flex column>{header}{children}{footer}</div>`; else header/children/footer stacked. Injects `GlobalStyles` on `body` with layout CSS variables (`layoutSectionVars` + `cssVars`).
- `HeaderSection` (`header-section.tsx`): styled MUI `AppBar` with `HeaderContainer` (MUI Container) and slots `topArea`, `leftArea`, `centerArea`, `rightArea`, `bottomArea`; `layoutQuery` breakpoint; `disableElevation`.
- `MainSection` (`main-section.tsx`): `styled('main')`, flex column. This is the only `<main>` landmark; no `id` on it, and `DashboardContent` (`layouts/dashboard/content.tsx`) is just a MUI `Container` (div) with padding from CSS vars, `maxWidth` 'lg' only when `settings.compactLayout` (default true), page content passes `maxWidth="xl"`.
- `classes.ts`: `layoutClasses` built with `createClasses('layout__root' ...)` (prefix `minimal`), used as CSS class hooks (`root, main, header, nav.{root,mobile,vertical,horizontal}, content, sidebarContainer`).
- `css-vars.ts`: layout CSS vars (header heights, nav widths, transition); `layouts/dashboard/css-vars.ts` adds `dashboardLayoutVars` and `dashboardNavColorVars(theme, navColor, navLayout)` (nav bg/text colors for 'integrate'/'apparent').

`DashboardLayout` (`layouts/dashboard/layout.tsx`), props `sx, cssVars, children, slotProps {header, nav{data}, main}, layoutQuery='lg'`:
- Uses settings (`navLayout`: 'vertical' | 'mini' | 'horizontal', `navColor`) and `useMockedUser` for role filtering.
- Header slots: `leftArea` = `MenuButton` (hidden at >= lg) + `NavMobile` + (horizontal only: Logo + VerticalDivider) + `WorkspacesPopover`; `rightArea` = `Searchbar` (searches navData), `LanguagePopover`, `NotificationsDrawer`, `ContactsPopover`, `SettingsButton`, `AccountDrawer`; `bottomArea` = `NavHorizontal` when horizontal; `topArea` = hidden info Alert.
- Sidebar: `NavVertical` (omitted when horizontal) with `isNavMini` and `onToggleNav` that flips `navLayout` between 'vertical' and 'mini' (via `NavToggleButton`). Content area gets left padding = `--layout-nav-vertical-width` or mini width at >= lg, animated with a theme transition.
- Main: `<MainSection>{children}</MainSection>`; footer null.

Nav item config shape:
- Defined in `layouts/nav-config-dashboard.tsx` as `export const navData: NavSectionProps['data']`, i.e. `{ subheader?: string; items: NavItemDataProps[] }[]`.
- `NavItemDataProps` (`components/nav-section/types.ts`): `path: string`, `title: string`, `icon?: string | ReactNode`, `info?: string[] | ReactNode` (e.g. `<Label>v...</Label>`), `caption?: string`, `disabled?`, `deepMatch?: boolean`, `allowedRoles?: string | string[]`, `children?: NavItemDataProps[]` (nested sub-items; example group "Group" -> Four/Five/Six).
- Icons: local `icon(name)` helper returns `<SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`}/>`; an `ICONS` map of ~27 svgs.
- `NavSectionProps` extends `<nav>` props plus `data`, `cssVars`, `slotProps` (rootItem/subItem/subheader/dropdown sx slots), `render {navIcon, navInfo}`, `checkPermissions(allowedRoles)`, `enabledRootRedirect`. Active state is a prop (`NavItemStateProps.active/open/disabled`); the type definitions suggest the items are `ButtonBase` with `RouterLink`, but the implementing files (`nav-section/vertical`, etc.) are empty in this copy so active-link/`aria-current` behavior cannot be verified here. `NavSectionProps` is typed as `ComponentProps<'nav'>` so the root is a `<nav>` element.
- Role filtering in layout: `canDisplayItemByRole = (allowedRoles) => !allowedRoles?.includes(user?.role)` passed as `checkPermissions`. (Note the logic is inverted relative to its name: it hides items whose allowedRoles include the user's role; treat as a template quirk.)
- Other nav-config files: `nav-config-account.tsx` (`_account` menu items), `nav-config-workspace.tsx` (`_workspaces`).

Mobile nav (`layouts/dashboard/nav-mobile.tsx`): MUI `Drawer` (temporary, default modal behavior from MUI: focus trap, Escape closes, backdrop click closes) with paper width `--layout-nav-mobile-width`; contents: Logo, `Scrollbar` > `NavSectionVertical` + `NavUpgrade`. Opened by `MenuButton` in header (visible below `lg`); open state via `useBoolean` in `DashboardLayout`. Closes automatically when `pathname` changes (effect; has an `eslint-disable-next-line react-hooks/exhaustive-deps`). Vertical sidebar `NavVertical` is shown from `lg` up (display none below) with Logo, `Scrollbar`, `NavSectionVertical`/`NavSectionMini`, `NavUpgrade`, and `NavToggleButton`.

Accessibility-relevant facts (grep of layouts/routes/pages/components/settings/nav-section for skip, aria-current, role=, tabIndex, focus()):
- No skip link anywhere. No `id` on `<main>` and no `tabIndex=-1`/focus move to h1 on route change; `useScrollToTop` only scrolls.
- Landmarks: `<main>` via `MainSection`; header is MUI `AppBar` (renders `<header>`); nav root typed `<nav>` (impl not on disk). No `aria-label` on landmarks visible in these files. Page heading is `<Typography variant="h4">` (renders `<h4>`), not an `h1`, in `BlankView`.
- Document title: React 19 `<title>` per page; no announcements.
- Search/popover/drawer widgets rely on MUI defaults.
- No `eslint-plugin-jsx-a11y` configured.
- Header contains many non-required demo widgets (language, contacts, notifications, workspaces, searchbar, settings drawer, account drawer) driven by `_mock` data.

## 7. Components (src/components, starter-vite-ts)
- animate: framer-motion helpers (motion-container, motion-viewport, motion-lazy = LazyMotion domMax, animate-border/count-up/logo/text, back-to-top-button); `variants/` and `scroll-progress/` missing.
- custom-popover: thin MUI Popover wrapper with arrow styling and `usePopover` hooks.
- file-thumbnail: file-type icon/preview thumbnail (+ use-file-preview).
- flag-icon: country flag icon component.
- hook-form: react-hook-form + MUI wrappers (details below).
- iconify: Iconify wrapper (details below).
- label: colored status chip (details below).
- loading-screen: LoadingScreen (linear progress) and SplashScreen (animated logo).
- logo: Logo link/SVG component.
- nav-section: types + index only; vertical/horizontal/mini implementations missing (layouts/nav-config-dashboard.tsx feeds it).
- progress-bar: nprogress top bar (styles.css) hooked to route changes.
- scrollbar: simplebar-react wrapper with styles.css.
- search-not-found: "no results for X" empty-state text.
- settings: config + types only; provider/drawer missing.
- svg-color: CSS-mask based colorable SVG icon.
(Full `vite-ts` additionally has table, custom-data-grid, custom-dialog, snackbar (sonner), upload, editor, chart, etc.; NOT in the starter.)

### iconify
- `components/iconify/icon-sets.ts` is a bundled map of about 224 icons (`'solar:xxx': {body: '<svg path>'}`), registered offline via `addCollection()` in `register-icons.ts` (`registerIcons()` runs once on first `<Iconify>` render; groups by prefix, 24px viewbox, carbon 32px).
- `Iconify` is typed to `IconifyName` (keys of icon-sets). For a name not in the bundle it `console.warn`s "currently loaded online" and @iconify/react falls back to the public Iconify API at runtime. grep found no hardcoded api.iconify.design calls and no custom API provider in src (only comments linking to icon-sets.iconify.design). So: offline as long as only registered names are used; any new icon must be added to icon-sets.ts or it hits the network.
- Wrapper passes `ssr`, `useId()` id, default width 20; adds no aria attributes itself (@iconify/react renders svg with aria-hidden="true" by default).

### label
`label.tsx` + `styles.tsx` (styled span `LabelRoot`, 24px high, 12px bold, radius 6px). Props: `variant` filled | outlined | soft (default) | inverted; `color` default | primary | secondary | info | success | warning | error | black | white; `startIcon/endIcon`; `disabled`. String children are `upperFirst`-ed. Plain `<span>` so text carries the status (not color only). Soft variant = palette.dark text on main@16% (dark mode: palette.light on main@16%); contrast results in section 10.

### nav-section
Only `types.ts` and barrel `index.ts` present (the barrel exports mini, utils, styles, vertical, components, horizontal that do not exist). Cannot be inspected; aria-current behavior unknown.

### settings drawer
Missing from the archive (section 0). Known from types/usages: SettingsDrawer takes `defaultSettings`; controls mode, contrast, direction, navLayout, navColor, primaryColor presets, compactLayout, fontFamily, fontSize; persisted to localStorage `app-settings`. Trigger: `layouts/components/settings-button.tsx` (IconButton with `aria-label="Settings button"` and an infinitely rotating framer-motion gear: `animate={{rotate:360}}` with `repeat: Infinity`, not reduced-motion aware).

### table / data-grid helpers
Not in the starter. In `vite-ts/src/components/table/` (useTable hook, TableHeadCustom with `sortDirection` plus visually hidden sort text, pagination, no-data, empty rows, skeleton, selected action) and `vite-ts/src/components/custom-data-grid/` (toolbar-core with QuickFilter/Export/Filter/Columns buttons, grid-actions-cell-item, toolbar-extend-settings). DataGrid theme overrides: `vite-ts/src/theme/core/components/mui-x-data-grid.tsx`. Starter package.json includes `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/x-tree-view` (^9.1.0, community).

### hook-form field components (`src/components/hook-form/`)
Files in starter: fields.tsx (`Field.*` namespace: Text, Select, MultiSelect, Autocomplete, Checkbox, MultiCheckbox, Switch, MultiSwitch, RadioGroup, Slider, Rating, DatePicker/TimePicker/DateTimePicker; full vite-ts adds Code, Editor, Phone, NumberInput, CountrySelect, Upload*), form-provider.tsx (`Form`), help-text.tsx, schema-utils.ts (zod 4 helpers, uses dayjs), rhf-*.tsx.
- `Form`: RHF `FormProvider` + `<form noValidate autoComplete="off" onSubmit>`; no `useForm` config inside. Consumers in vite-ts (sections/account/*.tsx etc.) call `useForm({...})` without `shouldFocusError`, so RHF default (true) applies.
- Error wiring: `Controller` `fieldState.error` -> `<TextField error={!!error} helperText={error?.message ?? helperText}>`. MUI TextField then renders the helper `<p id=...>` and sets `aria-describedby` and `aria-invalid` on the input (MUI auto-generates the id; RHFTextField does not pass one). The wrappers add no `role="alert"`/aria-live, so errors are tied to fields but not announced on submit.
- RHFSelect sets `labelId = ${name}-select` for `htmlInput.id` and inputLabel `htmlFor`. MultiSelect/Checkbox/Switch/Radio/Slider/Rating/Autocomplete (non-TextField ones) use `HelperText` (a `FormHelperText error`) with no id and no aria-describedby link; grep of hook-form for `aria-describedby`/`aria-invalid` returns zero hits. Checkbox/Switch only add fallback `aria-label` (`"${name} checkbox"`) when no label; RadioGroup uses `aria-labelledby`.
- RHFTextField and RHFAutocomplete force `autoComplete: 'new-password'` (disables autofill; conflicts with WCAG 1.3.5 for identity fields).
- Focus on first invalid field: RHF's `shouldFocusError` calls `field.ref.focus()`. RHFTextField/RHFSelect spread `{...field}` into MUI `TextField`, so `ref` lands on TextField's root `div`, not the `<input>`; `div.focus()` is a no-op. No `inputRef={field.ref}` and no `setFocus` anywhere in hook-form (grep). Net: focus does NOT move to the first invalid field. Needs `inputRef={field.ref}` (and equivalents for Select/Autocomplete) or an `onInvalid` handler plus error summary.

## 8. Data layer
- HTTP client: `axios` via `src/lib/axios.ts`: `axiosInstance` (baseURL `CONFIG.serverUrl` = `VITE_SERVER_URL ?? ''`, JSON header), response interceptor that logs and rethrows `Error(message)`, a `fetcher(url | [url, config])` GET helper (SWR-style), and an `endpoints` object with demo-only entries (chat, kanban, calendar, auth me/signIn/signUp, mail, post, product). The Bearer-token request interceptor is commented out.
- The starter has no SWR/TanStack Query dependency and mounts no fetch layer. The full `vite-ts` adds `swr` with `src/actions/*.ts` demo hooks (blog, calendar, chat, kanban, mail, product). TanStack Query would need adding (project rule) and `fetcher`/`endpoints` rewritten.
- Demo-only: everything in `src/_mock/` (_user, _blog, _calendar, _files, _invoice, _job, _order, _overview, _product, _tour, _others, _mock helpers, assets), `endpoints` entries, `auth/hooks/use-mocked-user.ts` (used by account-drawer, account-popover, nav-upgrade, dashboard layout), `layouts/components/{workspaces-popover,contacts-popover,language-popover,nav-upgrade}.tsx`, `pages/dashboard/one..six`, `sections/blank`, `nav-config-*.tsx` contents.
- Other libs in starter package.json: react-router 7 (`createBrowserRouter` in main.tsx), react-hook-form + @hookform/resolvers + zod 4, dayjs, es-toolkit, minimal-shared, nprogress, simplebar-react, framer-motion, @fontsource packages, @iconify/react, MUI lab / x-date-pickers / x-tree-view / x-data-grid, autosuggest-highlight. (Project AGENTS.md forbids x-date-pickers, x-tree-view, dayjs without approval.)

## 9. Auth scaffolding and clean removal
Present:
- `src/auth/`: `context/auth-context.tsx` (AuthContext), `context/jwt/` (EMPTY: AuthProvider and `action.ts` signOut missing), `guard/{auth-guard,guest-guard,role-based-guard,index}`, `hooks/{use-auth-context,use-mocked-user,index}`, `types.ts` (UserType, AuthContextValue), `utils/{error-message,index}`, `components/{form-divider,form-head,form-resend-code,form-return-link,form-socials,sign-up-terms}.tsx`, `view/jwt/` (empty).
- `src/pages/auth/jwt/` (empty), `src/layouts/auth-split/` (layout/content/section), `src/layouts/components/{sign-in-button,sign-out-button,account-button,account-drawer,account-popover}.tsx`, `src/layouts/nav-config-account.tsx`.
- Routes/config: `src/routes/sections/auth.tsx` (`/auth/jwt/sign-in|sign-up` in GuestGuard + AuthSplitLayout), `src/routes/sections/dashboard.tsx` (AuthGuard unless `CONFIG.auth.skip`), `src/routes/sections/index.tsx` (`...authRoutes`; `/` redirects to `CONFIG.auth.redirectPath` = /dashboard), `src/routes/paths.ts` (`paths.auth.{amplify,jwt,firebase,auth0,supabase}`), `src/global-config.ts` (`auth{method,skip,redirectPath}` plus firebase/amplify/auth0/supabase blocks reading VITE_* env), `src/app.tsx` (wraps everything in `<AuthProvider>` from `src/auth/context/jwt`), `lib/axios.ts` `endpoints.auth`.
- Outside imports of auth: app.tsx (AuthProvider), sign-out-button.tsx (useAuthContext, signOut), account-drawer / account-popover / nav-upgrade / dashboard layout (useMockedUser), routes/sections/{auth,dashboard}.tsx (guards).

Clean removal:
1. Delete `src/auth/{context/jwt,view,components}`, `src/pages/auth`, `src/routes/sections/auth.tsx`, `src/layouts/auth-split`, `layouts/components/{sign-in-button,sign-out-button}.tsx`.
2. Remove the `AuthProvider` import/wrapper from `app.tsx`; remove `authRoutes` from `routes/sections/index.tsx`; drop AuthGuard and the `CONFIG.auth.skip` branch in `routes/sections/dashboard.tsx` (or swap in the new provider's guard).
3. Trim `paths.auth` in routes/paths.ts, the provider config blocks in global-config.ts, and `endpoints.auth` in lib/axios.ts.
4. Replace `useMockedUser` usages (account-drawer, account-popover, nav-upgrade, dashboard/layout) with real `/api/me` data; delete `auth/hooks/use-mocked-user.ts` and `_mock/_user`.
5. Keep/adapt `auth/context/auth-context.tsx`, `types.ts`, `hooks/use-auth-context.ts`, `guard/*` as a provider-agnostic seam (only `signInPaths` map in auth-guard.tsx is provider-specific).

## 10. Accessibility observations
Method: WCAG 2.x relative luminance; script `scratchpad/contrast.py`, full per-pair output `scratchpad/contrast_out.txt`. Alpha colors composited over the surface they sit on (grey500 #919EAB with the stated alpha). Light surfaces: paper = default = #FFFFFF, neutral #F4F6F8. Dark: paper #1C252E, default #141A21, neutral #28323D. Dark scheme does not change main/contrastText, so button results are identical in both modes. Thresholds: text 4.5, UI/borders 3.

### Buttons (contrastText on main)
| color | fg | bg | ratio | verdict |
|---|---|---|---|---|
| primary | #FFFFFF | #00A76F | 3.11 | FAIL (<4.5) |
| secondary | #FFFFFF | #8E33FF | 5.16 | ok |
| info | #FFFFFF | #00B8D9 | 2.37 | FAIL |
| success | #FFFFFF | #22C55E | 2.28 | FAIL |
| warning | #1C252E | #FFAB00 | 8.18 | ok |
| error | #FFFFFF | #FF5630 | 3.17 | FAIL |

Hover bg (palette.dark): primary 5.41, secondary 9.67, info 5.79, error 6.56 ok; success 4.22 FAIL; warning 3.87 FAIL (white-ish/dark text on #B76E00 for warning).

### Body and secondary text
| pair | ratio | verdict |
|---|---|---|
| light text.primary #1C252E on #FFFFFF | 15.52 | ok |
| light text.primary on neutral #F4F6F8 | 14.32 | ok |
| light text.secondary #637381 on #FFFFFF | 4.88 | ok |
| light text.secondary on neutral #F4F6F8 | 4.51 | ok (barely) |
| light text.secondary on action.selected (grey500@16% over white) | 4.24 | FAIL |
| light text.secondary on action.hover (@8%) | 4.55 | ok |
| light text.disabled / placeholder #919EAB on #FFFFFF | 2.73 | FAIL (inputPlaceholder opacity 1, uses text.disabled) |
| light text.disabled on neutral | 2.52 | FAIL |
| dark text.primary #FFFFFF on paper #1C252E | 15.52 | ok |
| dark text.primary on default / neutral | 17.51 / 13.01 | ok |
| dark text.secondary #919EAB on paper | 5.68 | ok |
| dark text.secondary on default | 6.41 | ok |
| dark text.secondary on neutral | 4.76 | ok |
| dark text.secondary on action.selected (@16% over paper) | 4.35 | FAIL |
| dark text.disabled #637381 on paper / default / neutral | 3.18 / 3.58 / 2.66 | FAIL (disabled text is WCAG-exempt, placeholders are not) |

Palette main used as text/link/outlined button/icon (4.5 text, 3 UI):
- Light on white: primary 3.11 (FAIL text), secondary 5.16 ok, info 2.37 FAIL, success 2.28 FAIL, warning 1.90 FAIL (also FAIL UI 3:1), error 3.17 FAIL text.
- Dark on #1C252E: primary 4.99, info 6.54, success 6.81, warning 8.18, error 4.90 ok; secondary 3.01 FAIL for text (ok for UI 3:1).

Soft Label (palette.dark text on main@16% over surface): light mode success 3.69 and warning 3.61 FAIL; primary 4.53 (barely), secondary 7.59, info 5.01, error 5.43 pass. Dark-mode soft labels all pass (5.36 to 8.67).

### Divider / border visibility (grey500 with alpha)
| element | alpha | light on white | light on neutral | dark on paper | dark on default | dark on neutral |
|---|---|---|---|---|---|---|
| divider, TableCell border, input outlined border | 20% | 1.19 | 1.18 | 1.40 | 1.39 | 1.39 |
| paper outlined border | 16% | 1.15 | 1.14 | 1.30 | 1.29 | 1.29 |
| outlined button border (color inherit) / input underline | 32% | 1.33 | 1.30 | 1.77 | 1.77 | 1.71 |

All FAIL the 3:1 non-text bar. Dividers are decorative (1.4.11 normally does not apply), but the default text-field outline (about 1.2:1 light) and inherit outlined button border are real control boundaries; the focused text-field outline switches to text.primary (fine). Palette-colored outlined buttons use `currentColor@48%` border (about 3:1 at best), but the label text is the identifying part.

### Every pair under threshold (script summary)
Text <4.5: contrastText on main for primary (3.11), info (2.37), success (2.28), error (3.17); hover contrast for success (4.22) and warning (3.87); main-as-text on white for primary, info, success, warning, error; secondary main-as-text on dark paper (3.01); light-mode soft labels success and warning; text.disabled/placeholder in both modes; text.secondary on selected rows in both modes.
UI <3: input-outlined, paper-outlined, button-outlined, input-underline borders in both modes (1.14 to 1.77); info/success/warning main against white (2.37, 2.28, 1.90) for outlined controls, focus indicators, checkbox/radio/switch in those colors.

### Focus ring and motion
- No custom focus ring: grep of `theme/core` and `global.css` finds no `:focus-visible` or `outline` rules. Buttons, IconButtons, Tabs use MUI defaults (ButtonBase `outline: 0` with `action.focusVisible`/ripple; Tabs set `disableRipple: true`). The visible focus cue is the faint grey500@24% (`action.focus`) background, about 1.2:1, which fails WCAG 2.4.7 / 1.4.11 expectations. Text fields: focused outline = `text.primary` (15:1, good), error state = error main. Links: browser default.
- Reduced motion: no `prefers-reduced-motion` media query, no `useReducedMotion`, no framer-motion `MotionConfig reducedMotion="user"` anywhere in starter or vite-ts src (grep). `MotionLazy` is only `LazyMotion strict features={domMax}`. Always-on animations: settings gear rotates infinitely, whileHover/whileTap scale on buttons, animated splash logo, nprogress. MUI CSS transitions (ripple, collapse, drawer) are not disabled; `disableTransitionOnChange` only suppresses transitions during color-scheme switch. Fix needed: `<MotionConfig reducedMotion="user">`, a global `@media (prefers-reduced-motion: reduce)` rule, remove the infinite rotation.
- Other: index.html has `lang="en"` and static `<title>Minimal UI Kit</title>`; no route-change title/focus management (app.tsx only does `window.scrollTo(0,0)`); no skip link seen.

## 11. Dependency audit (starter-vite-ts package.json)

Grep of starter `src/` (213 files) for imports. "Demo" = only used by demo/showcase code; "infra" = template plumbing (theme, layout, auth, hook-form) that is not demo content but is only needed if you keep that plumbing.

Runtime dependencies:
- @emotion/react, @emotion/styled: required by MUI. Keep. (We have both.)
- @emotion/cache: used only by `theme/with-settings/right-to-left.tsx` (RTL support). Remove unless RTL needed.
- @mui/stylis-plugin-rtl, stylis: RTL only (stylis has no direct import at all; it is a peer of the RTL plugin). Remove both (and @types/stylis).
- @fontsource-variable/dm-sans, inter, nunito-sans, public-sans, @fontsource/barlow: all five imported only in `src/global.css` for the theme font picker in settings drawer. Our AGENTS.md says system font stack, no external fonts. Remove all.
- @hookform/resolvers: ZERO imports in starter src (used by the full vite-ts sibling's zodResolver). Needed only if we adopt react-hook-form + zod forms; add then. Not removable from "unused" standpoint, but unused in starter.
- @iconify/react: used by `components/iconify/*` (Iconify wrapper, register-icons for offline icons). Infra. Remove; we use @mui/icons-material.
- @mui/lab: referenced only as `import type {} from '@mui/lab/themeAugmentation'` in `theme/extend-theme-types.d.ts` plus theme component overrides. Remove (9.0.0-beta.3 in lockfile). Not used by us.
- @mui/material: keep (9.0.1 in lock vs ours 9.4.0).
- @mui/x-data-grid: only the themeAugmentation type import in extend-theme-types.d.ts; no DataGrid used in starter. We already use it. Keep (ours is the real use).
- @mui/x-date-pickers: used by `components/hook-form/rhf-date-picker.tsx` and theme augmentation. Our AGENTS.md forbids it without approval. Remove (drops dayjs coupling).
- @mui/x-tree-view: theme augmentation only. Remove (forbidden by AGENTS.md).
- autosuggest-highlight (+@types): ZERO imports. Remove.
- axios: used only by `lib/axios.ts` (and auth). We use fetch via lib/api.ts. Remove.
- dayjs: used in `utils/format-time.ts`, `hook-form/schema-utils.ts`, rhf-date-picker. Remove (forbidden w/o approval); format-time util would need rewriting with Intl.
- es-toolkit: 6 files (rhf-autocomplete, rhf-select, label, three layouts; mostly `merge`/`isEqual`-style helpers). Infra utility. Remove with the layouts if not porting those files; otherwise tiny and harmless.
- framer-motion: 14 files, all in `components/animate/*`, role-based-guard, loading screen etc. Decorative animation. Remove (respects reduced-motion concerns; we do not need it).
- minimal-shared: 46 files (hooks like useBoolean/usePopover/useSetState, varAlpha, mergeClasses). Heavily wired into template components. Keep only if we port template components that use it; for a basic app we can avoid it (use React state). Safe to drop if we do not copy those components; otherwise it is a necessary transitive need.
- nprogress (+@types): `progress-bar.tsx`, `routes/hooks/use-router.ts`. Remove (route progress bar is cosmetic).
- react, react-dom: keep.
- react-hook-form: 10 files in `components/hook-form/*`. Keep ONLY if we want RHF forms (our forms currently use plain controlled state in useSoftwareEditor). Optional for "forms" - recommended only with approval since AGENTS.md forbids unrequested packages.
- react-router: used in 10 files (main.tsx, routes/*). We use react-router-dom 7.18.4. In v7 `react-router-dom` just re-exports `react-router`; either is fine. Keep ours.
- simplebar-react: `components/scrollbar/*` (custom scrollbar). Remove (native scrolling is better for a11y).
- zod: only `hook-form/schema-utils.ts` in starter. Optional; add with RHF if wanted.

Dev dependencies:
- Prettier, eslint-plugin-perfectionist, eslint-plugin-import, eslint-import-resolver-typescript, eslint-plugin-unused-imports, eslint-plugin-react: template style tooling (import/prop sorting). Not required; ours uses jsx-a11y, react-hooks, react-refresh. Do not adopt perfectionist (reorders imports/props, conflicts with our code layout).
- vite-plugin-checker: runs tsc/eslint overlay in dev. Optional.
- @vitejs/plugin-react 6, vite 8, typescript-eslint 8, @eslint/js 9, eslint 9, globals, @types/*: same family as ours; keep ours.
- eslint-plugin-react-hooks 7: ours too.

Safe-to-remove summary for "dashboard + forms + tables + dark mode": everything in the lists above marked Remove. Dark mode in the template lives in `theme/` + `components/settings` (uses minimal-shared + cookie/localStorage); that does not need any extra package. Our app already has dark mode via MUI cssVariables + colorSchemes + `useColorScheme` (theme/ColorModeToggle.tsx). Note: our AGENTS.md still says "light mode only, no color-mode toggle", so the existing toggle conflicts with that doc; flag for the owner.

## 12. Version compatibility

Premise check: the "v7 to v9" premise does NOT hold. Both projects are already on MUI v9. Starter lockfile: @mui/material 9.0.1, @mui/lab 9.0.0-beta.3, @mui/x-data-grid 9.1.0, react-router 7.15.0, typescript 5.9.3. Ours (client/package-lock.json): @mui/material 9.4.0, @mui/x-data-grid 9.15.0, react-router 7.18.4, typescript 6.0.3, vite 8.3.2. The "7.7.0" in the starter name is the Minimal kit version, not MUI.

Major-version differences (starter vs ours):
- typescript: ^5.9.3 vs ~6.0.2 (only real major difference).
- globals: ^16.5.0 vs ^17.12.0.
- @types/node: ^25.6.2 vs ^24.19.1.
- Package swap, not a version diff: react-router (^7.15.0) vs react-router-dom (^7.18.4). Same major; v7 consolidated, react-dom package re-exports.
- Same major: @mui/material 9, @mui/x-data-grid 9, react 19, vite 8, @vitejs/plugin-react 6, zod 4 (starter only), eslint 9 (both, pinned; AGENTS.md forbids v10 until jsx-a11y supports it), typescript-eslint 8, eslint-plugin-react-hooks 7, @emotion 11.
- Only in starter: @mui/lab 9.0.0-beta.3 (beta; peer ranges may lag minor versions of material 9.4), x-date-pickers 9.1, x-tree-view 9.1 (our x-data-grid is 9.15; mixing X packages at different minors is best avoided if ever added).
- Only in ours: @tanstack/react-query 5, @mui/icons-material 9.4, eslint-plugin-jsx-a11y, eslint-plugin-react-refresh.
- Starter `build` is `tsc && vite build` with a single tsconfig; ours is `tsc -b` with tsconfig.app.json (verbatimModuleSyntax, erasableSyntaxOnly, noUnusedLocals/Parameters, `@` alias). Starter uses `src/...` absolute imports; ours uses `@` alias. Ported template files need their imports rewritten, and `erasableSyntaxOnly` forbids TS enums/parameter properties/namespaces if any template file uses them.
- Engines: starter requires node >=22.12; both on Vite 8.

Guides consulted: MUI "Upgrade to v9" (covers v7 to v9 directly; there is no separate v8 Material guide in practice) and MUI X "Data Grid v8 to v9". Breaking changes and how they hit OUR client/src:

Material v9 (all already accommodated because the app compiles/runs on 9.4):
- Removed deprecated `components`/`componentsProps`, `PaperProps`, `TransitionProps`, `inputProps`, `InputProps`, `InputLabelProps`: our code already uses `slotProps` everywhere: components/FormSelectField.tsx, features/software/components/SoftwareEditDialog.tsx (`slotProps.transition.onEntered`, `htmlInput.maxLength`, `inputLabel.shrink`), layouts/SideMenuMobile.tsx (`slotProps.paper`), features/software/components/SoftwareGridToolbar.tsx (htmlInput/inputLabel). Compatible.
- System props removed from Box/Stack/Typography/Link etc.: our code uses `color="text.secondary"` / `color="text.primary"` on Typography and Link in layouts/Header.tsx, layouts/SideMenu.tsx, layouts/SideMenuMobile.tsx, pages/DashboardPage.tsx and pages/SoftwarePage.tsx. Not verified whether v9 still accepts `color` as a Typography/Link prop (the build passes on 9.4, so it type-checks). Check these spots visually when touching them; `sx={{ color: ... }}` is the safe form.
- Grid: `GridLegacy` removed; new Grid uses `size={{...}}`. Our code does not use Grid at all. Template vite-ts forms use new `Grid size=`, compatible.
- Dialog/Modal `disableEscapeKeyDown` removed: we do not use it (SoftwareEditDialog.tsx).
- ButtonBase/Menu/Tabs/Stepper behavior changes (nativeButton prop, roving tabindex, label to div in select TextField): FormSelectField.tsx (TextField select) is affected only visually (InputLabel renders a div); layouts/MenuContent.tsx uses ListItemButton with React Router NavLink (`component={NavLink}`); if the element type is non-native-button, v9 may ask for `nativeButton={false}`. Check that file when upgrading ListItemButton usage; MenuIcon/MenuButton use IconButton (fine).
- ListItemIcon min-width 56 to 36px: layouts/MenuContent.tsx.
- Icon `*Outline` exports removed in favor of `*Outlined`: we use EditOutlined, ViewColumnOutlined, DarkModeOutlined, LightModeOutlined, AppsOutlined (already the Outlined names). Template uses Iconify, no conflict.
- `MuiTouchRipple` removed from theme component types: theme/customizations/inputs.tsx sets `disableTouchRipple/disableRipple` on MuiButtonBase defaultProps (fine; no MuiTouchRipple key).
- Deprecated CSS class keys removed from theme `styleOverrides` (Button, Chip, Alert, Dialog, Select, etc.): theme/customizations/{inputs,dataDisplay,feedback,navigation,surfaces} use only `root`/`primary`/`paper`-style keys; MuiSelect and MuiAlert/MuiChip overrides should be rechecked if they use legacy keys like `outlined`/`filledSuccess`; the app compiles so type-checking passes.
- TablePagination number formatting: Data Grid footer, see below.
- Browser targets raised (Chrome 117, Safari 17): fine.
- Divider `light`, Typography `paragraph`, Autocomplete tag API: not used.
- Template code patterns that might CONFLICT with ours: the starter theme is built on `theme/core` with its own `createTheme` wrapper, `extendTheme`-like tokens (`theme.vars.palette.grey['500Channel']`, `varAlpha`), settings context with cookies, and custom module augmentations (extend-theme-types.d.ts includes lab/tree-view/data-grid augmentation, custom `variant="soft"` on Button, `loading` prop on Button). Copying those component files would require the augmentation file and custom palette channels; our theme (theme/index.ts) has plain `colorSchemes` with a `DataGrid` palette override and `colorSchemeSelector: 'class'`, so channel vars like `grey['500Channel']` do not exist and would be undefined. Template uses `<title>` in pages (React 19 metadata) whereas ours uses PageHeader.tsx for document title/focus (AGENTS.md a11y requirement). Template routes use lazy `src/routes/sections` with its own `RouterLink`/`useRouter` wrappers around react-router; ours uses `createBrowserRouter` with route handles (app/router.tsx, app/routeHandle.ts), Providers.tsx with QueryClientProvider.

Data Grid v9 (x-data-grid 9.15, ours):
- `experimentalFeatures.charts` removed: not used.
- locale text `filterPanelColumns` renamed to `filterPanelColumn` and pagination numbers formatted by default: we use no localeText overrides. Applies to features/software/components/SoftwareGrid.tsx and pages/DashboardPage.tsx footers (visual only).
- Actions cell no longer has `menu` role; actions are plain buttons: SoftwareGrid.tsx uses `GridActionsCell` + `GridActionsCellItem` (the v9 composable API), so already aligned.
- DOM structure change (`.MuiDataGrid-virtualScrollerContent` now direct child; use `virtualScrollerRenderZone` for rows): theme/customizations/dataDisplay.tsx targets `.MuiDataGrid-cell`, `.MuiDataGrid-row:hover`, headers only, not those containers, so safe.
- Requires @mui/material ^7.3 or ^9: satisfied.
- Our DataGrid code already uses v8/v9 style: `showToolbar` plus `slots.toolbar` with composable `Toolbar`, `ToolbarButton`, `QuickFilter`, `QuickFilterControl` (with `render` prop and `slotProps.htmlInput`), `ColumnsPanelTrigger`, `FilterPanelTrigger` in SoftwareGridToolbar.tsx; `valueGetter(value)` / `valueFormatter(value)` new signatures (value first) in SoftwareGrid.tsx and DashboardPage.tsx; `disableRowSelectionOnClick`; `slotProps.noRowsOverlay`. All v8+ style. `autoHeight` and `density` are still accepted in 9.x (guide does not list them as removed).
- Template conflicts: starter theme has `MuiDataGrid` overrides using Minimal's tokens (and `@mui/x-data-grid/themeAugmentation` types); we do not need them. Template's tables are plain MUI `Table` components (see section 13), not Data Grid; AGENTS.md allows plain Table for small static lists and Data Grid for sortable/filterable lists.

Other notes:
- TypeScript 6.0 (ours) vs 5.9 (template): template files may rely on lax settings (`any` in comparators, e.g. `comparator: (a: any, b: any)` in user-list-view.tsx); our strict config plus AGENTS.md "no any without comment" means those need cleanup. TS 6 deprecates some legacy options (e.g. baseUrl-style resolution, `moduleResolution: node`); template tsconfig uses `baseUrl`-style paths for `src/*`, which should not be copied. Our tsconfig.app.json already uses paths for `@`.
- react-router vs react-router-dom: template imports from `react-router`; ours from `react-router-dom`. Both resolve to the same v7 code; template files copied over need import-line edits only if we want consistency (or no change; `react-router` is a dependency of react-router-dom and is installed at 7.18.4).
- zod 4: template uses zod 4 syntax (`z.string().min(1, { error: '...' })`, `import * as z from 'zod'`), not zod 3 `message`. If adopting, the `@hookform/resolvers` ^5.2 `zodResolver` supports zod 4. Not currently a dependency of ours.
- eslint 9: both on 9.39.x, compatible with jsx-a11y; template `eslint.config.mjs` adds perfectionist/import/unused-imports rules which would produce lint failures on our existing code. Do not merge that config.
- vite 8: both. Starter uses vite-plugin-checker 0.13; ours has none.

## 13. Full-featured sibling vite-ts: list and create/edit patterns

File layout (users):
- Route config: `src/routes/sections/dashboard.tsx` lazy-loads page components for `user/list`, `user/new`, `user/:id/edit`; path helpers in `src/routes/paths.ts` (`paths.dashboard.user.list/new/edit(id)`).
- Thin pages: `src/pages/dashboard/user/list.tsx`, `new.tsx`, `edit.tsx`. Each renders a `<title>` and one view component. `edit.tsx` reads `id` via the `useParams` wrapper and looks the user up in mock data (`_userList`) then passes it to the view.
- Views (`src/sections/user/view/`): `user-list-view.tsx`, `user-create-view.tsx`, `user-edit-view.tsx` (index.ts barrel). Each wraps content in `DashboardContent` and `CustomBreadcrumbs` (heading, links, optional action button, optional backHref).
- Section components (`src/sections/user/`): `user-table-row.tsx`, `user-table-toolbar.tsx`, `user-table-filters-result.tsx`, `user-create-edit-form.tsx`, `user-quick-edit-form.tsx` (dialog form).
- Shared building blocks: `src/components/table/*` (use-table hook, TableHeadCustom, TablePaginationCustom, TableNoData, TableEmptyRows, TableSelectedAction, TableSkeleton, utils), `src/components/hook-form/*` (Form wrapper, Field.* RHF-bound inputs, schema-utils), custom-dialog (ConfirmDialog), custom-popover, label, snackbar toast, scrollbar, iconify.

List page pattern (plain MUI Table, not Data Grid):
- A `Card` holds: status `Tabs` (each tab has a count `Label` chip) as a quick filter; `UserTableToolbar` (name search `TextField`, multi-select role `Select`, overflow menu); `UserTableFiltersResult` (chips for active filters plus clear, shown when filters are set); then a `Box` containing `TableSelectedAction` (shown when rows selected, with bulk delete), `Scrollbar` > `Table` with `TableHeadCustom` (headCells array of id/label/width, sort handler, select-all checkbox), `TableBody` of `UserTableRow`s, `TableEmptyRows` (pads to constant height), `TableNoData`; finally `TablePaginationCustom` (page, rows per page, dense toggle).
- State is entirely client-side: `useTable()` (page, rowsPerPage, order, orderBy, selected ids, dense), `useSetState` for filters, `useState` for data. An `applyFilter` function does stable sort via `getComparator`, then filters by name/status/role, then slice for the page. Real data would be swapped for a query hook.
- Row component: Checkbox, avatar+name+email (name links to edit), cells, status `Label`, a quick-edit pencil (opens `UserQuickEditForm` dialog) and a `CustomPopover` with Edit (router link) and Delete (opens `ConfirmDialog`). Row owns its dialog/popover open state via `useBoolean`/`usePopover`.
- Page header action "Add user" is a `Button` with `RouterLink` to the create path.

Create/edit form pattern:
- One shared component `UserCreateEditForm` takes optional `currentUser`; absent means create. Used by both `user-create-view.tsx` and `user-edit-view.tsx`.
- Zod schema (`UserCreateSchema`, zod 4) defined in the same file; `useForm` with `zodResolver`, `mode: 'onSubmit'`, `defaultValues`, and `values: currentUser` so editing pre-fills and re-syncs.
- Layout: `Form` (RHF FormProvider + `<form noValidate>`) > MUI `Grid container` with two columns (`size={{ xs: 12, md: 4 }}` avatar/status switches Card; `size={{ xs: 12, md: 8 }}` fields Card). Fields sit in a CSS grid `Box` (1 column on xs, 2 on sm) of `Field.Text`, `Field.Phone`, `Field.CountrySelect`. Fields are RHF `Controller` wrappers that show error and helper text from form state (rhf-text-field.tsx etc., plus rhf-select, rhf-autocomplete, rhf-checkbox, rhf-radio-group, rhf-switch, rhf-date-picker, rhf-upload).
- Submit: `handleSubmit(async)` (fake delay), `reset()`, success `toast`, `router.push` to the list; submit `Button type="submit"` with `loading={isSubmitting}`; label switches between "Create user" and "Save changes". Edit mode also shows status Label, ban switch (raw `Controller`) and a Delete button.
- Quick edit variant (`user-quick-edit-form.tsx`) reuses the same field components inside a Dialog.

Relevance to our app: the closest equivalents are our SoftwarePage + SoftwareGrid (Data Grid with composable toolbar) + SoftwareEditDialog (controlled-state form dialog via useSoftwareEditor), and NewRequestPage (stub). The sibling's patterns that would port cleanly are: thin page + view split, shared create/edit form with optional entity, schema-driven validation (needs zod + RHF + resolvers, not currently dependencies), ConfirmDialog for deletes, and TableNoData/empty state. Patterns that conflict: Iconify, minimal-shared hooks, custom Scrollbar (simplebar), `Label`/`variant="soft"` and custom palette channels, `<title>` per page (ours uses PageHeader), and mock-data in pages.

## Surprising or risky

1. **Incomplete archive.** The theme component overrides and mixins (`theme/core/components`, `theme/core/mixins`), the whole settings provider and drawer, `nav-section` implementations, the JWT auth provider and views, and some animate/layout folders are empty in the starter. `theme/core/components` and `mixins` exist only in `vite-ts`. The settings and nav-section implementations are missing everywhere, so we cannot inspect their keyboard or `aria-current` behavior.
2. **MUI major version premise was wrong.** Template and our app are both MUI 9. Only TypeScript (5.9 vs 6.0), `globals` and `@types/node` differ by major.
3. **Accessibility defects in the default theme** (section 10). White text on primary #00A76F is 3.11:1 (fails). Info, success and error main with white text also fail. Placeholder text is about 2.7:1. Input and button borders are about 1.2 to 1.8:1. There is no custom focus ring; the focus cue is a faint 1.2:1 background. No `prefers-reduced-motion` handling anywhere, and the settings gear rotates forever. Adopting the palette as is would break our WCAG 2.1 AA requirement.
4. **Form wrappers do not move focus to the first invalid field.** `field.ref` lands on the TextField root div, not the input. Errors are tied to fields via helperText, but not announced, and non-TextField wrappers have no `aria-describedby`/`aria-invalid`. The wrappers also force `autoComplete="new-password"`.
5. **No skip link, no focus-to-h1 on route change, and page headings are `h4`.** Our PageHeader/breadcrumb work is ahead of the template here.
6. **Template ESLint config conflicts with ours.** `perfectionist/sort-imports` is an error, with line-length ordering. It would flag existing code, and it lacks `jsx-a11y`. Do not merge it. Template Prettier uses printWidth 100 and tsconfig uses `baseUrl`; ours uses an `@` alias and stricter flags (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`).
7. **Iconify is offline only for the ~224 registered icons.** Any other icon name silently falls back to the public Iconify API at runtime (network, privacy and CSP concern). We use `@mui/icons-material` and don't need it.
8. **Forbidden-by-AGENTS.md dependencies are baked in.** `@mui/x-date-pickers`, `@mui/x-tree-view`, `dayjs`, external-font packages (@fontsource) and `@mui/lab` (beta) are all part of the template infrastructure, and the form fields rely on date pickers and dayjs.
9. **`minimal-shared` is woven through the template** (46 files). Porting layout or component files drags it in, along with custom palette channel vars (`grey['500Channel']`) that our theme does not define.
10. **Quirk in the starter:** `canDisplayItemByRole` in `layouts/dashboard/layout.tsx` has inverted logic (hides items whose `allowedRoles` include the user's role). Do not copy it for admin gating.
11. **Pre-existing doc/code mismatch in our app:** AGENTS.md says light mode only with no toggle, but `client/src/theme/ColorModeToggle.tsx` exists and `useColorScheme` is used. Flag for the owner.
12. **Dark mode flash:** the template has no `InitColorSchemeScript`, so dark users can see a light flash on load.
