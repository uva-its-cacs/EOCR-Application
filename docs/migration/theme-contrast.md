# Theme contrast

WCAG 2.1 AA contrast of the real theme (the Minimal template plus our overrides in `src/theme/eocr-tokens.ts` and `src/theme/eocr-overrides.ts`), in the light and dark schemes.

- **Guard:** `npm test` runs `src/theme/theme-contrast.test.ts`. It builds the real theme, resolves every pair below from `theme.colorSchemes.<scheme>.palette`, and asserts the ratio against the threshold (4.5 for text, 3 for UI components). Ratios are computed from unrounded values and are not rounded before comparing. Alpha tokens (`action.hover`, `action.selected`) are composited over each surface first.
- **Surfaces:** `background.default`, `background.paper` and `background.neutral` in each scheme. Borders and other UI pairs are asserted against all three.
- **Scope:** the pairs for the tokens (Slice 4) and for the in-scope components (Slice 5) are asserted. Pairs the template still fails for components we do not use yet are listed under "Known failures" with the slice that fixes each.
- **Browser pairs:** some pairs need real CSS (alpha tints, `color-mix`, hover states, DOM structure). They are measured in a real browser (see "Browser measurements") and the code that produces them is guarded by `src/theme/theme-composition.test.ts`.
- **Not changed on purpose:** `text.disabled`, `divider` and `shared.paperOutlined`.

## Token sources

"Template" = value shipped by the Minimal starter, unchanged. "Ramp" = another step of the template's own ramp for that color. "Derived" = computed by us: the template color's hue and saturation kept, lightness moved the least amount that passes.

### Light scheme (`light` and `lighter` steps unchanged)

| Token | Value | Template value | Source |
| --- | --- | --- | --- |
| primary.main | #007867 | #00A76F | Ramp (template `dark`) |
| primary.dark | #004B50 | #007867 | Ramp (template `darker`) |
| secondary.main | #8E33FF | #8E33FF | Template |
| secondary.dark | #5119B7 | #5119B7 | Template |
| info.main | #006C9C | #00B8D9 | Ramp (template `dark`) |
| info.dark | #003768 | #006C9C | Ramp (template `darker`) |
| success.main | #108150 | #22C55E | **Derived** (hue and saturation of template `dark` #118D57) |
| success.dark | #0D6740 | #118D57 | **Derived** (success.main at 80% lightness) |
| warning.main | #996700 | #FFAB00 | **Derived** (hue of template `main`, full saturation) |
| warning.dark | #7A5200 | #B76E00 | **Derived** (warning.main at 80% lightness) |
| error.main | #B71D18 | #FF5630 | Ramp (template `dark`) |
| error.dark | #7A0916 | #B71D18 | Ramp (template `darker`) |
| contrastText (all six) | #FFFFFF | #FFFFFF (warning: #1C252E) | Template (warning changed from dark text to white because its main is now dark) |
| text.secondary | #454F5B | #637381 | Ramp (template grey 700) |
| shared.inputOutlined, shared.buttonOutlined | #637381 | grey 500 at 20% and 32% | Ramp (template grey 600), solid |

### Dark scheme

| Token | Value | Template value | Source |
| --- | --- | --- | --- |
| primary.main | #00AE74 | #00A76F | **Derived** (lightened to pass on neutral) |
| secondary.main | #B67BFF | #8E33FF | **Derived** (lightened; template `light` is #C684FF) |
| info.main | #00B8D9 | #00B8D9 | Template |
| success.main | #22C55E | #22C55E | Template |
| warning.main | #FFAB00 | #FFAB00 | Template |
| error.main | #FF6744 | #FF5630 | **Derived** (lightened to pass on neutral) |
| primary.dark (hover fill) | #5BE49B | #007867 | Ramp (template `light`) |
| secondary.dark | #EFD6FF | #5119B7 | Ramp (template `lighter`) |
| info.dark | #61F3F3 | #006C9C | Ramp (template `light`) |
| success.dark | #77ED8B | #118D57 | Ramp (template `light`) |
| warning.dark | #FFD666 | #B76E00 | Ramp (template `light`) |
| error.dark | #FFAC82 | #B71D18 | Ramp (template `light`) |
| contrastText (all six) | #1C252E | #FFFFFF (warning: #1C252E) | Chosen (the template's text color #1C252E, passes on every main) |
| text.secondary | #C4CDD5 | #919EAB | Ramp (template grey 400) |
| shared.inputOutlined, shared.buttonOutlined | #919EAB | grey 500 at 20% and 32% | Ramp (template grey 500), solid |

