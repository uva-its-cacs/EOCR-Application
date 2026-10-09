# Minimal UI template addendum

Supplements `template-report.md` (written from an incomplete archive). Covers only the parts that were missing. Template: `C:\t\minimal\Minimal_TypeScript_v7.7.0\starter-vite-ts` (and `vite-ts`); paths are relative to its `src/` unless stated. Read-only; nothing was copied or modified.

**Corrections to the earlier report:** section 0 ("empty folders") is obsolete: in the complete copy no directory under either `src/` is empty. The palette, typography and section 10 contrast findings stand unchanged (section 1e below).

## Empty-folder verification (answers the first request)

Script walked every directory under both `src` trees:

| Tree | File count | Empty directories |
|---|---|---|
| starter-vite-ts/src | 331 (matches expected) | none |
| vite-ts/src | 1424 (matches expected) | none |

No directory in either tree is still empty.

Template paths relative to `starter-vite-ts/src/`. IMPORTANT: unlike the old report (section 0), the starter copy NOW contains `theme/core/components/` (46 files + index.ts), `theme/core/mixins/` (6 files), `components/settings/context/` (4 files) and `components/settings/drawer/` (11 files). `vite-ts` differs only in `theme/theme-provider.tsx` (adds `useTranslate` / `localeComponents`). Old section 0 claims about these dirs are obsolete. 

## 1. Theme

### 1a. theme/core/components (files)
accordion, alert, appbar, autocomplete, avatar, backdrop, badge, breadcrumbs, button-fab, button-group, button-icon, button-toggle, button, card, checkbox, chip, dialog, drawer, form, link, list, menu, mui-x-data-grid, mui-x-date-picker, mui-x-tree-view, pagination, paper, popover, progress, radio, rating, select, skeleton, slider, stack, stepper, svg-icon, switch, table, tabs, text-field, timeline, tooltip, plus `index.ts`.
`index.ts` spreads about 45 fragments into one `components: Components<Theme>`. `button.tsx` also exports MuiButtonBase; `form.tsx` exports FormLabel/InputLabel/FormControl/FormHelperText/FormControlLabel; `text-field.tsx` exports OutlinedInput/FilledInput/Input/TextField and helper style objects reused by the date picker.

### 1b. How overrides are structured
- One file = one MUI component family, exporting a `Components<Theme>` fragment (for example `export const button = { MuiButton, MuiButtonBase }`). `create-theme.ts` puts the merged result in `baseTheme.components`.
- Same banner layout in each file: type-augmentation exports (new colors, sizes, variants such as `soft`, `black`, `white`, `xLarge`, merged in `theme/extend-theme-types.d.ts`), then "Variants" arrays, then "Components" with `defaultProps` and `styleOverrides`.
- Styling is nearly all MUI v9 `variants: [{ props: (p) => ..., style: ({theme}) => ... }]` inside `styleOverrides.root`, generated per color key by mapping over `colorKeys.palette` (primary..error) and `colorKeys.common` (black/white). Colors use CSS vars (`theme.vars.palette.*`) and `varAlpha(channel, opacity)` from `minimal-shared`; dark mode via `theme.applyStyles('dark', ...)`.
- Shared tokens: `theme.vars.opacity.*` (opacity.ts: soft bg .16, soft hover .32, outlined border .48, filled commonHover .72, inputPlaceholder 1, inputUnderline .32, switchTrackDisabled .48), `theme.vars.palette.shared.*` (input/paper/button outlined borders), `theme.vars.customShadows.*`, `theme.mixins.*`.
- Mixins `filledStyles` / `softStyles` / `menuItemStyles` / `paperStyles` are consumed by button, chip, pagination, menu, autocomplete, data grid.
- defaultProps changes worth knowing: Button `color:'inherit'`, `disableElevation`; Link `underline:'hover'`; Tabs `variant:'scrollable'`, `textColor/indicatorColor:'inherit'`; Tab `disableRipple`; TextField `variant:'outlined'`; FormHelperText `component:'div'`; DataGrid native select, skeleton loading overlay, custom inline-SVG icon slots.

### 1c. Overrides that touch focus, outlines, borders, motion
Focus / outlines:
- NO file sets `outline`, `:focus-visible`, `focusVisible` or `disableFocusRipple` (grep of core/components, mixins, global.css: zero hits). The template keeps MUI defaults, so the visible focus cue on the ButtonBase family stays `action.focus` (grey500@24%, 1.23:1 vs white, FAIL). Nothing removes outlines, so a global `:focus-visible` rule of ours can be layered without fighting overrides.
- `text-field.tsx` `outlinedInputStyles.root`: focused non-error outline color becomes `text.primary` (15.5:1, good); disabled becomes `action.disabledBackground`. FilledInput uses `disableUnderline: true` with bg grey500@8%, hover/focus @16%, so filled inputs have no border and focus is signalled by a bg shift only (weak).
- `form.tsx`: unshrunk InputLabel color is `text.disabled` (2.73:1 FAIL); shrunk+focused label `inherit`; FormLabel focused `text.secondary`.
- `tabs.tsx`: Tab `disableRipple: true`, no focus style; selected = weight + indicator.
- `mui-x-data-grid.tsx`: does NOT override cell/header focus outline (grid default remains), but `cell:hover` sets `color: primary.main` (3.11 on white, 2.70 on a selected row, FAIL). Editing cell bg primary@8%.
- Menu / autocomplete options (`menuItemStyles`): selected = `action.selected`, hover = `action.hover`; keyboard focus relies on MUI default.
Borders:
- `palette.shared.*` (inputOutlined 20%, paperOutlined 16%, buttonOutlined 32%, grey500) are used by text-field, paper outlined, button outlined (inherit), button-group, toggle button, chip outlined default, pagination outlined. Palette-colored outlined buttons use `currentColor@48%` plus a hover ring `0 0 0 0.75px currentColor` (button, fab, toggle).
- Table and DataGrid use dashed borders (`borderBottomStyle`/`borderTopStyle: 'dashed'`); DataGrid root `borderWidth: 0`. Alert outlined border main@16%. Slider thumb border grey500@8%.
Motion:
- Only two explicit transitions: `accordion.tsx` (plus/minus icon transform+opacity, `shortest`, easeIn) and `text-field.tsx` notchedOutline `border-color` (`shortest`). Skeleton default `animation: 'wave'`. Progress, tabs indicator, drawer, ripple use MUI built-ins.
- No `prefers-reduced-motion` handling in any component file. A theme-level `transitions` override or a global media query is needed (skeleton wave and accordion are not reduced-motion aware).
Other: `backdrop.tsx` grey800@48%; `tooltip.tsx` bg grey800 (dark grey700); `card.tsx` `var(--card-shadow, customShadows.card)`; `link.tsx` underline on hover only, `--Link-underlineColor: currentColor@40%` (links are distinguished from text by color only; primary.main vs text.primary is 4.99:1, fine for 1.4.1, but the link text itself is 3.11 vs white, FAIL).

