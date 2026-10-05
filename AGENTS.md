# AGENTS.md

Guidance for AI coding agents working in this repository. Read this fully before making changes.

## Project

EOCR-Application tracks accessibility vetting of software: VPAT documents, review workflow, exceptions (EEAAP), approval statuses, and renewals. There are two roles: **User** (requests software and tracks status) and **Admin** (reviews and decides).

The app is built in small **slices**. Each slice is a thin, end-to-end piece of functionality. Do only the slice you are given.

## Stack

- **server/**: .NET 10, ASP.NET Core with controllers, EF Core with SQL Server (LocalDB in development, Azure SQL in production). Namespace root: `Eocr.Server`.
- **client/**: React + TypeScript, Vite, React Router, TanStack Query.
- **Solution file**: `EOCR.slnx` (contains `server/` only; `client/` is a Vite project).

## Run locally

Run all commands from the repo root.

```bash
# API (http://localhost:5246)
dotnet run --project server

# Client (http://localhost:5173), in a second terminal
cd client && npm run dev
```

Vite proxies `/api` to the API (see `client/vite.config.ts`). The browser only talks to the Vite origin, so no CORS configuration is needed in development. In Development the server applies EF migrations and seeds dummy data on startup (`Data/DevSeeder.cs`).

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
- Entities reference codes by int foreign key (`StatusId`, `RoleId`) with a navigation property (`Status`, `Role`). Use `DeleteBehavior.Restrict`.
- **Logic compares on the stable `Value` string, never on the numeric `Id`.** Values used by logic are defined once as string constants in `Data/CodeConstants.cs`.
- Codes the app depends on (request statuses, user roles) have `IsSystem = true`, are seeded with `HasData` and fixed Ids so they exist in every environment, and cannot be deleted or have their `Value` changed. Admin-managed lists (funding source, software category, and so on) are `IsSystem = false`.
- Repos validate that a referenced code has the expected `CodeType` before saving.
- DTOs expose codes as `{Name}Code` (the `Value`) and `{Name}Label` (the display text), for example `StatusCode` and `StatusLabel`.
- Use `DateTimeOffset` for timestamps, stored as UTC. Set max lengths on string columns.
- Computed values such as a request title are computed in DTOs, not stored.
- Binary files such as VPAT documents go in blob storage, with only a path in the database. Do not store file bytes in SQL.
- Seed data is fictional. Never use real people, vendors, or products in seed data or tests.
-All foreign keys use DeleteBehavior.Restrict unless a slice says otherwise.

## Authentication and roles

- Roles are `UserRole` codes (`User`, `Admin`) referenced from `Users.RoleId`. The identity provider only proves who someone is. The provider is undecided (Entra ID or Keycloak), so the app must stay provider-agnostic and use standard OpenID Connect.
- Controllers depend on `ICurrentUser` only. Never read provider-specific claims in feature code. `ICurrentUser` exposes the role as its code `Value` string.
- Admin-only endpoints use an "Admin" authorization policy that checks the user's role code. Until real auth is in place, checks go through `ICurrentUser`.
- In Development, `DevCurrentUser` acts as the seeded user configured by `DevAuth:Email` in `appsettings.Development.json`, and looks codes up by `(CodeType, Value)`.
- Users must only ever see their own requests. Always filter by the current user's ID in user-facing queries.

## Client architecture

```
client/src/
  app/          # Providers.tsx, queryClient.ts, router.tsx
  components/   # shared, reusable UI (Layout, ...)
  features/     # one folder per domain (requests/, reviews/, ...)
    <feature>/
      components/
      api.ts    # fetch functions for this feature
      types.ts
  hooks/
  lib/          # api.ts: apiFetch wrapper
  pages/        # route-level components that compose features
  main.tsx
```

Rules:

- Organize by feature, not by file type.
- Server data goes through **TanStack Query** (`useQuery` / `useMutation`). Do not fetch inside `useEffect` for real features.
- API calls use relative `/api/...` URLs through the shared client in `lib/`. Do not hard-code hosts or ports.
- Types in `features/<feature>/types.ts` must match the server DTOs. Codes are plain strings (`statusCode`, `statusLabel`). Do not model codes as TypeScript unions or enums, since admins can add values. Style by code with a safe fallback for unknown codes, and always display the label.
- Dropdown options come from the server (`GET /api/codes/{codeType}`, added in the intake slice), not hard-coded lists.
- Function components and hooks only. Keep TypeScript strict. No `any` without a comment explaining why.
- UI: Tailwind CSS and shadcn/ui are the approved stack. shadcn components are copied into `src/components/ui/` and may be customized there. Do not add other UI or state-management libraries without approval.

## Accessibility (required)

This application tracks accessibility compliance, so it must itself meet **WCAG 2.1 AA**.

- Use semantic HTML (landmarks, headings in order, real `<button>` and `<a>` elements, `<table>` for tabular data).
- Every form control has a visible label. Errors are announced and tied to their field.
- Everything is keyboard operable with a visible focus indicator.
- Never convey status by color alone. Status badges include text.
- Maintain sufficient color contrast and respect reduced-motion preferences.
- Set a meaningful page title and move focus to the page `h1` on route changes.
- Lint with `eslint-plugin-jsx-a11y`. Fix violations, do not disable rules.
- ESLint is pinned to v9 because `eslint-plugin-jsx-a11y` does not yet support v10. Do not upgrade `eslint` or `@eslint/js` past v9 until the plugin does.
## Request status codes

Code type `RequestStatus`, values: `Draft`, `Submitted`, `AiReview`, `HumanReview`, `MoreInfoNeeded`, `AwaitingEeaap`, `Approved`, `ApprovedWithConditions`, `Denied`.

Status changes happen only through the repo layer, never by writing the column directly from a controller. Every status change will write a Workflow History record (added in a later slice).

## Definition of done

- `dotnet build` succeeds with no new warnings.
- `npm run build` and `npm run lint` pass in `client/`.
- The slice's acceptance checks pass when run manually.
- No unrelated files were modified.
- No secrets, connection strings with credentials, or real data are committed.

## Do not

- Do not commit `bin/`, `obj/`, `node_modules/`, `dist/`, or `.env` files.
- Do not edit generated migration files by hand, other than removing a migration that has not been applied.
- Do not weaken or remove authorization checks to make something work.
- Do not remove or rename `/api/health` or `/api/me`, or change the `/api` prefix.
- Do not introduce enums, records for DTOs, or `sealed` classes.


## Writing react code
-Please do not do all on one line, make it readable vertical format
-Organize in industry standard
