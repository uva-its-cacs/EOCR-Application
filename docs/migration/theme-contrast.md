# Theme contrast

WCAG 2.1 AA contrast of the real theme (the Minimal template plus our overrides in `src/theme/eocr-tokens.ts` and `src/theme/eocr-overrides.ts`), in the light and dark schemes.

- **Guard:** `npm test` runs `src/theme/theme-contrast.test.ts`. It builds the real theme, resolves every pair below from `theme.colorSchemes.<scheme>.palette`, and asserts the ratio against the threshold (4.5 for text, 3 for UI components). Ratios are computed from unrounded values and are not rounded before comparing. Alpha tokens (`action.hover`, `action.selected`) are composited over each surface first.
- **Surfaces:** `background.default`, `background.paper` and `background.neutral` in each scheme. Borders and other UI pairs are asserted against all three.
- **Scope:** only the pairs this slice is responsible for are asserted. Pairs the template still fails are listed under "Known failures" with the slice that fixes each.
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
| shared.inputOutlined on background.default | 3 | 4.8839 | 6.4052 |
| shared.inputOutlined on background.paper | 3 | 4.8839 | 5.6764 |
| shared.inputOutlined on background.neutral | 3 | 4.5082 | 4.7605 |
| shared.buttonOutlined on background.default | 3 | 4.8839 | 6.4052 |
| shared.buttonOutlined on background.paper | 3 | 4.8839 | 5.6764 |
| shared.buttonOutlined on background.neutral | 3 | 4.5082 | 4.7605 |
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

## Known failures (not asserted)

These pairs fail today and are outside this slice. The worst ratio is shown; the full measurements are in the appendix.

| Item | Where it comes from | Worst ratio | Fixing slice |
| --- | --- | --- | --- |
| Placeholder text | `text.disabled` in `theme/core/components/text-field.tsx` (placeholder) | 2.52 light, 2.66 dark (needs 4.5) | Slice 5 |
| Floating label and helper text | `text.disabled` in `theme/core/components/form.tsx` | same as above | Slice 5 |
| Slider mark labels | `text.disabled` in `theme/core/components/slider.tsx` | same as above | Slice 5 |
| Nav caption and subheader | `text.disabled` in `components/nav-section/styles/css-vars.ts` | same as above | Slice 7 |
| Switch track | grey 500 at 48% (`switch.tsx`) | 1.50 light, 2.22 dark (needs 3) | Slice 5 |
| Slider rail | primary at 38% (`slider.tsx`) | 1.73 light, 1.78 dark (needs 3) | Slice 5 |
| Link underline | `currentColor` at 40% (`link.tsx`) | 1.79 light, 1.84 dark (needs 3) | Slice 5 |
| DataGrid cell hover | `primary.main` text on a hovered row (`mui-x-data-grid.tsx`) | 3.98 dark on neutral (light passes) | Slice 5 |
| Soft hover pairs | text on `main` at 32% (`global-styles-components.ts`): success and warning in light (4.43, 4.48); secondary in dark (3.54, 3.95). The rest state passes everywhere | 3.54 dark secondary on paper | Slice 5 |
| Dark-scheme filled chip | `chip.tsx:115-116` uses `lighter` text on a `dark` fill. The lighter hover token in the dark scheme (decided in this slice) breaks that pairing | 1.00 to 1.56 | Slice 5 |
| Undefined font variable | `routes/components/error-boundary.tsx` uses `var(--font-stack-sans)` and `var(--font-stack-monospace)`, which are not defined anywhere, so the browser default font is used | not a contrast issue | Slice 9 |
| Focus ring overlaps the label | the ring around a Checkbox, Radio and Switch (the visible control) overlaps the start of the label text | not a contrast issue | Slice 5 |

## Appendix: measurements for the known failures

Pairs marked **FAILS** are the ones above. Passing rows are shown for context. Soft pairs use the `dark` step in the light scheme and the `light` step in the dark scheme, as the template does.