### 1d. theme/core/mixins
- `mixins.ts`: assembles the `mixins` object and `MixinsExtend` type: `hideScrollX/Y` (hide scrollbars, overflow auto), `scrollbarStyles(theme)` (thin scrollbar, text.disabled alpha .4 thumb / .08 track), plus the functions below.
- `background.ts`: `bgGradient({images,sizes,positions,repeats})` layered backgrounds; `bgBlur({color,blur=6,imgUrl})` translucent bg with backdrop-filter.
- `border.ts`: `borderGradient({color,padding})` pseudo-element gradient border using mask-composite.
- `text.ts`: `maxLine({line,persistent})` line-clamp ellipsis; `textGradient(color)` gradient text via background-clip.
- `global-styles-components.ts`: `menuItemStyles(theme)` (body2, padding, radius x0.75, selected = action.selected + semibold, hover = action.hover); `paperStyles(theme,{blur,color,dropdown})` (translucent paper with two inlined base64 SVG gradient blobs, backdrop blur, dropdown shadow/padding); `filledStyles(theme,colorKey,{hover})` and `softStyles(...)` for default, inherit, white/black and palette colors (soft = `palette.dark` text on main@16%, dark mode `light` text; hover main@32%).
- `index.ts`: `export * from './mixins'`.
- None touch focus or motion. `paperStyles`/`bgBlur` use `backdrop-filter`.

### 1e. Changes vs old palette/typography findings
- Palette: NO change. Hex values for all six colors (lighter..contrastText), grey scale, text/background/action/shared alpha values (hover .08, selected .16, focus .24, disabled .8/.24; inputOutlined .2, paperOutlined .16, buttonOutlined .32, inputUnderline .32) and dark neutral #28323D all match the old report. Old section 10 ratios stand.
- Typography: NO change (Public Sans Variable body, Barlow headings, weights 300-800, semiBold 600, extraBold 800, h1 40-64 responsive).
- New detail only: opacity token values (above) and the component-level pairs below.

### 1f. NEW pair contrast (light mode; script `scratchpad/c2.py`, raw output `scratchpad/c2out.md`)
Alpha colors composited over white. Need 4.5 for text, 3 for UI.

| pair | fg | bg | ratio | need | verdict |
|---|---|---|---|---|---|
| DataGrid cell hover: primary.main text on white | #00A76F | #FFFFFF | 3.11 | 4.5 | FAIL |
| DataGrid cell hover on selected (action.selected) | #00A76F | #EDEFF2 | 2.70 | 4.5 | FAIL |
| DataGrid editing cell: text.primary on primary@8% | #1C252E | #EBF8F3 | 14.23 | 4.5 | ok |
| DataGrid / Table header: text.secondary on neutral | #637381 | #F4F6F8 | 4.51 | 4.5 | ok (barely) |
| DataGrid sorted header: text.primary on neutral | #1C252E | #F4F6F8 | 14.32 | 4.5 | ok |
| Table selected row: text.primary on primary.dark@4% / @8% hover | #1C252E | #F5FAF9 / #EBF4F3 | 14.72 / 13.87 | 4.5 | ok |
| Menu/autocomplete selected: text.primary on action.selected | #1C252E | #EDEFF2 | 13.47 | 4.5 | ok |
| Menu hover: text.primary on action.hover | #1C252E | #F6F7F8 | 14.47 | 4.5 | ok |
| Tab unselected: text.secondary on white | #637381 | #FFFFFF | 4.88 | 4.5 | ok |
| Unshrunk floating label: text.disabled on white | #919EAB | #FFFFFF | 2.73 | 4.5 | FAIL |
| FormLabel focused: text.secondary on white | #637381 | #FFFFFF | 4.88 | 4.5 | ok |
| FilledInput value text.primary on @8% / @16% | #1C252E | #F6F7F8 / #EDEFF2 | 14.47 / 13.47 | 4.5 | ok |
| FilledInput label text.secondary on hover/focus @16% | #637381 | #EDEFF2 | 4.24 | 4.5 | FAIL |
| FilledInput label text.disabled on @8% | #919EAB | #F6F7F8 | 2.55 | 4.5 | FAIL |
| Soft hover (palette.dark on main@32%) primary | #007867 | #ADE3D1 | 3.78 | 4.5 | FAIL |
| Soft hover secondary | #5119B7 | #DBBEFF | 5.90 | 4.5 | ok |
| Soft hover info | #006C9C | #ADE8F3 | 4.31 | 4.5 | FAIL |
| Soft hover success | #118D57 | #B8ECCB | 3.20 | 4.5 | FAIL |
| Soft hover warning | #B76E00 | #FFE4AD | 3.23 | 4.5 | FAIL |
| Soft hover error | #B71D18 | #FFC9BD | 4.48 | 4.5 | FAIL (0.02 short) |
| Alert standard (darker on lighter), primary / secondary / info / success / warning / error | - | - | 8.53 / 11.19 / 10.81 / 6.89 / 7.43 / 9.51 | 4.5 | all ok |
| Alert outlined (dark on main@8%) primary / secondary / info | - | - | 4.96 / 8.61 / 5.38 | 4.5 | ok |
| Alert outlined success / warning / error | - | - | 3.93 / 3.79 / 5.95 | 4.5 | success, warning FAIL; error ok |
| Alert filled (contrastText on main): primary / info / success / error | - | - | 3.11 / 2.37 / 2.28 / 3.17 | 4.5 | FAIL (same as buttons); secondary 5.16, warning 8.18 ok |
| Default filled button/chip grey800 on grey300 / hover grey400 | #1C252E | #DFE3E8 / #C4CDD5 | 12.04 / 9.63 | 4.5 | ok |
| Contained inherit button white on grey800 / hover grey700 | #FFFFFF | #1C252E / #454F5B | 15.52 / 8.33 | 4.5 | ok |
| Tooltip white on grey800 | #FFFFFF | #1C252E | 15.52 | 4.5 | ok |
| Soft inherit text.primary on grey500@16% / hover @32% | #1C252E | #EDEFF2 / #DCE0E4 | 13.47 / 11.69 | 4.5 | ok |
| Link text primary.main on white (underline only on hover) | #00A76F | #FFFFFF | 3.11 | 4.5 | FAIL |
| Link color vs surrounding text.primary (1.4.1) | #00A76F | #1C252E | 4.99 | 3 | ok |
| Slider rail grey500@12% vs white | #F2F3F5 | #FFFFFF | 1.11 | 3 | FAIL |
| Slider thumb border grey500@8% vs white | #F6F7F8 | #FFFFFF | 1.07 | 3 | FAIL |
| Checkbox/radio/switch/slider primary.main vs white | #00A76F | #FFFFFF | 3.11 | 3 | ok |
| Unchecked checkbox/radio icon (action.active grey600) vs white | #637381 | #FFFFFF | 4.88 | 3 | ok |
| Switch unchecked track grey500@48% vs white (approximate, assumed from opacity tokens) | #CAD0D7 | #FFFFFF | 1.55 | 3 | FAIL |
| Focus indicator action.focus grey500@24% vs white | #E5E8EB | #FFFFFF | 1.23 | 3 | FAIL |
| Input outlined focused border text.primary vs white | #1C252E | #FFFFFF | 15.52 | 3 | ok |

Takeaway: no custom focus ring exists to measure; the visible-focus gap in the old report is confirmed. Alert standard is the only palette-colored status container that passes in every color, so prefer it for banners.

## 2. Settings

### 2a. Files
`components/settings/`: `settings-config.ts` (`SETTINGS_STORAGE_KEY = 'app-settings'`, `defaultSettings`), `types.ts` (SettingsState, SettingsContextValue, props), `context/settings-context.ts` (createContext), `context/settings-provider.tsx`, `context/use-settings-context.ts`, `drawer/*` (settings-drawer, base-option, font-options, nav-layout-option, presets-options, fullscreen-button, icons, styles), plus barrels.