In the dark scheme the hover fill (`dark`) is lighter than `main`, because the template's `dark` steps fail with dark text (2.4 to 3.9).

## Slice 5 component changes

All in our own files (`src/theme/eocr-components.ts`, `src/theme/eocr-overrides.ts`); no template file is edited. `eocr-components.ts` composes with the template's overrides through `extend()`: a plain object merges through `themeOverrides`, but a function or a `variants` array replaces the template's, so the helper calls the template's style and appends ours. `theme-composition.test.ts` proves the template's focus, disabled and variant styles survive for OutlinedInput, InputBase, Button and Chip.

| Component | Before (template) | After | Evidence |
| --- | --- | --- | --- |
| Input placeholder | `text.disabled`: 2.52 light, 2.66 dark | `shared.inputOutlined` (grey 600 light, grey 500 dark): 4.88 / 4.51 (default, neutral) light, 6.41 / 5.68 / 4.76 (default, paper, neutral) dark | asserted pair, browser |
| Unshrunk floating label | `text.disabled`: 2.52 / 2.66 | `text.secondary`: 7.68 or better light, 8.08 or better dark | asserted pair, browser |
| Link | hover-only underline; underline at 40% alpha (about 1.8:1); link vs body text 2.87:1 | underlined at rest (`underline: always`), underline is full `currentColor`. Breadcrumbs keep a hover-only underline | browser, composition test |
| Link focus ring | 3px, 2px offset: overlapped neighboring text | 3px, offset 0, radius 2px. Gap to the neighboring glyphs is 3.89px, ring band is 3px, so no glyph is covered | browser |
| Outlined colored Button | border `currentColor` at 48% (1.9 to 2.4:1) | solid `main` border (3:1 or better on every surface). **Visual change:** colored outlined buttons have a stronger border. `inherit` (default) outlined buttons keep `shared.buttonOutlined` | browser |
| Outlined and text colored Button, hover | `main` text on a `main` tint: 4.01 to 4.48 | `dark` step text on hover (5.68 light, 6.05 dark worst) | asserted pair, browser |
| Clickable outlined Chip, hover | `main` text: 4.43 (dark, neutral) | `dark` step text on hover | browser |
| Soft Label, Chip, Button (text) | `light` step in dark: secondary 3.98 (neutral) | `dark` step in both schemes (through `theme.mixins.softStyles`) | asserted pair, composition test |
| Soft hover tint | 0.32: light success 4.43 and warning 4.48 fail | 0.24 (`opacity.soft.hoverBg`): 4.65 or better in both schemes | asserted pair |
| Chip avatar, dark scheme | `lighter` text on the lighter `dark` fill: 1.00 to 1.56 | `contrastText` on the `dark` fill: 6.14 or better | asserted pair, browser |
| Avatar default letters | `action.active`: 3.79 light, 3.05 dark | `text.secondary` | asserted pair, browser |
| DataGrid cell and column-header focus | 1px inset ring (MUI X default) | 3px inset ring | browser, composition test |
| Menu and List items focus | outside ring clipped by the Paper | 3px ring inset by 3px | browser (clipped sides: none) |
| Checkbox, Radio, Switch focus | ring on the padded root overlapped the label | ring on the icon (checkbox, radio) or track (switch); gap to the label 3px (checkbox), 7px (switch) | browser |

Rules:

- **Inline links** (Link in running text) are underlined at rest. Links in breadcrumbs, navigation and button-like contexts keep a hover-only underline: set `underline="hover"` on a Link, or use the Breadcrumbs component, which does it for its links.
- **Soft buttons** (`variant="soft"`): do not use them if the soft hover pairs in the contrast test fail. As of Slice 5 they pass in both schemes (soft rest at 0.16 and hover at 0.24, `dark` step text), and the test guards them.
- **Placeholders** are never the only instruction: visible labels stay required.
- **Disabled controls** are exempt from contrast (WCAG 1.4.3) and are not guarded.

## Slice 7 nav pairs

The primary nav (`src/components/eocr-nav`) uses the template's vertical nav tokens on `background.default`. Asserted in `theme-contrast.test.ts`:

| Pair | Light | Dark |
| --- | --- | --- |
| Item text (`text.secondary`) at rest | 8.33 | 10.87 |
| Item text on hover (`action.hover` tint) | 7.78 | 9.65 |
| Active item text on its 8% primary tint (light `primary.main`, dark `primary.light`) | 4.84 | 9.77 |
| Active item on hover, 16% tint (light `primary.dark`, was `primary.main` at 4.31; dark `primary.light`) | 7.88 | 8.60 |
| Group label and caption (`text.secondary`, was `text.disabled` at 2.73 / 3.58) | 8.33 | 10.87 |

The active state is also shown by a semibold title (not color alone). Measured in the browser (Slice 7 evidence): nav icon 8.33 / 10.87 (UI 3:1); focus ring 3px, inset 3px on nav items (offset -3px, so the scroll container never clips it): 4.84 on the active tint and 5.41 / 6.09 on the nav background; header buttons and the skip link 5.41 / 6.09. The dark mode toggle's pressed fill (`text.primary`) against the header: 17.51 in the dark scheme (the only scheme in which it is pressed); its light-scheme equivalent would be 15.52.

Later (not built yet): a group that needs to collapse would use the disclosure pattern (a real `<button aria-expanded aria-controls>` controlling the list), not the template's click-to-collapse subheader.

## Slice 8 status chips

`StatusChip` is the template's soft `Label`: the text is the color's `dark` step on its `main` at the soft opacity (0.16), through our `softStyles` mixin. The default (grey) chip has no palette color, so the template leaves its text color inherited; `StatusChip` pins it to `text.primary` so the ratio does not depend on where the chip sits. New guard pairs in `theme-contrast.test.ts` (both schemes): `text.primary` on `grey.500` at `soft.bg` over each surface, 13.5169 / 13.5169 / 12.5938 light and 13.5129 / 11.8585 / 10.0283 dark (default / paper / neutral). The six palette colors were already guarded (soft pairs below).

Colors: Draft, NotReviewed and unknown codes `default`; Submitted, AiReview, HumanReview, UnderReview `info`; MoreInfoNeeded, AwaitingEeaap, ApprovedWithConditions, Expired `warning`; Approved `success`; Denied `error`. Codes that share a color are told apart by their text.

Measured in the browser (headless Edge, computed colors composited down the ancestor chain, every code of `RequestStatus` and `ApprovalStatus` plus an unknown code, on each surface). Ratios are the same for every code with the same color:

| Color (codes) | Light default | Light paper | Light neutral | Dark default | Dark paper | Dark neutral |
| --- | --- | --- | --- | --- | --- | --- |
| default (Draft, NotReviewed, unknown) | 13.52 | 13.52 | 12.59 | 13.51 | 11.86 | 10.03 |
| info (Submitted, AiReview, HumanReview, UnderReview) | 9.50 | 9.50 | 8.83 | 9.94 | 8.72 | 7.39 |
| warning (MoreInfoNeeded, AwaitingEeaap, ApprovedWithConditions, Expired) | 5.61 | 5.61 | 5.22 | 9.20 | 8.08 | 6.84 |
| success (Approved) | 5.58 | 5.58 | 5.19 | 9.00 | 7.90 | 6.69 |
| error (Denied) | 8.50 | 8.50 | 7.88 | 7.71 | 6.83 | 5.80 |

Lowest: 5.19 light (success on neutral), 5.80 dark (error on neutral). The chips are not interactive, so there are no hover or focus states. The browser values match the guard to two decimals.

The `ConfirmDialog` destructive confirm button is the contained `error` button: the guarded pairs error.contrastText on error.main (6.56 light, 5.38 dark) and on error.dark when hovered (11.18, 8.48).

## Slice 9 pages

No new color pairs, so no new guard pairs. Everything the pages add uses pairs that are already asserted:

- StatCard: `text.secondary` title and `text.primary` value on `background.paper` (the template Card). Its boundary is a shadow, which is not needed to identify the card, so 1.4.11 does not apply.
- Both grids: the Slice 5 DataGrid pairs (cell text, hover, focus ring 3px inset), and StatusChip as measured in Slice 8.
- The toolbar buttons and Refresh: `text.primary` (button color inherit) on `background.default`. While a refresh runs, Refresh is shown in `text.disabled` with `aria-disabled`; inactive controls are exempt from 1.4.3.
- The error page: `text.primary` on `background.default` in both schemes, with the theme's Public Sans. The template's error page used undefined font variables; that known failure is removed.

