# AGENTS.md

Guidance for AI coding agents working in this repository. Read this fully before making changes.

## Project

EOCR-Application tracks accessibility vetting of software: VPAT documents, review workflow, exceptions (EEAAP), approval statuses, and renewals. There are two roles: **User** (requests software and tracks status) and **Admin** (reviews and decides).

The app is built in small **slices**. Each slice is a thin, end-to-end piece of functionality. Do only the slice you are given.

## Stack

- **server/**: .NET 10, ASP.NET Core with controllers, EF Core with SQL Server (LocalDB in development, Azure SQL in production). Namespace root: `Eocr.Server`.
- **client/**: React + TypeScript, Vite, React Router, TanStack Query, Material UI (MUI) with the MUI X Data Grid (community), built on the **Minimal UI** template foundation (see "UI" below).
- **Solution file**: `EOCR.slnx` (contains `server/` only; `client/` is a Vite project).

## Run locally

Run `dotnet` commands from the repo root and `npm` / `npx` commands from `client/`.

```bash
# API (http://localhost:5246), from the repo root
dotnet run --project server

# Client (http://localhost:5173), in a second terminal
cd client && npm run dev
```

Vite proxies `/api` to the API (see `client/vite.config.ts`). The browser only talks to the Vite origin, so no CORS configuration is needed in development. The client dev server stays on port 5173 (the template's default of 8081 is not used). In Development the server applies EF migrations and seeds dummy data on startup (`Data/DevSeeder.cs`).

Migrations:

```bash
dotnet ef migrations add <Name> --project server --output-dir Data/Migrations
```

## Slice workflow (important)

1. Work on **one slice at a time**. The slice description lists the scope, the files you may touch, and acceptance checks.
2. **Present a short plan first and wait for approval** before writing code.
3. Touch only the files the slice names. If something outside the slice needs changing, say so and stop instead of changing it.
4. Do not add features, tables, endpoints, packages, or abstractions that the slice does not call for. Do not refactor unrelated code.
5. When finished, summarize what changed, how to verify it, and anything you noticed but did not change.
6. Do not run `git commit`, `git push`, or create branches unless asked. The human reviews each diff and commits per slice.

## Server architecture

Organized by layer.

```
server/
  Auth/            # ICurrentUser seam, dev implementation
  Controllers/     # one controller per resource
  Data/
    Entities/      # EF entities (plain public classes)
    Migrations/
    CodeConstants.cs
    EocrDbContext.cs
    DevSeeder.cs
  DTOs/            # ALL DTOs live here, one class per file, named {Name}Dto
  Repos/           # {Name}Repo, with I{Name}Repo in the same file
  Program.cs
```

Rules:

- **Controllers are thin.** They handle HTTP only: resolving the current user, authorization, request and response shapes, status codes. No queries or business logic.
- Controllers use `[ApiController]`, `[Route("api/<resource>")]`, and inherit `ControllerBase`. Program.cs uses `AddControllers()` and `MapControllers()`.
- **One repo per resource** (`RequestRepo`, later `ReviewRepo`, and so on), registered as scoped in `Program.cs`. Repos use `EocrDbContext` directly (no generic repository wrapper). They hold queries and business rules, take plain arguments (such as a user ID), and **return DTOs**, never entities.
- **DTOs are plain public classes** with `{ get; set; }` properties, in `server/DTOs/`. Do not use records.
- **Do not use `sealed`** on any class, including entities and DTOs.
- Pass `CancellationToken` through controller actions and repo methods.
- Use `ActionResult` helpers with appropriate status codes. Validation failures return `400` with ProblemDetails.
- `/api/health` stays inline in `Program.cs`. `/api/me` lives in `MeController`.
- Namespace pattern: `Eocr.Server.<Folder>`.

## Data conventions

- **No C# enums for domain values.** Statuses, roles, and other select lists live in the `Codes` table:
  `Id`, `CodeType`, `Value`, `Label`, `Description`, `SortOrder`, `IsActive`, `IsSystem`, with a unique index on `(CodeType, Value)`.
- Entities reference codes by int foreign key (`StatusId`, `RoleId`) with a navigation property (`Status`, `Role`).
- All foreign keys use `DeleteBehavior.Restrict` unless a slice says otherwise.
- **Logic compares on the stable `Value` string, never on the numeric `Id`.** Values used by logic are defined once as string constants in `Data/CodeConstants.cs`.
- Codes the app depends on (request statuses, user roles) have `IsSystem = true`, are seeded with `HasData` and fixed Ids so they exist in every environment, and cannot be deleted or have their `Value` changed. Admin-managed lists (funding source, software category, and so on) are `IsSystem = false`.
- Repos validate that a referenced code has the expected `CodeType` before saving.
- DTOs expose codes as `{Name}Code` (the `Value`) and `{Name}Label` (the display text), for example `StatusCode` and `StatusLabel`.
- Use `DateTimeOffset` for timestamps, stored as UTC. Set max lengths on string columns.
- Computed values such as a request title are computed in DTOs, not stored.
- Binary files such as VPAT documents go in blob storage, with only a path in the database. Do not store file bytes in SQL.
- Seed data is fictional. Never use real people, vendors, or products in seed data or tests.

## Authentication and roles

- Roles are `UserRole` codes (`User`, `Admin`) referenced from `Users.RoleId`. The identity provider only proves who someone is. The provider is undecided (Entra ID or Keycloak), so the app must stay provider-agnostic and use standard OpenID Connect.
- Controllers depend on `ICurrentUser` only. Never read provider-specific claims in feature code. `ICurrentUser` exposes the role as its code `Value` string.
- Admin-only endpoints use an "Admin" authorization policy that checks the user's role code. Until real auth is in place, checks go through `ICurrentUser`.
- In Development, `DevCurrentUser` acts as the seeded user configured by `DevAuth:Email` in `appsettings.Development.json`, and looks codes up by `(CodeType, Value)`. Keep it set to the standard dev user (`dana@example.com`) when committing.
- Users must only ever see their own requests. Always filter by the current user's ID in user-facing queries.
- The client has **no authentication scaffolding of its own**. The template's JWT, guest/auth guards, sign-in and sign-up views, and mocked user are not used. The client learns who the user is from `GET /api/me` (`useCurrentUser`) and gates navigation and pages by `roleCode`. The server remains the authority on authorization.

## Client architecture

`client/` is the **Minimal UI `starter-vite-ts` v7.7.0**, vendored unmodified in its own `vendor:` commit and then stripped and adapted in later commits (see `docs/migration/template-provenance.md`). The strip slice removed auth, mock data, the settings drawer and context, RTL, header widgets, demo pages and assets, and the packages we have not approved. `client/src` today:

```
client/src/
  main.tsx            # entry: createBrowserRouter + RouterProvider
  app.tsx             # ThemeProvider (default mode light, mode storage key) and scroll-to-top
  global-config.ts    # CONFIG: appName, appVersion, assetsDir
  global.css          # font imports and baseline styles
  vite-env.d.ts
  components/         # custom-popover, hook-form (both unused until later slices), iconify, label,
                      #   loading-screen, logo, nav-section (vertical only), svg-color
  layouts/            # core/ (layout, header, main sections), dashboard/ (layout, nav-vertical, nav-mobile,
                      #   content, css-vars), components/menu-button.tsx, nav-config-dashboard.tsx (one item)
  pages/dashboard/    # one.tsx: the placeholder page at /dashboard
  routes/             # paths.ts, sections/ (index, dashboard), hooks/, components/ (RouterLink, ErrorBoundary)
  sections/blank/     # view.tsx: the placeholder view composed by pages/dashboard/one.tsx
  theme/              # template theme pipeline: core/, theme-config.ts, create-theme.ts, theme-provider.tsx
```

The shell is a `DashboardLayout` (header with the mobile menu button, a fixed vertical sidebar with one nav item, and main) and one placeholder page. Later slices add our domain folders under `sections/` and `pages/` as described under Rules, and add `lib/` (the `apiFetch` wrapper) when the first feature needs it. There is no settings drawer, no mode toggle yet, and no auth code in the client.

Rules:

- Organize by domain, not by file type. Pages stay thin: they set up the page heading and compose a section view.
- Imports use the absolute `src/...` form (template convention). No `@/` alias, and no long relative `../../` chains.
- File names are kebab-case (`status-chip.tsx`, `use-software.ts`). Components are PascalCase **named exports**, one component per file. Page files used with `lazy()` use a default export.
- Server data goes through **TanStack Query** (`useQuery` / `useMutation`). Do not fetch inside `useEffect` for real features. Do not add `axios` or `swr`.
- API calls use relative `/api/...` URLs through the shared client in `lib/`. Do not hard-code hosts or ports.
- Types in `sections/<domain>/types.ts` must match the server DTOs. Codes are plain strings (`statusCode`, `statusLabel`). Do not model codes as TypeScript unions or enums, since admins can add values. Style by code with a safe fallback for unknown codes, and always display the label.
- Dropdown options come from the server (`GET /api/codes/{codeType}`, added in the intake slice), not hard-coded lists.
- Function components and hooks only. Keep TypeScript strict. No `any` without a comment explaining why.
- Do not add state-management or other UI libraries without approval.

### UI (Material UI and Minimal UI)

- UI is **Material UI** (`@mui/material`, v9) with the **MUI X Data Grid community** package (`@mui/x-data-grid`). Styling is Emotion, through the theme in `src/theme/` and the `sx` prop.
- The foundation is **Minimal UI** (a purchased, commercially licensed template; the TypeScript Vite starter is the base and its full `vite-ts` demo is a reference for patterns). Its theme pipeline, layout core, dashboard layout, navigation, and shared components are the basis for this app. Port only what a slice names. The full demo source lives **outside this repository**; only the starter is vendored.
- Template licensing rules:
  - The repository must stay private.
  - The starter is committed as a vendor baseline (the `vendor:` commit). The full `vite-ts` demo stays **outside the repository**. Individual files from it are ported as their own `vendor:` commits (unmodified first, then adapted in separate commits).
  - Demo pages, `_mock` data, and auth views were removed in the strip slice and are never used.
  - Put our changes in our own override files where possible instead of editing template files in place. Keep `docs/migration/template-provenance.md` up to date with every template file we modify.
  - Keep an accurate license and attribution note in `THIRD_PARTY_NOTICES.md`. Minimal UI is commercially licensed, not open source.
- Do not use Tailwind, shadcn/ui, or any other UI library. Do not use MUI X Pro or Premium packages (they require a paid license). Theme augmentation imports come from the community packages only (for example `@mui/x-data-grid/themeAugmentation`), never from `-pro` or `-premium`.
- **Approved for the template foundation** (a slice still decides when each is added): `minimal-shared`, `@iconify/react`, `react-hook-form`, `@hookform/resolvers`, `zod` (v4), `es-toolkit`, `vitest` (test runner, dev dependency), and the two self-hosted font packages named under Fonts (`@fontsource-variable/public-sans`, `@fontsource/barlow`).
- **Not approved** (do not add, and remove from any ported file): the settings drawer and user-facing theme controls, RTL support (`@emotion/cache`, `@mui/stylis-plugin-rtl`, `stylis`), `axios`, `nprogress`, `simplebar-react` (use native scrolling), `@mui/lab`, `@mui/x-date-pickers`, `@mui/x-tree-view`, `@mui/x-charts`, `dayjs`, additional font packages, and `framer-motion`. If a slice needs `framer-motion` for a ported component, the slice must say so, wrap the app in `<MotionConfig reducedMotion="user">`, and avoid infinite or looping animation. Template files that depend on a package that is not approved (for example the date-picker form field) are not ported. A chart may never be the only way to see information: provide a table or text equivalent.
- **Icons** use the template's `Iconify` wrapper with its bundled offline icon set. Only registered icon names are allowed (the wrapper is typed to them); add any new icon to the registered set instead of loading it from the network. `@mui/icons-material` is being phased out and is removed once its remaining uses are migrated.
- **Fonts** are self-hosted through npm: Public Sans (`@fontsource-variable/public-sans`) for body text and Barlow (`@fontsource/barlow`, weights 700 and 800) for headings, with no external requests. In the template's typography only `h1`, `h2` and `h3` use Barlow; `h4` to `h6` and body text use Public Sans. Never load fonts, icons, or scripts from an external CDN or API.
- **Theme.** The theme is built by the template's pipeline from a **fixed configuration** (`theme/theme-config.ts`), with our own tokens and component overrides passed in through `themeOverrides` (`src/theme/eocr-tokens.ts`, `eocr-overrides.ts`, `eocr-components.ts`). There is no settings drawer. If ported components need the template's settings context, it is retained only as an internal source of fixed layout and theme values. Light and dark modes are both supported, light is the default, the existing color-mode toggle stays, and the initial mode must not flash on load. The template's default palette is **not** used unmodified: it fails WCAG AA in several places (white text on its primary, info, success, and error colors, placeholder text, outlined input borders, light-mode soft Label for success and warning, and secondary text on selected rows). Palette tokens are defined in `src/theme/eocr-tokens.ts` and applied by `src/theme/eocr-overrides.ts` (not by editing `theme-config.ts`), and each must pass the contrast rules in the Accessibility section. Component style changes go in `eocr-components.ts`, composed with the template's overrides through its `extend()` helper (a plain `themeOverrides` function or `variants` array would replace the template's).
- Wrap the app in `ThemeProvider` and `CssBaseline` (in `app.tsx` or the template's theme provider wrapper). Prefer theme values over hard-coded colors and spacing. Do not hard-code hex colors in components.
- Inline links in body text are underlined at rest; navigation, breadcrumb and button-like links may use a hover-only underline.
- Navigation items are real React Router links, and the active one carries `aria-current="page"`. Verify this in the template's nav components and add it if missing.
- Use the plain MUI `Table` (a real HTML `<table>`, with the template's table helpers where useful) for small, static lists. Use the Data Grid for lists that need sorting, filtering, or pagination, such as the user's request list and the admin queue. Every Data Grid needs an `aria-label`, must be keyboard operable, must show status as text, and has no checkbox selection unless a slice calls for it.
- **Forms** use `react-hook-form` with `zod` and the template's shared field components. Every field has a visible label. Shared field wrappers must: pass `inputRef` so focus moves to the first invalid field on submit; tie each error to its field with `aria-describedby` (including non-TextField controls) and `aria-invalid`; announce errors (an error summary or live region); and must not force `autoComplete="new-password"` (set a correct `autoComplete` per field purpose, or none). Fix these once in the shared wrappers, not per form.
- **Status display** uses a shared status chip built on the template's `Label`. It always shows the status text, never color alone, with a safe fallback for unknown codes.

### Writing React code

- Write readable, vertically formatted code. Do not put JSX, props, or objects all on one line. Template-derived files keep the template's Prettier formatting so they stay diffable. Our own code in `sections/` and `pages/` uses one attribute per line through a Prettier override in `prettier.config.mjs`. Run `npm run fm:fix`, which applies the right style per file, rather than formatting by hand.
- Follow industry-standard organization: one component per file, hooks named `useX`, and domain folders as shown above.
- Keep components small. Move data fetching into domain hooks and keep presentational components free of API calls.
- Import order and unused-import cleanup are enforced by ESLint (the template's rules). Run `npm run lint:fix`; do not reorder imports by hand.

## Accessibility (required)

This application tracks accessibility compliance, so it must itself meet **WCAG 2.1 AA**.

- Use semantic HTML (landmarks, headings in order, real `<button>` and `<a>` elements, `<table>` for tabular data). Each page has exactly one `h1`. Page titles use <Typography variant="h4" component="h1">, so they look like the template's page titles while being a real h1; any page heading rendered with a non-h1 element is corrected when ported.
- Every form control has a visible label. Errors are announced and tied to their field.
- Everything is keyboard operable with a visible focus indicator. The theme defines a `:focus-visible` outline of at least 3px with 3:1 contrast against its surroundings, for every interactive component including the template's buttons, tabs, and nav items.
- Never convey status by color alone. Status badges include text.
- Maintain sufficient color contrast. Every text/background pairing must meet 4.5:1 for normal text and 3:1 for large text. Component boundaries and states (input borders, checkbox and switch outlines, focus rings, selected states) must meet 3:1. Placeholder text meets 4.5:1. This applies to both light and dark modes and to every template color variant in use (soft, outlined, filled, hover and selected states). The measured ratios must be reported whenever the theme changes. The contrast test (`npm test`, `src/theme/theme-contrast.test.ts`) guards the pairs we are responsible for; `docs/migration/theme-contrast.md` has the ratio table, where each token comes from, and the known failures that remain with the slice that fixes each. Our color tokens live in `src/theme/eocr-tokens.ts`.
- Respect reduced-motion preferences: the theme or global CSS disables non-essential transitions and animations under `prefers-reduced-motion: reduce`, and no ported component animates indefinitely.
- Set a meaningful page title and move focus to the page `h1` on route changes (the shared `PageHeader` does both; the template's per-page `<title>` pattern is not used by itself). Page titles use `<Typography variant="h4" component="h1">` (heading semantics are separate from visual style), so they match the template's page titles and each page still has exactly one `h1`. Keep the skip link to the main content, and give the `<main>` landmark an id so the skip link works.
- Landmarks are labelled where there is more than one of a kind (for example the primary `nav`).
- Lint with `eslint-plugin-jsx-a11y`. No inline `eslint-disable` comments. The only exceptions are file-scoped overrides in `eslint.config.mjs` for template files scheduled for replacement, each with a "remove in Slice N" comment (listed in `docs/migration/template-provenance.md`). The ESLint config is the template's rules plus `jsx-a11y`, with `react/jsx-key` enabled.
- ESLint is pinned to v9 because `eslint-plugin-jsx-a11y` does not yet support v10. Do not upgrade `eslint` or `@eslint/js` past v9 until the plugin does.
- Automated checks: each page gets an axe check in the test suite once the testing slice lands. Automated checks do not replace the manual keyboard and screen-reader checks in a slice's acceptance list.

## Request status codes

Code type `RequestStatus`, values: `Draft`, `Submitted`, `AiReview`, `HumanReview`, `MoreInfoNeeded`, `AwaitingEeaap`, `Approved`, `ApprovedWithConditions`, `Denied`.

Status changes happen only through the repo layer, never by writing the column directly from a controller. Every status change will write a Workflow History record (added in a later slice).

## Definition of done

- `dotnet build` succeeds with no new warnings.
- `npm run build` and `npm run lint` pass in `client/`, and `npm run fm:check` passes once the tooling slice has added Prettier.
- The slice's acceptance checks pass when run manually.
- When the theme or any color changes, the contrast ratios were measured and reported for light and dark modes.
- No unrelated files were modified.
- No secrets, connection strings with credentials, or real data are committed.

## Do not

- Do not commit `bin/`, `obj/`, `node_modules/`, `dist/`, or `.env` files.
- Do not edit generated migration files by hand, other than removing a migration that has not been applied.
- Do not weaken or remove authorization checks to make something work.
- Do not remove or rename `/api/health` or `/api/me`, or change the `/api` prefix.
- Do not introduce enums, records for DTOs, or `sealed` classes.
- Do not reintroduce Tailwind or shadcn/ui.
- Do not copy template files into the repo wholesale beyond the vendored starter, and do not port demo pages, `_mock` data, auth views, or template modules that no slice has named. Do not import packages the starter ships that are not approved.
- Do not add a settings drawer, user-facing theme controls, or right-to-left support.
- Do not load fonts, icons, or scripts from external hosts, and do not use Iconify icon names that are not in the registered offline set.
- Do not use a template color, variant, or component state that fails the contrast rules above, even if it is the template's default.