### 2b. State and persistence
- `SettingsProvider({defaultSettings, storageKey})` wraps `useLocalStorage<SettingsState>(storageKey, defaultSettings)` from `minimal-shared/hooks`; exposes `state, setState(partial), setField(name,value), canReset, onReset` plus drawer `openDrawer/onToggleDrawer/onCloseDrawer` (plain `useState`, not persisted).
- Persisted: whole SettingsState JSON in localStorage key `app-settings` (version, fontSize, fontFamily, compactLayout, contrast, primaryColor, mode, navColor, direction, navLayout). No cookies anywhere in `src/` (grep: none).
- On mount an effect compares stored `version` to `defaultSettings.version` (= `CONFIG.appVersion` from package.json) and resets to defaults on mismatch or missing.
- A second store: MUI color-scheme mode in localStorage key `theme-mode` (`themeConfig.modeStorageKey`), managed by MUI `ThemeProvider`/`useColorScheme`. The drawer mirrors `mode` between the two (effect plus `setMode`).
- React 19 style: `<SettingsContext value=...>` and `use(SettingsContext)`; `useSettingsContext()` throws outside the provider.

### 2c. How it feeds the theme
`theme/theme-provider.tsx`: `const settings = useSettingsContext(); const theme = createTheme({ settingsState: settings.state, themeOverrides })`, then MUI `ThemeProvider disableTransitionOnChange` + `CssBaseline` + `<Rtl direction={settings.state.direction}>`. Theme is rebuilt every render (no memo).
`applySettingsToTheme(baseTheme, state)` sets direction, `typography.fontFamily = setFont(fontFamily)`, swaps `primaryColor` preset into BOTH schemes' primary and customShadows.primary, and for `contrast: 'high'` swaps light `background.default` to grey200. `applySettingsToComponents(state)` adds a `MuiCssBaseline` override: `html { fontSize: state.fontSize }` and, for high contrast, `--card-shadow` on cards.
Other consumers: `layouts/dashboard/layout.tsx` (navLayout, navColor, `setField('navLayout', ...)` for the mini toggle), `layouts/dashboard/content.tsx` (navLayout, compactLayout), `layouts/components/settings-button.tsx` (`onToggleDrawer`, `canReset` badge; used by dashboard, auth-split and simple layouts), `app.tsx` (Provider and Drawer). `theme/create-theme.ts` and `with-settings/*` import only the `SettingsState` type.

### 2d. Minimum change for FIXED settings, no drawer UI
Goal: keep `defaultSettings` as a constant; drop provider, drawer, the `app-settings` localStorage key and the mode toggle.
1. `components/settings/index.ts`: remove `export * from './drawer'` and `export * from './context'`; delete `drawer/` and `context/` dirs. Keep `settings-config.ts` and `types.ts` (SettingsState). Optionally trim the context/drawer-only types. `defaultSettings.version` can go.
2. `app.tsx` (imports line ~10, wrapper lines ~21-33): remove `SettingsProvider` wrapper and the `<SettingsDrawer defaultSettings={defaultSettings} />` line. Keep `ThemeProvider`.
3. `theme/theme-provider.tsx`: drop the `useSettingsContext` import and call; use `defaultSettings` from `src/components/settings` (`createTheme({ settingsState: defaultSettings, themeOverrides })`), ideally built once at module scope instead of per render; replace `settings.state.direction` with `themeConfig.direction`. Direction is fixed ltr, so `<Rtl>` and `with-settings/right-to-left.tsx` can be removed (also drops `@emotion/cache` and `@mui/stylis-plugin-rtl`).
4. Light only: delete `colorSchemes.dark` in `theme/create-theme.ts` and the `dark: updateColorScheme('dark')` entry in `theme/with-settings/update-core.ts` (otherwise it re-adds dark). With one scheme MUI neither reads nor writes `theme-mode`. If dark is kept, a stale `theme-mode=dark` in localStorage still wins even with `defaultMode="light"`.
5. `layouts/dashboard/layout.tsx`: remove `useSettingsContext` import (line 16) and replace `settings.state.navColor/navLayout` (lines 64-74) with constants from `defaultSettings`; replace the `onToggleNav` block (lines ~194-199, calls `settings.setField('navLayout', ...)`) with local state or remove the mini toggle; remove the `SettingsButton` import (line 29) and `<SettingsButton />` (line ~168).
6. `layouts/dashboard/content.tsx` (lines 9, 29-36): remove `useSettingsContext`; use `defaultSettings.compactLayout` / `navLayout`.
7. Delete `layouts/components/settings-button.tsx` and remove its use in `layouts/auth-split/layout.tsx` (lines 21, 75) and `layouts/simple/layout.tsx` (lines 17, 63).
8. `with-settings/update-core.ts` and `update-components.ts` work unchanged with the constant.

Even smaller route for our app (we are not porting the template layouts): `createTheme()` already works with no `settingsState` (`settingsState ? apply... : baseTheme`), so copy `theme/` only, call `createTheme({ themeOverrides })`, and delete `with-settings/` and all of `components/settings/` except what you want. The only lost behavior is the CssBaseline `html { fontSize }` override, which equals the browser default 16px anyway. Smallest diff alternative (keep the provider, remove only drawer + SettingsButton) still leaves the `app-settings` localStorage key, so the constant approach is preferred.


## 3. nav-section

Files: `components/nav-section/{vertical,mini,horizontal}/{nav-item,nav-list,nav-section-*}.tsx`, `components/{nav-collapse,nav-dropdown,nav-elements,nav-subheader}.tsx`, `styles/{css-vars,nav-item-styles,classes}`, `utils/create-nav-item.ts`, `types.ts`.

### Shared structure and markup
- Data shape: `data = [{ subheader?, items: [{ path, title, icon?, info?, caption?, deepMatch?, disabled?, allowedRoles?, children? }] }]`. Max depth is arbitrary; `depth` is passed down (1 = root).
- DOM: `<nav>` > `<ul>` (groups) > `<li>` (group) > `<ul>` > `<li>` > item. Sub-lists are nested `<ul><li>`. Real list semantics, one `<nav>` per section, but no `aria-label` on the `<nav>` (caller can pass props through `...other`).
- Item element: MUI `ButtonBase` styled as `ItemRoot`. `createNavItem` picks the element:
  - leaf, internal: `<a>` via `RouterLink` (react-router) with `href`.
  - leaf, external: `<a href target="_blank" rel="noopener noreferrer">`.
  - parent with children and `enabledRootRedirect` false (default): `component: 'div'`. ButtonBase on a non-button adds `role="button"` and `tabIndex=0`, and handles Enter (keydown) and Space (keyup) as click.
  - parent with `enabledRootRedirect`: it is a link instead, and click still toggles.
- Inside the item: spans for icon, texts (title + caption), info badge, arrow (Iconify svg, decorative). Icon strings are resolved through `render.navIcon` map.
- Every item gets `aria-label={title}`. This overrides the item's content name, so the caption and info text are not announced.
- Permission hiding: `checkPermissions(allowedRoles)` returning TRUE hides the item (inverted naming). Dashboard passes `!allowedRoles?.includes(user?.role)`. Easy to get backwards; our replacement should be renamed.
- Active detection: `isActiveLink(pathname, data.path, data.deepMatch ?? !!data.children)` from `minimal-shared/utils`, with `pathname` from `src/routes/hooks usePathname`. Prefix match for parents (deepMatch default true when children exist), exact for leaves. Result goes to class `--active` and style props only.
- **`aria-current` is never set** (grep of the entire nav-section folder: the only `aria-*` attributes are `aria-label`, `aria-describedby`, `aria-hidden`). We must add `aria-current="page"` to the active leaf (and for a parent, only if the parent link itself is the current page).
- Disabled: `disabled` is consumed by the styled wrapper (not forwarded to ButtonBase), so the element stays focusable and keyboard-activatable. It only gets `opacity: .48; pointer-events: none` and the `li` gets `cursor: not-allowed`. No `aria-disabled`. Opacity .48 also fails contrast (see 8a).