Browser findings (Slice 9 evidence): at 320 CSS px no page scrolls horizontally; only each grid's own virtual scroller does, and a focused cell in the last column keeps its 3px ring inside the scroller. With the WCAG 1.4.12 text-spacing override, grid cells with long values are cut off with an ellipsis (several Vendor, Category and Software cells; two cells are cut off even without the override: "Northstar Technologies" and "Communication and collaboration"). Nothing else clips or overlaps. Not fixed in Slice 9 (see the Slice 9 report).

## Asserted pairs

Ratio is the unrounded value to 4 decimals. "n/a" means the pair is not asserted in that scheme (the `dark` step as text is only used as text in the light scheme).

| Pair | Min | Light | Dark |
| --- | --- | --- | --- |
| primary.contrastText on primary.main | 4.5 | 5.4090 | 5.3985 |
| primary.contrastText on primary.dark (hover) | 4.5 | 9.8951 | 9.6165 |
| secondary.contrastText on secondary.main | 4.5 | 5.1626 | 5.3686 |
| secondary.contrastText on secondary.dark (hover) | 4.5 | 9.6654 | 11.6242 |
| info.contrastText on info.main | 4.5 | 5.7930 | 6.5448 |
| info.contrastText on info.dark (hover) | 4.5 | 12.0249 | 11.5429 |
| success.contrastText on success.main | 4.5 | 4.9089 | 6.8094 |
| success.contrastText on success.dark (hover) | 4.5 | 6.9278 | 10.5440 |
| warning.contrastText on warning.main | 4.5 | 4.8899 | 8.1844 |
| warning.contrastText on warning.dark (hover) | 4.5 | 6.9206 | 11.1289 |
| error.contrastText on error.main | 4.5 | 6.5576 | 5.3756 |
| error.contrastText on error.dark (hover) | 4.5 | 11.1811 | 8.4786 |
| primary.main as text on background.default | 4.5 | 5.4090 | 6.0916 |
| primary.main as text on background.paper | 4.5 | 5.4090 | 5.3985 |
| primary.main as text on background.neutral | 4.5 | 4.9928 | 4.5274 |
| secondary.main as text on background.default | 4.5 | 5.1626 | 6.0579 |
| secondary.main as text on background.paper | 4.5 | 5.1626 | 5.3686 |
| secondary.main as text on background.neutral | 4.5 | 4.7655 | 4.5024 |
| info.main as text on background.default | 4.5 | 5.7930 | 7.3851 |
| info.main as text on background.paper | 4.5 | 5.7930 | 6.5448 |
| info.main as text on background.neutral | 4.5 | 5.3473 | 5.4888 |
| success.main as text on background.default | 4.5 | 4.9089 | 7.6836 |
| success.main as text on background.paper | 4.5 | 4.9089 | 6.8094 |
| success.main as text on background.neutral | 4.5 | 4.5312 | 5.7107 |
| warning.main as text on background.default | 4.5 | 4.8899 | 9.2351 |
| warning.main as text on background.paper | 4.5 | 4.8899 | 8.1844 |
| warning.main as text on background.neutral | 4.5 | 4.5137 | 6.8638 |
| error.main as text on background.default | 4.5 | 6.5576 | 6.0657 |
| error.main as text on background.paper | 4.5 | 6.5576 | 5.3756 |
| error.main as text on background.neutral | 4.5 | 6.0531 | 4.5082 |
| primary.dark as text on background.default | 4.5 | 9.8951 | n/a |
| primary.dark as text on background.paper | 4.5 | 9.8951 | n/a |
| primary.dark as text on background.neutral | 4.5 | 9.1338 | n/a |
| secondary.dark as text on background.default | 4.5 | 9.6654 | n/a |
| secondary.dark as text on background.paper | 4.5 | 9.6654 | n/a |
| secondary.dark as text on background.neutral | 4.5 | 8.9218 | n/a |
| info.dark as text on background.default | 4.5 | 12.0249 | n/a |
| info.dark as text on background.paper | 4.5 | 12.0249 | n/a |
| info.dark as text on background.neutral | 4.5 | 11.0998 | n/a |
| success.dark as text on background.default | 4.5 | 6.9278 | n/a |
| success.dark as text on background.paper | 4.5 | 6.9278 | n/a |
| success.dark as text on background.neutral | 4.5 | 6.3949 | n/a |
| warning.dark as text on background.default | 4.5 | 6.9206 | n/a |
| warning.dark as text on background.paper | 4.5 | 6.9206 | n/a |
| warning.dark as text on background.neutral | 4.5 | 6.3881 | n/a |
| error.dark as text on background.default | 4.5 | 11.1811 | n/a |
| error.dark as text on background.paper | 4.5 | 11.1811 | n/a |
| error.dark as text on background.neutral | 4.5 | 10.3209 | n/a |
| text.primary on background.default | 4.5 | 15.5159 | 17.5078 |
| text.primary on background.default + action.hover | 4.5 | 14.4951 | 15.5461 |
| text.primary on background.default + action.selected | 4.5 | 13.5169 | 13.5129 |
| text.primary on background.paper | 4.5 | 15.5159 | 15.5159 |
| text.primary on background.paper + action.hover | 4.5 | 14.4951 | 13.6486 |
| text.primary on background.paper + action.selected | 4.5 | 13.5169 | 11.8585 |
| text.primary on background.neutral | 4.5 | 14.3222 | 13.0124 |
| text.primary on background.neutral + action.hover | 4.5 | 13.4408 | 11.4518 |
| text.primary on background.neutral + action.selected | 4.5 | 12.5938 | 10.0283 |
| text.secondary on background.default | 4.5 | 8.3251 | 10.8719 |
| text.secondary on background.default + action.hover | 4.5 | 7.7774 | 9.6538 |
| text.secondary on background.default + action.selected | 4.5 | 7.2525 | 8.3912 |
| text.secondary on background.paper | 4.5 | 8.3251 | 9.6350 |
| text.secondary on background.paper + action.hover | 4.5 | 7.7774 | 8.4755 |
| text.secondary on background.paper + action.selected | 4.5 | 7.2525 | 7.3638 |
| text.secondary on background.neutral | 4.5 | 7.6846 | 8.0804 |
| text.secondary on background.neutral + action.hover | 4.5 | 7.2117 | 7.1113 |
| text.secondary on background.neutral + action.selected | 4.5 | 6.7573 | 6.2273 |
| placeholder (shared.inputOutlined) on background.default | 4.5 | 4.8839 | 6.4052 |
| placeholder (shared.inputOutlined) on background.paper | 4.5 | 4.8839 | 5.6764 |
| placeholder (shared.inputOutlined) on background.neutral | 4.5 | 4.5082 | 4.7605 |
| shared.inputOutlined on background.default | 3 | 4.8839 | 6.4052 |
| shared.inputOutlined on background.paper | 3 | 4.8839 | 5.6764 |
| shared.inputOutlined on background.neutral | 3 | 4.5082 | 4.7605 |
| shared.buttonOutlined on background.default | 3 | 4.8839 | 6.4052 |
| shared.buttonOutlined on background.paper | 3 | 4.8839 | 5.6764 |
| shared.buttonOutlined on background.neutral | 3 | 4.5082 | 4.7605 |
| soft primary: primary.dark on primary.main at soft.bg over background.default | 4.5 | 7.8767 | 8.5959 |
| soft primary: primary.dark on primary.main at soft.hoverBg over background.default | 4.5 | 6.9825 | 7.4350 |
| soft primary: primary.dark on primary.main at soft.bg over background.paper | 4.5 | 7.8767 | 7.5623 |
| soft primary: primary.dark on primary.main at soft.hoverBg over background.paper | 4.5 | 6.9825 | 6.5838 |
| soft primary: primary.dark on primary.main at soft.bg over background.neutral | 4.5 | 7.3228 | 6.4221 |
| soft primary: primary.dark on primary.main at soft.hoverBg over background.neutral | 4.5 | 6.5187 | 5.6681 |
| soft secondary: secondary.dark on secondary.main at soft.bg over background.default | 4.5 | 7.6076 | 10.3168 |
| soft secondary: secondary.dark on secondary.main at soft.hoverBg over background.default | 4.5 | 6.7065 | 8.9161 |
| soft secondary: secondary.dark on secondary.main at soft.bg over background.paper | 4.5 | 7.6076 | 9.0785 |
| soft secondary: secondary.dark on secondary.main at soft.hoverBg over background.paper | 4.5 | 6.7065 | 7.8981 |
| soft secondary: secondary.dark on secondary.main at soft.bg over background.neutral | 4.5 | 7.0684 | 7.6884 |
| soft secondary: secondary.dark on secondary.main at soft.hoverBg over background.neutral | 4.5 | 6.2560 | 6.7762 |
| soft info: info.dark on info.main at soft.bg over background.default | 4.5 | 9.5041 | 9.9354 |
| soft info: info.dark on info.main at soft.hoverBg over background.default | 4.5 | 8.3906 | 8.4001 |
| soft info: info.dark on info.main at soft.bg over background.paper | 4.5 | 9.5041 | 8.7174 |
| soft info: info.dark on info.main at soft.hoverBg over background.paper | 4.5 | 8.3906 | 7.4236 |
| soft info: info.dark on info.main at soft.bg over background.neutral | 4.5 | 8.8344 | 7.3921 |
| soft info: info.dark on info.main at soft.hoverBg over background.neutral | 4.5 | 7.8315 | 6.3865 |
| soft success: success.dark on success.main at soft.bg over background.default | 4.5 | 5.5809 | 9.0036 |
| soft success: success.dark on success.main at soft.hoverBg over background.default | 4.5 | 4.9802 | 7.5780 |
| soft success: success.dark on success.main at soft.bg over background.paper | 4.5 | 5.5809 | 7.8977 |
| soft success: success.dark on success.main at soft.hoverBg over background.paper | 4.5 | 4.9802 | 6.6969 |
| soft success: success.dark on success.main at soft.bg over background.neutral | 4.5 | 5.1899 | 6.6921 |
| soft success: success.dark on success.main at soft.hoverBg over background.neutral | 4.5 | 4.6512 | 5.7578 |
| soft warning: warning.dark on warning.main at soft.bg over background.default | 4.5 | 5.6111 | 9.2030 |
| soft warning: warning.dark on warning.main at soft.hoverBg over background.default | 4.5 | 5.0229 | 7.5770 |
| soft warning: warning.dark on warning.main at soft.bg over background.paper | 4.5 | 5.6111 | 8.0846 |
| soft warning: warning.dark on warning.main at soft.hoverBg over background.paper | 4.5 | 5.0229 | 6.7168 |
| soft warning: warning.dark on warning.main at soft.bg over background.neutral | 4.5 | 5.2161 | 6.8381 |
| soft warning: warning.dark on warning.main at soft.hoverBg over background.neutral | 4.5 | 4.6884 | 5.7699 |
| soft error: error.dark on error.main at soft.bg over background.default | 4.5 | 8.4959 | 7.7138 |
| soft error: error.dark on error.main at soft.hoverBg over background.default | 4.5 | 7.3411 | 6.7082 |
| soft error: error.dark on error.main at soft.bg over background.paper | 4.5 | 8.4959 | 6.8265 |
| soft error: error.dark on error.main at soft.hoverBg over background.paper | 4.5 | 7.3411 | 5.9839 |
| soft error: error.dark on error.main at soft.bg over background.neutral | 4.5 | 7.8824 | 5.7982 |
| soft error: error.dark on error.main at soft.hoverBg over background.neutral | 4.5 | 6.8333 | 5.1532 |
| soft default: text.primary on grey.500 at soft.bg over background.default | 4.5 | 13.5169 | 13.5129 |
| soft default: text.primary on grey.500 at soft.bg over background.paper | 4.5 | 13.5169 | 11.8585 |
| soft default: text.primary on grey.500 at soft.bg over background.neutral | 4.5 | 12.5938 | 10.0283 |
| outlined/text hover primary: primary.dark on its hover tint over background.default | 4.5 | 8.6341 | 9.2238 |
| outlined/text hover primary: primary.dark on its hover tint over background.paper | 4.5 | 8.6341 | 8.0559 |
| outlined/text hover primary: primary.dark on its hover tint over background.neutral | 4.5 | 7.9905 | 6.7404 |
| outlined/text hover secondary: secondary.dark on its hover tint over background.default | 4.5 | 8.3681 | 10.8824 |
| outlined/text hover secondary: secondary.dark on its hover tint over background.paper | 4.5 | 8.3681 | 9.4860 |
| outlined/text hover secondary: secondary.dark on its hover tint over background.neutral | 4.5 | 7.7419 | 7.9172 |
| outlined/text hover info: info.dark on its hover tint over background.default | 4.5 | 10.3980 | 10.8426 |
| outlined/text hover info: info.dark on its hover tint over background.paper | 4.5 | 10.3980 | 9.4485 |
| outlined/text hover info: info.dark on its hover tint over background.neutral | 4.5 | 9.6203 | 7.8943 |
| outlined/text hover success: success.dark on its hover tint over background.default | 4.5 | 6.1395 | 10.0101 |
| outlined/text hover success: success.dark on its hover tint over background.paper | 4.5 | 6.1395 | 8.7342 |
| outlined/text hover success: success.dark on its hover tint over background.neutral | 4.5 | 5.6845 | 7.3016 |
| outlined/text hover warning: warning.dark on its hover tint over background.default | 4.5 | 6.1480 | 10.5194 |
| outlined/text hover warning: warning.dark on its hover tint over background.paper | 4.5 | 6.1480 | 9.1837 |
| outlined/text hover warning: warning.dark on its hover tint over background.neutral | 4.5 | 5.6916 | 7.6713 |
| outlined/text hover error: error.dark on its hover tint over background.default | 4.5 | 9.5811 | 8.2536 |
| outlined/text hover error: error.dark on its hover tint over background.paper | 4.5 | 9.5811 | 7.2294 |
| outlined/text hover error: error.dark on its hover tint over background.neutral | 4.5 | 8.8599 | 6.0512 |
| DataGrid hovered cell: primary.main on background.default + action.hover | 4.5 | 5.0531 | 5.4090 |
| DataGrid hovered cell: primary.main on background.paper + action.hover | 4.5 | 5.0531 | 4.7488 |
| Avatar letters: text.secondary on grey.300 | 4.5 | 6.4581 | n/a |
| Avatar letters: text.secondary on grey.700 | 4.5 | n/a | 5.1697 |
| primary.main as outline/focus ring on background.default | 3 | 5.4090 | 6.0916 |
| primary.main as outline/focus ring on background.paper | 3 | 5.4090 | 5.3985 |
| primary.main as outline/focus ring on background.neutral | 3 | 4.9928 | 4.5274 |

