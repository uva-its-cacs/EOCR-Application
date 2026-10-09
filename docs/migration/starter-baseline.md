# Starter baseline

State of `client/` (Minimal UI `starter-vite-ts` v7.7.0) after the vendor commit and the npm/port changes, before any stripping. Results are as shipped; nothing was fixed.

## Environment

- Node v24.19.0, npm 11.15.0 (Windows 11)
- Install: `npm ci` against the shipped `package-lock.json` succeeded (435 packages installed, 13 vulnerabilities reported by npm audit: 1 low, 2 moderate, 10 high; not addressed).
- Lock file check: 484 package entries checked, every `resolved` URL starts with `https://registry.npmjs.org/` (0 exceptions).

## Package versions (installed)

| Package | Version |
| --- | --- |
| react | 19.2.6 |
| react-router | 7.15.0 |
| @mui/material | 9.0.1 |
| @mui/x-data-grid | 9.1.0 |
| vite | 8.0.12 |
| typescript | 5.9.3 |
| eslint | 9.39.4 |

## Scripts

`dev` (vite), `start` (vite preview), `build` (`tsc && vite build`), `lint`, `lint:fix`, `lint:print`, `fm:check`, `fm:fix`, `fix:all`, `tsc:watch`, `tsc:print`, `tsc:check`.

Removed from the shipped set: `clean`, `re:dev`, `re:build`, `re:build-npm` (yarn and `rm -rf`).

## Results

| Command | Result |
| --- | --- |
| `npm run dev` | Serves at http://localhost:5173. The starter renders ("Page one" with side nav and header). vite-plugin-checker: TypeScript 0 errors, ESLint 0 errors and 0 warnings. |
| `npm run build` | Exit 0 (built in about 42 s). 2 warnings: (1) some chunks are larger than 500 kB after minification (largest `useMediaQuery` 579 kB, `index` 478 kB, `jwt` 403 kB); (2) significant time spent in `vite-plugin-checker`. |
| `npm run lint` | Exit 0, no output (0 errors, 0 warnings). |

## /api requests

The API server was not running during the check. Loading `/` in headless Edge produced **no** requests to `/api` (auth is skipped via `CONFIG.auth.skip = true`), so no request failed or returned 404. Only the `/` route was loaded.

## External hosts the starter can contact

Observed at runtime (headless Edge load of `/`, net log):

| Host | File | Note |
| --- | --- | --- |
| `purecatamphetamine.github.io` | `src/components/flag-icon/flag-icon.tsx:23` | Country flag SVG (`/country-flag-icons/3x2/GB.svg`) loaded by the header language flag. |

All other non-localhost traffic in the net log (`edge.microsoft.com`, `bing.com`, `office.com`, Google update hosts, and so on) came from the Edge browser itself, not the page. Only the Vite dev origin and its websocket were otherwise used. The user is asked to confirm in a normal browser's Network tab.

Present in code or config, not observed on first load:

| Host or URL | File | Note |
| --- | --- | --- |
| `https://mui.com/store/items/minimal-dashboard/` | `src/routes/paths.ts:12` | Navigation link (`minimalStore`). |
| `http://localhost:8080/...mp3` | `src/layouts/components/notifications-drawer/notification-item.tsx:161` | Demo notification file thumbnail. |
| `https://www.cloud.com/s/...` (about 20 URLs) | `src/_mock/_files.ts` | Mock file URLs (data only). |
| `facebook.com`, `instagram.com`, `linkedin.com`, `twitter.com` | `src/_mock/_others.ts`, `src/_mock/_user.ts` | Mock social links. |
| `https://docs.minimals.cc/icons/` | `src/components/iconify/iconify.tsx:28` | Text in a console warning, not a request. |
| `https://docs.minimals.cc/mock-server/` | `client/.env.example:2` | Comment only. |
| `CONFIG.serverUrl` (`VITE_SERVER_URL`, now empty) | `src/global-config.ts:36`, `src/lib/axios.ts:10` | Axios base URL. With it empty, requests go to the same origin (`/api/...`, proxied to the API). The shipped value pointed at `api-dev-minimal-v700.pages.dev`. |
| Iconify API (default of `@iconify/react`) | `src/components/iconify/iconify.tsx` | Library behavior: an icon name not registered for offline use may be fetched from the Iconify API. Not observed on first load. |

Fonts come from `@fontsource*` npm packages (self-hosted); no CDN font links were found in `index.html`, `public/`, or `vercel.json`.