### Vertical
- Nested groups: parent item `onClick` toggles `open` (`useBoolean(isActive)`); a `useEffect` on `pathname` closes it when the route changes away (and not active). Children render in MUI `Collapse` with `mountOnEnter unmountOnExit`, so closed children are not in the DOM and not tabbable. Open state keeps the parent highlighted (`--open`).
- No `aria-expanded`, no `aria-controls`, no `role`/`id` on the group. The only open/closed signal is the arrow icon swap (`arrow-ios-downward` vs `forward`) and colors. Keyboard: Tab to the div-button, Enter or Space toggles, Tab continues into the revealed children. Arrow keys do nothing (no roving tabindex, no menu semantics).
- Group subheader (`NavSubheader`): MUI `ListSubheader component="div"` with `onClick` toggling a `Collapse` (`in`, not unmounted) around the group list. It has NO role, NO tabIndex, NO key handler: mouse-only, keyboard users cannot collapse groups (they stay open, so content stays reachable). Also no `aria-expanded`. Subheader is `<div>` inside `<li>`, not a heading or list label.
- Sub-level decoration: sub items use a `::before` bullet mask (SVG elbow) and `NavCollapse` draws a 2px vertical line through `::before` on the `ul`. Both purely decorative CSS.

### Mini
- Root items render as a column: 22px icon over a 10px title (`pxToRem(10)`, semibold), 56px min height, padding `8px 4px 6px 4px`. The label stays visible (not icon-only), plus `aria-label=title`. There is no tooltip for the title, only for `caption` (an `eva:info-outline` icon in a `Tooltip placement="right" arrow`; the icon is not focusable and the tooltip is hover-only).
- Children: not inline. Hover opens `NavDropdown` (MUI `Popover`, `pointerEvents: none` until open, transparent paper, `disableScrollLock`) anchored right-center, holding a `NavSubList`. Opened by `usePopoverHover` via `onMouseEnter`/`onMouseLeave` on the item and on the popover paper; closes on route change. Item sets `aria-describedby={popoverId}` only while open; popover gets `aria-hidden={!open}`.
- Keyboard: **not operable.** Parent is a `div` button with no click/focus handler, so Enter/Space/focus do nothing and the flyout (not mounted unless open) is unreachable. No `aria-expanded`/`aria-haspopup`. Unless the parent also has a path with `enabledRootRedirect` and the user navigates to its page, the children are mouse-only. Must be replaced for us (or we avoid nested groups in mini).
- Collapsed state is not announced anywhere: the toggle (`layouts/components/nav-toggle-button.tsx`) is an `IconButton` with only an Iconify arrow and no `aria-label`/`aria-pressed`/`aria-expanded`. The mini nav is the same `<nav>`, items keep names via `aria-label`.

### Horizontal
- Root items in a row (`flexDirection: row`, 32px high, padding `0 6px`, no-wrap), inside the `Scrollbar` in header bottom area. Same `Popover` hover flyout pattern as mini for children (same `usePopoverHover` hover popover), same keyboard limitation, same missing `aria-expanded`. Caption: tooltip on a small info icon.
- Hidden below `layoutQuery` breakpoint with `display: none` (so removed from AT).

### Styling tokens (all CSS custom properties from `styles/css-vars.ts`, set on the `<nav>` via `sx`, overridable through the `cssVars` prop)
- Radius: `var(--nav-item-radius)` = `theme.shape.borderRadius` = 8px (vertical, mini), 6px (horizontal = 0.75x).
- Vertical padding/size: pt 4, pr 8, pb 4, pl 12; root height 44, sub height 36; icon 24, margin `0 12px 0 0`; gap 4; bullet 12. Mini: root height 56, padding `8px 4px 6px`, sub height 34 padding `0 8px`, icon 22. Horizontal: gap 6, nav height 56, root height 32 padding `0 6px`.
- Colors (light/dark come from MUI CSS-vars palette):
  - item: `text.secondary`; hover bg `action.hover` (grey500 at 8%).
  - root active: color `primary.main` (dark mode `primary.light`), bg primary.main at 8%, hover 16%.
  - root open: color `text.primary`, bg `action.hover`.
  - sub active: color `text.primary`, bg `action.selected` (grey500 at 16%; vertical overrides to `action.hover`); sub open the same as root open.
  - caption: `text.disabled`.
  - subheader (vertical only): color `text.disabled`, hover `text.primary`; style = `typography.overline`, 11px, padding `spacing(2,1,1,1.5)`, inline-flex, a hidden arrow icon that fades in on hover plus a padding-left shift on hover (transition 'color','padding-left' at standard duration).
  - bullet/line: `#EDEFF2` light, `#282F37` dark.
- Typography: title `body2`, weight medium; active semibold (mini root: 10px bold when active).
- Focus styling: **none authored.** The only focus indicator is the default ButtonBase focus-visible touch-ripple pulsate (`currentColor`, low opacity); ButtonBase sets `outline: 0`. Not a WCAG 2.4.7 safe indicator and the pulsate is an animation. Our theme must add an explicit `:focus-visible` outline on `ItemRoot` and the subheader.
- Motion: Collapse (MUI default 300ms height), layout width transition 120ms linear on mini/vertical toggle, subheader transitions. No `prefers-reduced-motion` handling anywhere in the template (grep for "reduced" returns nothing).

### Recommendation for our app
Take the markup (`nav > ul > li > a`), the CSS-var token approach, and the vertical item styling; drop the mini hover flyout and horizontal (or reimplement with real disclosure buttons). Add `aria-current="page"`, `aria-expanded` + `aria-controls` on parent buttons (use a real `<button>` not div-ButtonBase), a button-based subheader (or plain heading) , `aria-label` on the `<nav>`, focus-visible outline, remove the `aria-label={title}` override, and use `aria-disabled` + `tabIndex=-1` for disabled. The inverted `checkPermissions` becomes a straightforward `isAllowed`.

## 4. Layout (layouts/)