## Thin margins

Every asserted pair under 4.6 (text, threshold 4.5) or under 3.1 (UI, threshold 3). A future change to any of these tokens can drop them below the threshold.

| Pair | Scheme | Ratio | Min |
| --- | --- | --- | --- |
| primary.main as text on background.neutral | dark | 4.5274 | 4.5 |
| secondary.main as text on background.neutral | dark | 4.5024 | 4.5 |
| success.main as text on background.neutral | light | 4.5312 | 4.5 |
| warning.main as text on background.neutral | light | 4.5137 | 4.5 |
| error.main as text on background.neutral | dark | 4.5082 | 4.5 |
| placeholder (shared.inputOutlined) on background.neutral | light | 4.5082 | 4.5 |

## Browser measurements (Slice 5)

Method: a throwaway page rendered every in-scope component in rest, forced hover, focus, selected, error and disabled states on the default, paper and neutral surfaces, in both schemes (`client/focus-test/`, not committed). A script drove headless Edge: it forced `:hover` through the DevTools protocol (with reduced motion on, so transitions are settled), read computed colors, composited alpha down the ancestor chain, and applied the WCAG formula. Worst ratio across colors, variants and surfaces per measured pair; 957 measurements per scheme. Disabled controls and the outlined Paper border (`paperOutlined`, unchanged on purpose) are excluded; disabled controls are exempt.

