# Artex Platform

Production platform for Artex Production. It is a pnpm/Turborepo workspace with one deployable Next.js application and shared packages.

## Application routes

- `/en` and `/ar` — bilingual public portfolio.
- `/dashboard` — authenticated content-management dashboard.
- `/api/v1` — versioned HTTP API.

All routes are implemented in `apps/web` and deploy together as one Vercel project. API business code remains separated under `src/server` using domain, application, infrastructure, and presentation boundaries.

## Local development

```powershell
pnpm install
Copy-Item apps/web/.env.example apps/web/.env.local
pnpm dev
```

Configure PostgreSQL and replace the example security values in `apps/web/.env.local`. To start local PostgreSQL with Docker:

```powershell
docker compose -f infrastructure/docker/compose.yml up -d postgres
pnpm db:migrate
pnpm db:seed-site
pnpm db:seed-owner
```

Then open:

- Website: `http://localhost:3000/en` or `/ar`
- Dashboard: `http://localhost:3000/dashboard/login`
- API health: `http://localhost:3000/api/v1/health`

Local development defaults to `REQUIRE_OWNER_MFA=false`. Production must set it to `true`. Accounts that have already enabled an authenticator still require its current code.

## Database

Drizzle migrations are committed in `packages/database/drizzle`:

```powershell
pnpm db:check
pnpm db:migrate
pnpm db:seed-site
pnpm db:seed-owner
```

The owner seed reads `OWNER_EMAIL`, `OWNER_NAME`, and `OWNER_PASSWORD` and never overwrites an existing account. Do not keep the bootstrap password in production configuration.

Set `TEST_DATABASE_URL` to a dedicated disposable database with `test` in its name to run the PostgreSQL integration suite. CI provisions this database automatically.

## Validation and deployment

```powershell
pnpm check
```

See [the Vercel runbook](docs/runbooks/VERCEL.md) for the single-project Vercel, Neon, and Blob setup. Container deployment and recovery operations are documented in [DEPLOYMENT.md](docs/runbooks/DEPLOYMENT.md).