### Parts worth keeping (generic, small, mostly reusable)
- `layouts/core/{layout-section,header-section,main-section,css-vars,classes}.tsx`: grid-like shell (sidebar, header, main, footer slots, CSS vars `--layout-*`). No settings/mock dependency (grep clean).
- `layouts/dashboard/nav-vertical.tsx`: fixed sidebar `NavRoot` (width from `--layout-nav-vertical-width` 300px / `--layout-nav-mini-width` 88px; `display:none` below `layoutQuery`, border-right, transition on width) with `Logo`, `Scrollbar`, `NavSectionVertical`/`Mini`, `NavToggleButton`, and `NavUpgrade` fallback in bottom area (mock; drop).
- `layouts/dashboard/nav-mobile.tsx`: MUI `Drawer` (temporary) containing `NavSectionVertical`; auto-closes on `pathname` change via effect; `NavUpgrade` at bottom (drop). Modal Drawer gives focus trap + Esc. No dependency on settings or mock data except `NavUpgrade`.
- `layouts/components/menu-button.tsx`: plain `IconButton` with a menu icon; **no `aria-label`** (we must add one, plus `aria-expanded`/`aria-controls`).
- `layouts/components/nav-toggle-button.tsx`: small absolutely-positioned `IconButton` on the sidebar edge toggling mini/vertical; `position` driven by `--layout-nav-*-width`; no label/aria state (add `aria-label` and `aria-expanded`/`aria-pressed`). Icons by Iconify. Hidden below `layoutQuery`.
- `layouts/components/account-button.tsx`: `IconButton component={m.button}` (framer-motion hover/tap scale) wrapping `AnimateBorder` + `Avatar` (with initial fallback). `aria-label="Account button"` (weak label). Uses `framer-motion` and `components/animate`.
- `layouts/components/account-popover.tsx`: account button plus `CustomPopover` (MUI `Popover` wrapper) with name, email (both from `useMockedUser`), `MenuList` of `MenuItem > Link(RouterLink)` from a data array (`{label, href, icon, info}`) and `SignOutButton`. Reasonable base for our account menu. Note each `MenuItem` wraps a `Link` (a menuitem containing an anchor; double interactive semantics, and clicks on MenuItem padding do nothing since `li` padding is set to 0 by `& li { p: 0 }`).
- `layouts/components/account-drawer.tsx`: same trigger but right-anchored `Drawer` (320px) with large avatar, mock switch-account avatars (`_mock.fullName/_mock.image.avatar`), "Add account", the same link list, `UpgradeBlock`, and `SignOutButton`. Close `IconButton` has no `aria-label`; `Drawer aria-hidden={!open}`. Prefer popover version; drop the mock parts.
- `layouts/components/sign-out-button.tsx`: `Button` (variant "soft", color error) text "Logout", calls `signOut()` from `auth/context/jwt/action` then `checkUserSession()` then `router.refresh()`. Auth-coupled (see section 5).
- `layouts/dashboard/content.tsx`: `DashboardContent` `Container` using CSS vars; reads `settings.state.navLayout` and `compactLayout`.
- `layouts/dashboard/nav-horizontal.tsx`, `layouts/components/{searchbar,language-popover,contacts-popover,notifications-drawer,workspaces-popover,settings-button,nav-upgrade,sign-in-button}`: not needed. (`searchbar` consumes `navData` to build search results; the rest are mock/feature widgets.)

### Dependence on settings or mock data (exact)
| File | Uses |
|---|---|
| `layouts/dashboard/layout.tsx` | `useSettingsContext` (`state.navColor`, `state.navLayout`, `setField('navLayout')`), `useMockedUser` (role for `canDisplayItemByRole`), `_contacts`, `_notifications` from `src/_mock`, `_account` (nav-config-account), `_workspaces`, hard-coded language list, `dashboardNavData` (nav-config-dashboard), `Alert` placeholder topArea (`display:none`), `Searchbar`, `LanguagePopover`, `ContactsPopover`, `NotificationsDrawer`, `SettingsButton`, `WorkspacesPopover` |
| `layouts/dashboard/css-vars.ts` | type `SettingsState['navColor'|'navLayout']` (type-only import from `components/settings`); `bulletColor` from nav-section. Implements `integrate`/`apparent` color vars (see 8a) |
| `layouts/dashboard/content.tsx` | `useSettingsContext` (`navLayout`, `compactLayout`) |
| `layouts/components/settings-button.tsx` | `useSettingsContext` (`onToggleDrawer`, `canReset`); also used by `layouts/simple/layout.tsx` and `layouts/auth-split/layout.tsx` |
| `layouts/components/account-drawer.tsx` | `useMockedUser`, `_mock` (fake avatars/names) |
| `layouts/components/account-popover.tsx` | `useMockedUser`, `useAuthContext` indirectly via sign-out |
| `layouts/components/nav-upgrade.tsx` | `useMockedUser`, `CONFIG`, `paths`, `Label`, `framer-motion` (marketing block) |
| `layouts/components/sign-out-button.tsx` | `useAuthContext`, `auth/context/jwt/action.signOut` |
| `layouts/nav-config-dashboard.tsx` | `CONFIG.assetsDir` icon SVGs, `paths`, `Label` (demo nav tree; `allowedRoles` examples) |
| `layouts/nav-config-account.tsx`, `nav-config-workspace.tsx` | static demo data (home/profile/projects etc.; workspaces with mock logos) |
| `app.tsx` | wraps everything in `AuthProvider` (jwt), `SettingsProvider`, `SettingsDrawer`, `MotionLazy`, `ProgressBar` |
`layouts/dashboard/css-vars.ts` and `layouts/core` are otherwise settings-free. To drop settings we hard-code `navLayout='vertical'`, `navColor='integrate'`, `compactLayout` false/true, and replace `ThemeProvider` settings variant (`theme/with-settings/`) with the base theme.

## 5. Auth (auth/)

### What exists
- `auth/context/auth-context.tsx`: `AuthContext` of `{user, loading, authenticated, unauthenticated, checkUserSession?}`; `auth/types.ts` has `UserType = Record<string, any> | null` (an `any`; AGENTS.md forbids that).
- `auth/context/jwt/`: `auth-provider.tsx` (reads `sessionStorage['jwt_access_token']`, validates `exp`, sets axios `Authorization: Bearer`, GET `/api/auth/me`, defaults `role ?? 'admin'` for any user), `action.ts` (`signInWithPassword`, `signUp`, `signOut`; posts to `/api/auth/sign-in` / `sign-up`), `utils.ts` (`jwtDecode`, `isValidToken`, `tokenExpired` uses `alert()` + `setTimeout` redirect, `setSession`), `constant.ts`.
- `auth/guard/`: `AuthGuard` (redirect to sign-in with `?returnTo=` when not authenticated; shows `SplashScreen` while checking; `signInPaths` has jwt/auth0/amplify/firebase/supabase), `GuestGuard` (redirects authenticated users to `returnTo` via `window.location.href`), `RoleBasedGuard` (framer-motion "Permission denied"; marked "reference only").
- `auth/hooks/`: `useAuthContext` (React 19 `use(AuthContext)`), `useMockedUser` (hard-coded demo user, role `'admin'`, mock avatar).
- `auth/view/jwt/`: `JwtSignInView`, `JwtSignUpView` (react-hook-form + zod forms); `auth/components/`: form-head, form-divider, form-socials, form-resend-code, form-return-link, sign-up-terms (all for sign-in/up screens). `auth/utils/error-message.ts`.
- Consumers outside `auth/`: `app.tsx` (`AuthProvider`), `routes/sections/auth.tsx` (`GuestGuard` + sign-in/up pages), `routes/sections/dashboard.tsx` (`AuthGuard` unless `CONFIG.auth.skip`), `routes/sections/index.tsx` (redirect to `CONFIG.auth.redirectPath`), `pages/auth/jwt/{sign-in,sign-up}.tsx`, `layouts/auth-split/layout.tsx` (`CONFIG.auth.method`), `layouts/components/{sign-in-button,sign-out-button,account-drawer,account-popover,nav-upgrade}.tsx`, `layouts/dashboard/layout.tsx`, `lib/axios.ts` (`endpoints.auth.*`), `global-config.ts` (`CONFIG.auth`, plus firebase/amplify/auth0/supabase blocks).