| Component | Measured pair | Min | Light (worst) | Dark (worst) |
| --- | --- | --- | --- | --- |
| Alert | icon | 3 | 4.09 | 5.28 |
| Alert | message text | 4.5 | 4.89 | 6.46 |
| Avatar | letters | 4.5 | 5.41 | 5.17 |
| Backdrop | indicator on backdrop | 3 | 5.23 | 16.57 |
| Breadcrumbs | current text | 4.5 | 7.68 | 8.08 |
| Breadcrumbs | link text | 4.5 | 4.99 | 4.53 |
| Breadcrumbs | separator | 4.5 | 7.68 | 8.08 |
| Button | text | 4.5 | 4.51 | 4.50 |
| Chip with avatar | avatar letter | 4.5 | 6.14 | 6.46 |
| Chip with avatar | chip text | 4.5 | 4.51 | 4.50 |
| Chip with avatar | delete icon | 3 | 4.51 | 4.50 |
| Chip | text | 4.5 | 4.51 | 4.50 |
| Column menu | SPAN.MuiTypography-root.MuiTypography-body1 | 4.5 | 15.52 | 15.72 |
| Column menu | svg icon | 3 | 15.52 | 15.72 |
| DataGrid | cell text | 4.5 | 15.52 | 17.51 |
| DataGrid | column menu icon | 3 | 4.51 | 4.76 |
| DataGrid | header title | 4.5 | 7.68 | 8.08 |
| DataGrid | pagination label | 4.5 | 15.52 | 17.51 |
| DataGrid | pagination select text | 4.5 | 15.52 | 17.51 |
| DataGrid | pagination text | 4.5 | 15.52 | 17.51 |
| DataGrid | selected row cell text | 4.5 | 13.87 | 13.87 |
| DataGrid | sort icon | 3 | 4.88 | 5.68 |
| Dialog | BUTTON.MuiButtonBase-root.MuiButton-root | 4.5 | 15.52 | 15.52 |
| Dialog | H2.MuiTypography-root.MuiTypography-h6 | 4.5 | 15.52 | 15.52 |
| Drawer | item text | 4.5 | 15.52 | 15.52 |
| Drawer | selected item text | 4.5 | 13.87 | 13.87 |
| Filter panel | LABEL.MuiFormLabel-root.MuiInputLabel-root | 4.5 | 8.33 | 9.76 |
| IconButton | icon | 3 | 4.51 | 4.19 |
| Label | text | 4.5 | 4.51 | 4.50 |
| Link | link text | 4.5 | 4.99 | 4.53 |
| Link | underline present | 3 | 4.99 | 4.53 |
| List and Menu items | text | 4.5 | 12.59 | 10.03 |
| Menu | LI.MuiButtonBase-root.MuiMenuItem-root | 4.5 | 13.52 | 12.02 |
| Pagination | item text | 4.5 | 14.32 | 11.45 |
| Pagination | selected text | 4.5 | 13.44 | 11.45 |
| Paper | primary text | 4.5 | 15.52 | 15.52 |
| Paper | secondary text | 4.5 | 8.33 | 9.63 |
| Progress | indicator | 3 | 15.52 | 17.51 |
| Progress | linear bar vs surface | 3 | 15.52 | 17.51 |
| Table | body cell text | 4.5 | 14.32 | 13.01 |
| Table | header text | 4.5 | 7.68 | 8.08 |
| TextField / Select | border | 3 | 4.51 | 4.51 |
| TextField / Select | helper/error text | 4.5 | 6.05 | 4.51 |
| TextField / Select | input text | 4.5 | 14.32 | 13.01 |
| TextField / Select | label | 4.5 | 6.05 | 4.51 |
| TextField / Select | placeholder | 4.5 | 4.51 | 4.76 |
| TextField / Select | select icon | 3 | 4.51 | 4.76 |
| Tooltip | tooltip text | 4.5 | 15.52 | 8.33 |

