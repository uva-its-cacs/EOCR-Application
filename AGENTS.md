# AGENTS.md

Guidance for AI coding agents working in this repository. Read this fully before making changes.

## Project

EOCR-Application tracks accessibility vetting of software: VPAT documents, review workflow, exceptions (EEAAP), approval statuses, and renewals. There are two roles: **User** (requests software and tracks status) and **Admin** (reviews and decides).

The app is built in small **slices**. Each slice is a thin, end-to-end piece of functionality. Do only the slice you are given.

## Stack

- **server/**: .NET 10, ASP.NET Core Minimal APIs, EF Core with SQL Server (LocalDB in development, Azure SQL in production). Namespace root: `Eocr.Server`.
- **client/**: React + TypeScript, Vite, React Router, TanStack Query.
- **Solution file**: `EOCR.slnx` (contains `server/` only; `client/` is a Vite project).

## Run locally

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

Organized by feature (vertical slices), not by technical layer.

```
server/
  Auth/                    # ICurrentUser seam, dev implementation
  Data/
    Entities/              # EF entities and enums
    Migrations/
    EocrDbContext.cs
    DevSeeder.cs
  Features/
    <Feature>/
      <Feature>Dtos.cs
      <Feature>Endpoints.cs
      <Feature>Service.cs
  Program.cs
```

Rules:

- **Endpoints are thin.** They handle HTTP only: resolving the current user, authorization, request and response shapes, status codes. No business logic or queries.
- **One service per feature** (`RequestService`, later `ReviewService`, and so on), with an interface, registered as scoped in `Program.cs`. Services hold queries, business rules, and the request status state machine.
- **Services take plain arguments** (such as a user ID) and **return DTOs**. Never return EF entities from services or endpoints.
- **No repository layer.** Services use `EocrDbContext` directly.
- Trivial reads (`/api/health`, `/api/me`) may stay inline in `Program.cs`. Anything with a rule goes through a service.
- Group routes with `MapGroup("/api/<feature>")`. All API routes start with `/api`.
- Use `CancellationToken` on async endpoints and service methods.
- Use `Results.*` with appropriate status codes. Validation failures return `400` with ProblemDetails.
- Do not change the namespace pattern: `Eocr.Server.<Folder>`.

## Data conventions

- Enums are stored as **strings** (`HasConversion<string>()`) and serialized as strings in JSON. Set max lengths on string columns.
- Use `DateTimeOffset` for timestamps, stored as UTC.
- Prefer admin-editable lookup lists (category, funding source, department) in a Reference Data table, and fixed workflow concepts (request status, review type, decision) as C# enums.
- Computed values such as a request title are computed in DTOs, not stored.
- Binary files such as VPAT documents go in blob storage, with only a path in the database. Do not store file bytes in SQL.
- Seed data is fictional. Never use real people, vendors, or products in seed data or tests.

## Authentication and roles

- Roles are **User** and **Admin**, stored in our own `Users` table. The identity provider only proves who someone is. The provider is undecided (Entra ID or Keycloak), so the app must stay provider-agnostic and use standard OpenID Connect.
- Endpoints depend on `ICurrentUser` only. Never read provider-specific claims in feature code.
- Admin-only endpoints use `RequireAuthorization("Admin")` once real auth is in place. Until then, authorization checks go through `ICurrentUser`.
- In Development, `DevCurrentUser` acts as the seeded user configured by `DevAuth:Email` in `appsettings.Development.json`.
- Users must only ever see their own requests. Always filter by the current user's ID in user-facing queries.

## Client architecture

```
client/src/
  app/          # providers, router, query client
  components/   # shared, reusable UI
  features/     # one folder per domain (requests/, reviews/, ...)
    <feature>/
      components/
      api.ts    # fetch functions for this feature
      types.ts
  hooks/
  lib/          # API client wrapper, utilities
  pages/        # route-level components
```

Rules:

- Organize by feature, not by file type.
- Server data goes through **TanStack Query** (`useQuery` / `useMutation`). Do not fetch inside `useEffect` for real features.
- API calls use relative `/api/...` URLs through the shared client in `lib/`. Do not hard-code hosts or ports.
- Types in `features/<feature>/types.ts` must match the server DTOs. Keep status values identical to the server enums (strings).
- Function components and hooks only. Keep TypeScript strict. No `any` without a comment explaining why.
- Do not add UI libraries or state-management libraries without approval.

## Accessibility (required)

This application tracks accessibility compliance, so it must itself meet **WCAG 2.1 AA**.

- Use semantic HTML (landmarks, headings in order, real `<button>` and `<a>` elements, `<table>` for tabular data).
- Every form control has a visible label. Errors are announced and tied to their field.
- Everything is keyboard operable with a visible focus indicator.
- Never convey status by color alone. Status badges include text.
- Maintain sufficient color contrast and respect reduced-motion preferences.
- Set a meaningful page title and move focus sensibly on route changes.
- Lint with `eslint-plugin-jsx-a11y`. Fix violations, do not disable rules.

## Request status values

`Draft`, `Submitted`, `AiReview`, `HumanReview`, `MoreInfoNeeded`, `AwaitingEeaap`, `Approved`, `ApprovedWithConditions`, `Denied`.

Status changes happen only through the service layer, never by writing the column directly from an endpoint. Every status change will write a Workflow History record (added in a later slice).

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
- Do not rename the `/api/health` route or the `/api` prefix.
- Do not remove or rename `/api/health` or `/api/me`.

## Writing react code
-Please do not do all on one line, make it readable vertical format
-Organize in industry standard