### Removal plan
1. Do not copy `auth/context/jwt/*`, `auth/view/*`, `auth/components/*`, `auth/guard/{auth,guest}-guard.tsx`, `routes/sections/auth.tsx`, `pages/auth/*`, `layouts/auth-split`, `layouts/components/{sign-in,sign-out}-button.tsx`, `CONFIG.auth/firebase/amplify/auth0/supabase`, `lib/axios.ts` (we use `lib/api.ts` apiFetch), `auth/hooks/use-mocked-user.ts`.
2. Replace with a feature `features/auth/`: `api.ts` (`getMe()` -> GET `/api/me` via apiFetch), `types.ts` (`MeDto` matching server DTO: id, email, displayName, roleCode, roleLabel; no `any`), `useMe.ts` (TanStack `useQuery(['me'])`, `staleTime` long, `retry:false`), optional `CurrentUserProvider` only if a context is wanted (a simple hook is enough, and keeps AGENTS.md rule "server data through TanStack Query").
3. Guards: no AuthGuard/GuestGuard (identity comes from the identity provider/`ICurrentUser`; the app has no client sign-in route). Keep a tiny `RequireAdmin` route wrapper: reads `useMe()`, shows a loading state, renders `<Outlet/>` when `roleCode === 'Admin'` (compare to a constant string, never id), else a 403 page (plain MUI, no framer-motion). The server still enforces the Admin policy. Do not use the template's `RoleBasedGuard` (framer-motion, `string.includes` substring matching: `'Admin'.includes('Admin')` OK but also matches partial role names).
4. Nav filtering: replace `checkPermissions`/`allowedRoles` with `requiredRole?: string` on the nav item data; the layout computes `isAllowed(item)` from `useMe().roleCode`.
5. Account menu: use `useMe()` for name/email/avatar initial (Avatar fallback letter), keep the popover; replace "Logout" with whatever the provider's sign-out is (undecided Entra ID/Keycloak; leave out until decided, or render a link to a configurable `/signout` URL).
6. Loading/unauthenticated: `/api/me` 401 should show a simple "Not signed in" state (and later redirect to the OIDC login URL); the splash screen is not required, a `LoadingScreen` (section 6) is enough.
7. `app.tsx` equivalent is our `Providers.tsx` (QueryClient + Theme); no `AuthProvider`.

## 6. animate and loading-screen

### components/animate (all framer-motion `m.*` with `LazyMotion strict features={domMax}` in `MotionLazy`; the `domMax` feature bundle loads at app root (size not measured))
| File | Behavior | Reduced-motion |
|---|---|---|
| `motion-lazy.tsx` | `LazyMotion strict` + `domMax` provider; required for any `m.*` | none (no `MotionConfig reducedMotion="user"`) |
| `motion-container.tsx` | `Box component=m.div` with `varContainer` (stagger children 0.05s); initial/animate/exit variants, or controlled via `animate` + `action` | none |
| `motion-viewport.tsx` | Same container with `whileInView="animate"`, `viewport {once, amount .3}`; disabled automatically below `sm` (`disableAnimate` default true) | only by viewport width, not by user preference |
| `animate-text.tsx` | Splits text into line/word/char `m.span`s with staggered `varFade('in')`; replays after `repeatDelayMs` (100) whenever scrolled into view. Accessible: an `sr-only` span carries the full text; animated copy is `aria-hidden` | none (animation plays for everyone) |
| `animate-count-up.tsx` | Number counts from `from` to `to` over `duration` (2s) when `useInView`; shortens to k/m/b; renders animated `m.span` text inside a Typography `<p>`. Counting digits are exposed to AT as they change (no `aria-live`, but reads as the intermediate content if re-queried) | none |
| `animate-logo.tsx` | `AnimateLogoZoom`: logo pulse (scale/opacity) plus two rotating, morphing outlines, infinite 2–3.2s loops (used by SplashScreen). `AnimateLogoRotate`: rotating gradient disc, 10s infinite | none |
| `animate-border.tsx` | Animated glowing border: an SVG `rect` path walked via `useAnimationFrame` (8s loop), blurred radial gradient `m.span` follows the path; stops updating only when the element is `display:none`. Used for avatar in account button/drawer | none, and a continuous rAF loop (WCAG 2.2.2 pause/stop/hide issue if >5s) |
| `back-to-top-button.tsx` | MUI `Fab` with `aria-label="Back to top"`, appears after scroll threshold (`useBackToTop` from minimal-shared: scrolls window to top, smooth) via `scale(0)->scale(1)` transition. Hidden state is only `scale(0)` (still focusable/in the a11y tree while invisible: a11y bug) | uses MUI `transitions.create` only; smooth scroll behavior not gated |
| `scroll-progress/` | `ScrollProgress` (linear bar or circular SVG) driven by `useScroll` (`use-scroll-progress.ts`) with `useSpring` smoothing; optional `Portal`; no roles/`aria-valuenow` (decorative) | none |
| `variants/*` | Variant factories (`varFade`, `varBounce`, `varZoom`, `varSlide`, `varFlip`, `varRotate`, `varScale`, `varBgColor/Pan/Kenburns`, `varPath`, `varContainer`, `varTap`, `varHover`, `transitionEnter` 0.64s / `transitionExit` 0.48s / `transitionTap`); plain objects consumed by `m.*` | none |
Verdict: none of these are needed for our app except possibly nothing. If we keep any, wrap the provider in `<MotionConfig reducedMotion="user">` and gate infinite loops. Simplest: copy none; use MUI `Collapse`/`Fade` (they honor our theme transitions) and add a `@media (prefers-reduced-motion: reduce)` rule in the theme (`transitions.create` -> 0ms) for CSS.

### components/loading-screen
- `loading-screen.tsx` `LoadingScreen`: flex-centered container (`min-height:100%`, `flexGrow:1`, px 40) containing MUI `LinearProgress color="inherit"` (width 100%, max 360). Props: `portal` (render in `Portal`), `slots.progress`, `slotsProps.progress`. No `role="status"`/label: MUI `LinearProgress` renders `role="progressbar"` with no accessible name and indeterminate (no value). Motion is MUI's CSS keyframe indeterminate animation (CSS, not gated by reduced motion).
- `splash-screen.tsx` `SplashScreen`: `portal` default true; fixed full-screen cover (z-index 9998, `background.default`) containing `AnimateLogoZoom` (infinite framer-motion loops, see above); no text/label for AT; used by AuthGuard/GuestGuard while auth is resolved.
- Recommendation: keep only a trimmed `LoadingScreen`, add `aria-label="Loading"`/visually-hidden text (or `role="status"`), skip the splash and logo animation. Under reduced motion, MUI's indeterminate bar still animates; consider a static "Loading..." text variant.
- Related `components/progress-bar` (NProgress route bar) is also unnecessary (visual only; hooks anchor clicks; no aria).

## 7. Dependency map

Computed by `dep.cjs` (scratchpad): parses `import ... from` / bare `import`, resolves relative and `src/` imports against real files, follows them transitively, and records bare npm specifiers (react / react-dom omitted). "Files" = files directly in the folder; "Closure" = total src files reachable (including the folder). Source tree: starter-vite-ts unless marked (full), where the piece exists only in vite-ts.