## Known failures (not asserted)

In-scope components have no known failures left. The nav caption and subheader failure is fixed in Slice 7 (our nav sets them to `text.secondary`). These remain, all for components we do not use yet; fix them in the slice that first uses the component.

| Item | Where it comes from | Measured | Fixing slice |
| --- | --- | --- | --- |
| Switch track | grey 500 at 48% (`switch.tsx`) | 1.50 light, 2.22 dark (needs 3) | first slice that uses a Switch |
| Slider rail | primary at 38% (`slider.tsx`) | 1.73 light, 1.78 dark (needs 3) | first slice that uses a Slider |
| Slider mark labels | `text.disabled` (`slider.tsx`) | as above | first slice that uses a Slider |
| Checkbox, Radio, Tabs, Accordion, Stepper, Rating | not measured in Slice 5 | unknown | first slice that uses each |
| Grid cell truncation | DataGrid cells end in an ellipsis when the value is wider than the column (worse under the 1.4.12 text-spacing override) | content cut off, not a contrast issue | to be decided (Slice 9 report) |
| Inline Link focus ring | the 3px band touches the space between words but covers no glyph (gap 3.89px) | accepted | none |

Corrections to the Slice 4 version of this list: "Dark-scheme filled chip" was the Chip's **avatar** (`chip.tsx:115-116` is `avatarVariants`); the filled chip's own text passes. "DataGrid cell hover" and "soft hover for success and warning in light" were estimates; in the browser the grid passes on default and paper surfaces. Soft hover in light did fail at the template's 0.32 tint when measured with settled transitions, and is fixed with the 0.24 tint.

## Template dependence

The contrast test reads the real theme, so a template update that changes a template override is caught if it breaks an asserted pair. The composition tests fail if a template slot we extend stops being a function or object we can compose.
