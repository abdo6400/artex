# Artex platform

This repository is a pnpm/Turborepo workspace with one deployable Next.js application.

## Application

- `apps/web`: public bilingual portfolio at `/en` and `/ar`, authenticated dashboard at `/dashboard`, and versioned Route Handler API at `/api/v1`.

## Packages

- `packages/contracts`: framework-independent runtime schemas and API types.
- `packages/database`: database schema, migrations, and adapters.
- `packages/i18n`: supported locale definitions and helpers.
- `packages/ui`: reusable, business-independent UI primitives.
- `packages/config`: shared configuration.

## Architecture rules

- Organize code by business feature.
- Keep Next.js route handlers thin.
- API business modules use `domain`, `application`, `infrastructure`, and `presentation` boundaries under `apps/web/src/server`.
- Browser-facing features access persistent data through the API layer, never through database adapters.
- Put code in a shared package only when more than one feature genuinely needs it.
- Validate external data with schemas from `@artex/contracts`.
- Prefer Server Components; add `use client` only at an interaction boundary.
- Use strict TypeScript and avoid untyped boundary data.

## Commands

- `pnpm dev`: run the platform at port 3000.
- `pnpm build`: build all workspaces.
- `pnpm lint`: lint all workspaces.
- `pnpm typecheck`: type-check all workspaces.
- `pnpm test`: test all workspaces.
- `pnpm check`: run the complete local validation sequence.
