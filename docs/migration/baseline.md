# Pre-template baseline

- Date: 2026-10-08
- Git: branch `mui-template`, tag `pre-template` (commit `56c2fb5`, on top of `ea76712`)
- Node: v24.19.0
- App root: `client/`

## Results

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` (`tsc -b && vite build`) | PASS | Warning: Vite config uses `__dirname` (vite.config.ts:10), unsupported by `configLoader: 'native'`. Warning: main JS chunk is 1,169 kB (>500 kB). |
| `npm run lint` (`eslint .`) | PASS | No errors or warnings. |
| `npm test` | N/A | No test script exists. |

## Installed versions (`npm ls`)

| Package | Version |
| --- | --- |
| react | 19.3.0 |
| react-dom | 19.3.0 |
| react-router-dom | 7.18.4 |
| @mui/material | 9.4.0 |
| @mui/icons-material | 9.4.0 |
| @mui/x-data-grid | 9.15.0 |
| @mui/x-date-pickers | not installed |
| @emotion/react | 11.14.0 |
| @emotion/styled | 11.14.1 |
| @tanstack/react-query | 5.104.1 |
| typescript | 6.0.3 |
| vite | 8.3.2 |

## npm scripts

- `dev`: `vite`
- `build`: `tsc -b && vite build`
- `lint`: `eslint .`
- `preview`: `vite preview`