| Item | Scheme | Pair | Ratio | Min |
| --- | --- | --- | --- | --- |
| text.disabled (placeholder, floating label, nav caption) | light | text.disabled on default | 2.7334 | 4.5 **FAILS** |
| switch track (grey 500 at 48%) | light | track on default | 1.5487 | 3 **FAILS** |
| slider rail (primary at 38%) | light | rail on default | 1.7687 | 3 **FAILS** |
| link underline (primary at 40%) | light | underline on default | 1.8277 | 3 **FAILS** |
| DataGrid cell hover (primary.main text on hovered row) | light | primary.main on default + hover | 5.0531 | 4.5 (passes) |
| text.disabled (placeholder, floating label, nav caption) | light | text.disabled on paper | 2.7334 | 4.5 **FAILS** |
| switch track (grey 500 at 48%) | light | track on paper | 1.5487 | 3 **FAILS** |
| slider rail (primary at 38%) | light | rail on paper | 1.7687 | 3 **FAILS** |
| link underline (primary at 40%) | light | underline on paper | 1.8277 | 3 **FAILS** |
| DataGrid cell hover (primary.main text on hovered row) | light | primary.main on paper + hover | 5.0531 | 4.5 (passes) |
| text.disabled (placeholder, floating label, nav caption) | light | text.disabled on neutral | 2.5231 | 4.5 **FAILS** |
| switch track (grey 500 at 48%) | light | track on neutral | 1.5009 | 3 **FAILS** |
| slider rail (primary at 38%) | light | rail on neutral | 1.7340 | 3 **FAILS** |
| link underline (primary at 40%) | light | underline on neutral | 1.7894 | 3 **FAILS** |
| DataGrid cell hover (primary.main text on hovered row) | light | primary.main on neutral + hover | 4.6856 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | primary on default | 7.8767 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | primary on default | 6.1623 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | primary on paper | 7.8767 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | primary on paper | 6.1623 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | light | primary.lighter on primary.dark | 8.5291 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | secondary on default | 7.6076 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | secondary on default | 5.8877 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | secondary on paper | 7.6076 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | secondary on paper | 5.8877 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | light | secondary.lighter on secondary.dark | 7.2411 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | info on default | 9.5041 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | info on default | 7.3715 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | info on paper | 9.5041 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | info on paper | 7.3715 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | light | info.lighter on info.dark | 10.8110 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | success on default | 5.5809 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | success on default | 4.4264 | 4.5 **FAILS** |
| soft rest (dark text on main at 16%) | light | success on paper | 5.5809 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | success on paper | 4.4264 | 4.5 **FAILS** |
| chip filled (lighter text on dark fill) | light | success.lighter on success.dark | 6.1442 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | warning on default | 5.6111 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | warning on default | 4.4776 | 4.5 **FAILS** |
| soft rest (dark text on main at 16%) | light | warning on paper | 5.6111 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | warning on paper | 4.4776 | 4.5 **FAILS** |
| chip filled (lighter text on dark fill) | light | warning.lighter on warning.dark | 6.3224 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | error on default | 8.4959 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | error on default | 6.3065 | 4.5 (passes) |
| soft rest (dark text on main at 16%) | light | error on paper | 8.4959 | 4.5 (passes) |
| soft hover (dark text on main at 32%) | light | error on paper | 6.3065 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | light | error.lighter on error.dark | 9.5137 | 4.5 (passes) |
| text.disabled (placeholder, floating label, nav caption) | dark | text.disabled on default | 3.5848 | 4.5 **FAILS** |
| switch track (grey 500 at 48%) | dark | track on default | 2.4704 | 3 **FAILS** |
| slider rail (primary at 38%) | dark | rail on default | 1.9222 | 3 **FAILS** |
| link underline (primary at 40%) | dark | underline on default | 2.0013 | 3 **FAILS** |
| DataGrid cell hover (primary.main text on hovered row) | dark | primary.main on default + hover | 5.4090 | 4.5 (passes) |
| text.disabled (placeholder, floating label, nav caption) | dark | text.disabled on paper | 3.1769 | 4.5 **FAILS** |
| switch track (grey 500 at 48%) | dark | track on paper | 2.3838 | 3 **FAILS** |
| slider rail (primary at 38%) | dark | rail on paper | 1.8845 | 3 **FAILS** |
| link underline (primary at 40%) | dark | underline on paper | 1.9552 | 3 **FAILS** |
| DataGrid cell hover (primary.main text on hovered row) | dark | primary.main on paper + hover | 4.7488 | 4.5 (passes) |
| text.disabled (placeholder, floating label, nav caption) | dark | text.disabled on neutral | 2.6643 | 4.5 **FAILS** |
| switch track (grey 500 at 48%) | dark | track on neutral | 2.2153 | 3 **FAILS** |
| slider rail (primary at 38%) | dark | rail on neutral | 1.7825 | 3 **FAILS** |
| link underline (primary at 40%) | dark | underline on neutral | 1.8411 | 3 **FAILS** |
| DataGrid cell hover (primary.main text on hovered row) | dark | primary.main on neutral + hover | 3.9845 | 4.5 **FAILS** |
| soft rest (light text on main at 16%) | dark | primary on default | 8.5959 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | primary on default | 6.3650 | 4.5 (passes) |
| soft rest (light text on main at 16%) | dark | primary on paper | 7.5623 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | primary on paper | 5.6975 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | dark | primary.lighter on primary.dark | 1.3907 | 4.5 **FAILS** |
| soft rest (light text on main at 16%) | dark | secondary on default | 5.3416 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | secondary on default | 3.9534 | 4.5 **FAILS** |
| soft rest (light text on main at 16%) | dark | secondary on paper | 4.7004 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | secondary on paper | 3.5401 | 4.5 **FAILS** |
| chip filled (lighter text on dark fill) | dark | secondary.lighter on secondary.dark | 1.0000 | 4.5 **FAILS** |
| soft rest (light text on main at 16%) | dark | info on default | 9.9354 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | info on default | 7.0327 | 4.5 (passes) |
| soft rest (light text on main at 16%) | dark | info on paper | 8.7174 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | info on paper | 6.2894 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | dark | info.lighter on info.dark | 1.2085 | 4.5 **FAILS** |
| soft rest (light text on main at 16%) | dark | success on default | 9.0036 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | success on default | 6.3167 | 4.5 (passes) |
| soft rest (light text on main at 16%) | dark | success on paper | 7.8977 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | success on paper | 5.6505 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | dark | success.lighter on success.dark | 1.3051 | 4.5 **FAILS** |
| soft rest (light text on main at 16%) | dark | warning on default | 9.2030 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | warning on default | 6.1783 | 4.5 (passes) |
| soft rest (light text on main at 16%) | dark | warning on paper | 8.0846 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | warning on paper | 5.5515 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | dark | warning.lighter on warning.dark | 1.2737 | 4.5 **FAILS** |
| soft rest (light text on main at 16%) | dark | error on default | 7.7138 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | error on default | 5.7588 | 4.5 (passes) |
| soft rest (light text on main at 16%) | dark | error on paper | 6.8265 | 4.5 (passes) |
| soft hover (light text on main at 32%) | dark | error on paper | 5.1964 | 4.5 (passes) |
| chip filled (lighter text on dark fill) | dark | error.lighter on error.dark | 1.5571 | 4.5 **FAILS** |
