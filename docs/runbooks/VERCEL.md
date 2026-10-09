# Vercel deployment

Artex deploys as one Next.js application in one Vercel project. The same origin serves the bilingual portfolio at `/en` and `/ar`, the dashboard at `/dashboard`, and the versioned API at `/api/v1`.

## 1. Import the project once

Import `abdo6400/artex` into Vercel with these settings:

- Project name: `artex`
- Framework Preset: **Next.js**
- Root Directory: `apps/web`
- Include source files outside the Root Directory: enabled

Vercel detects pnpm and the workspace packages from the repository root. Every push to `main` creates one deployment containing all three surfaces.

## 2. Add storage to the same project

1. In the Vercel Marketplace, create a Neon Postgres database and connect it to `artex` as `DATABASE_URL`.
2. Create a Vercel Blob store and connect it to `artex`. The integration injects `BLOB_READ_WRITE_TOKEN`.

PostgreSQL stores content, accounts, sessions, leads, and media metadata. Blob stores uploaded image bytes because a Vercel Function filesystem is temporary.

## 3. Configure environment variables

Replace `https://example.com` with the final Vercel or custom production origin. Set these for Production and for any Preview environment that should use a database.

```dotenv
DATABASE_URL=<pooled Neon PostgreSQL URL>
RATE_LIMIT_SALT=<at least 32 random characters>
MFA_ENCRYPTION_KEY=<64 hexadecimal characters>
REQUIRE_OWNER_MFA=true
MEDIA_STORAGE_DRIVER=vercel-blob
BLOB_READ_WRITE_TOKEN=<injected by Vercel Blob>
MEDIA_PUBLIC_BASE_URL=https://example.com/api/v1/public/media
API_INTERNAL_URL=https://example.com
NEXT_PUBLIC_API_URL=https://example.com
NEXT_PUBLIC_SITE_URL=https://example.com
WEB_ORIGIN=https://example.com
DASHBOARD_ORIGIN=https://example.com
```

Use the exact origin without a trailing slash. Preview deployments need their matching `DASHBOARD_ORIGIN` for dashboard mutations; production should use the stable production origin.

## 4. Migrate and seed PostgreSQL

Add the pooled Neon URL as the `DATABASE_URL` secret in the GitHub `production` environment. Run the **Database deployment** workflow from GitHub Actions. It checks and applies committed Drizzle migrations and can seed the bilingual site content.

Create the initial owner once from a trusted local terminal. Do not store the bootstrap password in GitHub or Vercel:

```powershell
$env:DATABASE_URL="<pooled Neon PostgreSQL URL>"
$env:OWNER_EMAIL="owner@example.com"
$env:OWNER_NAME="Artex Owner"
$env:OWNER_PASSWORD="<strong temporary password>"
pnpm db:seed-owner
Remove-Item Env:OWNER_PASSWORD
```

The owner completes authenticator setup at `/dashboard/security` during the first production login.

## 5. Verify

1. Open `/api/v1/ready`; it must return a successful response.
2. Open `/dashboard/login`, sign in, and finish MFA enrollment.
3. Upload an image and publish a bilingual content change.
4. Confirm `/en` and `/ar` show the update.
5. Submit a contact request and confirm it appears in Dashboard > Leads.

Database migrations remain an explicit GitHub Actions operation and do not run during a Vercel build.