| Piece | Files | Closure | Internal src modules pulled in (folder, file count) | npm packages |
|---|---|---|---|---|
| theme/core | 56 | 60 | theme (2: types/config only) | @mui/material, @mui/x-data-grid, @mui/x-date-pickers, minimal-shared |
| theme (whole folder, provider included) | 69 | 106 | components/settings (16), iconify (5), label (5), scrollbar (4), global-config.ts, routes (1) | @emotion/cache, @emotion/react, @iconify/react, @mui/lab, @mui/material, @mui/stylis-plugin-rtl, @mui/x-data-grid, @mui/x-date-pickers, @mui/x-tree-view, es-toolkit, minimal-shared, simplebar-react |
| layouts/core | 6 | 12 | theme (3), theme/core (3) | @mui/material, minimal-shared |
| layouts/dashboard (as shipped) | 7 | 235 | _mock (14), auth (context 4, hooks 3, index), components: animate (24), custom-popover (6), file-thumbnail (7), flag-icon (3), iconify (5), label (5), logo (3), nav-section (25), scrollbar (4), search-not-found (2), settings (16), svg-color (4); layouts/components (16), layouts/core (6), lib (1), routes (components 3, hooks 5), theme (+core 56, with-settings 5), utils (1), global-config.ts | @emotion/*, @iconify/react, @mui/material, @mui/stylis-plugin-rtl, @mui/x-data-grid, @mui/x-date-pickers, autosuggest-highlight, axios, dayjs, es-toolkit, framer-motion, image, minimal-shared, nprogress, react-router, simplebar-react |
| components/nav-section | 25 | 54 | iconify (5), scrollbar (4), routes/components (3), routes/hooks (5), theme (3), theme/core (3) | @iconify/react, @mui/material, minimal-shared, nprogress, react-router, simplebar-react |
| components/label | 5 | 64 | theme (3) and, via theme index, all of theme/core (56) | @mui/material, @mui/x-data-grid, @mui/x-date-pickers, es-toolkit, minimal-shared |
| components/hook-form (starter) | 14 | 14 | none (self-contained) | @mui/material, @mui/x-date-pickers, dayjs, es-toolkit, minimal-shared, react-hook-form, zod |
| components/hook-form (full) | 20 | 196 | editor (17), upload (12), phone-input (4), number-input (3), country-select (2), file-thumbnail (7), flag-icon, iconify, label, scrollbar, settings (16), snackbar, search-not-found, assets/illustrations (15), assets/data, locales, theme, _mock | adds @tiptap/*, lowlight, react-dropzone, react-phone-number-input, mui-one-time-password-input, i18next family, sonner, image |
| components/custom-dialog (full only) | 3 | 3 | none | @mui/material only |
| components/table (full only) | 9 | 15 | empty-content (2), _mock (1), global-config.ts, routes (1) | @mui/material, es-toolkit, minimal-shared |

Notes on the numbers: layouts/dashboard 235 is inflated because its barrel imports pull in the whole nav config, account drawer, search, settings drawer, auth context and mock data; the actual shell pieces (layout-section, main, header, nav vertical/mini/horizontal) are far smaller once cut at those seams. label and layouts/core reach theme/core only because they import from the theme barrel (`src/theme/...`); a narrower import path would shrink the closure. table's only non-trivial link is empty-content (plus `_mock`/`routes`/global-config used by an incidental import, safe to cut).

### What drags in what

- **minimal-shared** (package, local-style workspace dep): in every piece except custom-dialog. Supplies hooks (useBoolean, usePopover, useTabs, useScrollOffsetTop, useLocalStorage), utils (mergeClasses, color helpers like varAlpha, createPaletteChannel, setFont, fNumber/fDate formatters) and the `Iconify`-adjacent helpers. Theme core and layouts/core depend on it for CSS-variable color helpers; treat it as mandatory for theme.
- **@iconify/react**: via components/iconify, which nav-section, the theme folder (component overrides/icons), and dashboard layout import. Default iconify behavior can fetch icons from the API at runtime unless icons are registered offline (template has an icon registration setup in iconify/). Replaceable with @mui/icons-material (our rule) by swapping the Iconify wrapper.
- **simplebar-react**: only through components/scrollbar, which nav-section and the theme folder import. Drops out if nav-section is switched to a plain overflow container.
- **framer-motion**: via components/animate (24 files, drawn in by dashboard layout: nav, account, settings drawer). Not needed by theme core, layouts/core, nav-section, label, hook-form or table.
- **es-toolkit**: label, theme core, hook-form, table (small utility helpers, e.g. kebabCase, isEqual); low cost.
- **dayjs**: hook-form (date pickers fields), theme (date-picker overrides), dashboard via utils. We forbid dayjs / @mui/x-date-pickers without approval, so hook-form date fields and theme x-date-pickers overrides must be dropped.
- **@mui/x-date-pickers, @mui/x-data-grid, @mui/x-tree-view, @mui/lab**: appear only as theme component overrides/type augmentation in theme/core and theme (whole). Theme core imports the x-data-grid and x-date-pickers override types, so those override files need pruning (tree-view and lab are not allowed deps either).
- **@emotion/cache, stylis-plugin-rtl**: from theme-provider RTL support (theme/with-settings); optional.
- **react-hook-form + zod**: hook-form (field wrappers). Full-version hook-form additionally drags in tiptap, react-dropzone, phone-input, OTP input, i18next and sonner; the starter hook-form has none of that, so use the starter copy.
- **react-router, nprogress**: nav-section (links, active detection, progress bar on navigation) and routes/hooks (usePathname/useRouter wrappers).
- **autosuggest-highlight, axios, image**: pulled by dashboard layout through search bar (autosuggest), lib/axios (auth), and an `image` import (likely an unrelated import resolved as a bare name; verify). Not needed by our shell.
- **auth, _mock, locales, settings drawer, flag-icon, file-thumbnail, custom-popover**: pulled by dashboard layout only through header widgets (account drawer, language, notifications, contacts, search). All cut candidates.

## 8. Accessibility findings for the nav-section and related layout code

### Keyboard and ARIA
| Area | Finding | Severity |
|---|---|---|
| No `aria-current` | Active item only styled (class + color). Screen reader users get no current-page signal (WCAG 4.1.2/1.3.1) | High |
| No `aria-expanded`/`aria-controls` on parent items | State conveyed by arrow icon and color only (4.1.2, 1.4.1) | High |
| `aria-label={title}` on every item | Replaces visible content; caption/info (e.g. "New" badge) is not announced; label-in-name OK since equals title | Low |
| Mini and horizontal flyout menus | Opened only by mouse hover; parent is div role=button with no key/focus handler; submenu popover not mounted until hovered, so keyboard and touch users cannot reach children (2.1.1 fail). Popover `aria-hidden={!open}` and `aria-describedby` do not help | High |
| Vertical parents | Enter/Space toggles via ButtonBase `role=button`; Collapse unmounts children when closed (good); no arrow-key navigation (acceptable for a disclosure nav pattern) | OK |
| Subheader toggle | `ListSubheader` div with onClick only: no role, no tabindex, no key handling (2.1.1 fail). Collapsing groups is mouse-only | High |
| Disabled item | Still focusable and key-activatable (the `disabled` prop never reaches ButtonBase), no `aria-disabled`; only pointer-events none | Medium |
| External links | `target="_blank"` with no "opens in new tab" hint | Low |
| `<nav>` | No `aria-label` by default | Low (add one) |
| NavToggleButton / MenuButton / AccountDrawer close button | `IconButton`s with only an svg and no `aria-label`; mini/vertical state not exposed | High |
| Mini label size | Root label is 10px (pxToRem(10)); readable but below common 12px minimum; the title is always visible, no tooltip substitute | Medium |
| Tooltips | Only caption tooltips, hover-only (not focusable trigger) (1.4.13/2.1.1) | Medium |
| Account popover | `MenuItem` containing `Link`; fine with MUI MenuList keyboard (arrows), but menuitem wrapping anchor is invalid-ish nesting | Low |
| Drawers | `Drawer`/`Popover` are MUI Modals: focus trap, Esc, return focus (good) | OK |

### Focus styles
No custom focus-visible styling on nav items, subheader, or icon buttons; relies on ButtonBase focus-visible ripple (pulsate, currentColor at ~30% opacity, animated). `outline: 0` from ButtonBase. In integrate theme the ripple on `primary.main` text over a 8% tint is far below the 3:1 (1.4.11) requirement. Needs explicit `&.Mui-focusVisible, &:focus-visible { outline: 2px solid <token>; outline-offset: -2px }` with 3:1 against adjacent colors.

### Motion
Collapse (MUI default), sidebar width transition 120ms linear, subheader padding/opacity transitions, hover scale on avatar button (framer `varHover(1.04)` / `varTap(0.96)`), settings cog rotates forever (`m.path` rotate 360, 8s infinite), animate-border rAF loop, logo splash infinite loops. No `prefers-reduced-motion` handling anywhere (grep: none), no `MotionConfig`. For nav alone: gate Collapse/width/padding transitions with `@media (prefers-reduced-motion: reduce)`.

### Contrast (WCAG 2.1 ratio; script `scratchpad/c.py`)
Inputs from `theme-config.ts` and `palette.ts`: grey500 `#919EAB`, grey600 `#637381`, grey800 `#1C252E`, grey900 `#141A21`, primary.main `#00A76F`, primary.light `#5BE49B`, white `#FFFFFF`. Hover = grey500 at 8% composited on the nav bg; selected = 16%; active tint = primary.main at 8% (hover 16%) composited on the nav bg. Navigation backgrounds: integrate = `background.default` (white in light, `#141A21` in dark); apparent = `grey[900]` in light mode, `grey[800]` in dark mode. Threshold: 4.5:1 normal text (the 10-12px labels are all normal-size text), 3:1 for icons and focus indicators.

Light mode, navColor `integrate` (bg `#FFFFFF`)
| Pair | Ratio | AA 4.5 |
|---|---|---|
| item text.secondary `#637381` on bg | 4.88 | pass |
| item on hover bg | 4.56 | pass (marginal) |
| subheader and caption, text.disabled `#919EAB` on bg | 2.73 | FAIL |
| subheader hover text.primary on bg | 15.52 | pass |
| root active primary.main `#00A76F` on 8% tint | 2.85 | FAIL |
| root active primary.main on 16% hover tint | 2.61 | FAIL |
| root open text.primary on action.hover | 14.50 | pass |
| sub active text.primary on action.hover (vertical) | 14.50 | pass |
| sub active text.primary on action.selected (mini/horizontal dropdown) | 13.52 | pass |
| disabled item (opacity .48) | 1.93 | n/a (disabled exempt) |

Dark mode, navColor `integrate` (bg `#141A21`)
| Pair | Ratio | AA 4.5 |
|---|---|---|
| item text.secondary `#919EAB` on bg | 6.41 | pass |
| item on hover | 5.69 | pass |
| subheader and caption, text.disabled `#637381` on bg | 3.58 | FAIL |
| subheader hover `#FFFFFF` | 17.51 | pass |
| root active primary.light `#5BE49B` on 8% tint | 9.83 | pass |
| root active primary.light on 16% hover tint | 8.71 | pass |
| root open / sub active `#FFFFFF` on action.hover | 15.55 | pass |
| disabled item (opacity .48) | 2.47 | n/a |

Light mode, navColor `apparent` (bg grey900 `#141A21`; mode-independent colors set by `dashboardNavColorVars`)
| Pair | Ratio | AA 4.5 |
|---|---|---|
| item grey500 on bg | 6.41 | pass |
| item on hover | 5.69 | pass |
| subheader and caption grey600 on bg | 3.58 | FAIL |
| subheader hover white | 17.51 | pass |
| root active primary.light on 8% tint | 9.83 | pass |
| root active primary.light on 16% hover tint | 8.71 | pass |
| root open white on action.hover | 15.55 | pass |
| vertical sub active white on action.hover | 15.55 | pass |
| mini/horizontal sub active text.primary `#1C252E` on dropdown paper `#FFFFFF` (flyout, not on nav bg) | 15.52 | pass |

Dark mode, navColor `apparent` (bg grey800 `#1C252E`)
| Pair | Ratio | AA 4.5 |
|---|---|---|
| item grey500 on bg | 5.68 | pass |
| item on hover | 4.99 | pass |
| subheader and caption grey600 on bg | 3.18 | FAIL |
| subheader hover white | 15.52 | pass |
| root active primary.light on 8% tint | 8.65 | pass |
| root active primary.light on 16% hover tint | 7.67 | pass |
| root open / sub active white on action.hover | 13.65 | pass |

Decorative/graphic: bullet and vertical guide line `#EDEFF2` on white 1.15, `#282F37` on `#141A21` 1.29 (decorative only, acceptable as they carry no information). Header icons in apparent+horizontal use `--layout-nav-text-secondary-color` = grey500 on grey900 = 6.41.

Conclusions to carry into our theme: (1) light-mode primary `#00A76F` active text fails on its tint (2.85); use a darker primary (for example `primary.dark` `#007867`) or `text.primary` with a non-color active marker such as a 3-4px left indicator bar plus bold; (2) `text.disabled` as subheader/caption color fails in both modes (2.73 light, 3.58 dark/apparent, 3.18 dark-apparent); use `text.secondary`; (3) hover 4.56 on item text.secondary is marginal; keep the hover tint at or below 8%; (4) never rely on bold or color alone for active state; add `aria-current="page"`.

## Surprising or risky

1. **Nav-section is not keyboard/AT complete.** No `aria-current` anywhere; no `aria-expanded`/`aria-controls` on parent items; vertical group subheaders collapse by mouse only (no role, tabindex or key handler); the mini and horizontal flyouts open on hover only, so their children are unreachable by keyboard and touch; every item has `aria-label={title}` which hides caption/badge text; `disabled` never reaches the ButtonBase, so disabled items stay focusable. Toggle/menu icon buttons have no accessible names.
2. **Permission check is inverted.** `checkPermissions` returning true hides the item, and the dashboard passes `!allowedRoles?.includes(role)`. Easy to get backwards; replace rather than port.
3. **The template adds no focus indicator.** No `outline` or `:focus-visible` rule anywhere in core components, mixins, nav or global CSS; ButtonBase's `outline: 0` plus a faint ripple (about 1.2:1) is all there is. We must add our own, and nothing in the overrides fights a global rule.
4. **No reduced-motion handling** in theme, nav, animate or loading components. Infinite loops exist (settings gear, splash logo, animated avatar border via a `requestAnimationFrame` loop, WCAG 2.2.2 issue).
5. **Palette-derived failures in components:** active nav item in light mode is primary.main on its 8% tint at 2.85:1; subheader/caption use `text.disabled` (2.73 light, 3.58 dark, 3.18 dark+apparent); DataGrid cell hover turns text primary.main (3.11:1, 2.70 on selected rows); several soft-hover and outlined-alert pairs fall short of 4.5:1. Details in sections 1f and 8.
6. **Auth provider is unsuitable.** It defaults `role ?? 'admin'` for any user, uses `UserType = Record<string, any>`, stores the JWT in sessionStorage, and `tokenExpired` uses `alert()`. `RoleBasedGuard` uses substring `includes`. Replace with `/api/me` via TanStack Query as in section 5.
7. **Settings = two persisted stores** (`app-settings` and `theme-mode`) mirrored by an effect; a stale `theme-mode=dark` beats `defaultMode="light"` unless the dark scheme is removed from the theme. The theme is rebuilt on every render.
8. **Barrel imports inflate closures.** `label` and `layouts/core` reach all of `theme/core` through the theme barrel; `layouts/dashboard` pulls in 235 files unless cut at the seams. `theme/core` needs pruning of the x-data-grid, x-date-pickers (and, in `theme`, x-tree-view/lab) override files because we do not allow those dependencies; `minimal-shared` is mandatory for the theme helpers.
9. **Iconify** is pulled in by nav-section, layouts and theme; icons outside the offline bundle fetch from the network (see earlier report section 7).
10. **`MenuItem` wraps a `Link`** in the account popover (nested interactive semantics), and clicking the item padding does nothing.
11. **`back-to-top-button`** stays focusable while visually hidden (`scale(0)`).
12. **Unverified:** the dependency script reported a bare `image` import in the dashboard closure that I did not check; the switch-unchecked-track contrast (1.55:1) is approximate.
