# Artex Production Platform Plan

## 1. Objective

Build a production-ready platform for Artex Production with one deployable Next.js application with three route surfaces:

1. A bilingual public portfolio website.
2. A secure administration dashboard for managing all public content and incoming leads.
3. A versioned API used by both applications and future integrations.

The existing React/Vite website is the visual and content baseline. It will be migrated into the new public Next.js application rather than discarded.

## 2. Target architecture

Use a pnpm workspace with Turborepo for orchestration. Each application owns its delivery concerns, while shared packages contain stable contracts and reusable code.

```text
artex/
├── apps/
│   ├── web/                       # Public Next.js application
│   ├── dashboard/                 # Admin Next.js application
│   └── api/                       # Dedicated Next.js API application
├── packages/
│   ├── contracts/                 # API DTOs, schemas, enums, response types
│   ├── database/                  # Database client, schema, migrations, seeds
│   ├── ui/                        # Shared design tokens and approved UI primitives
│   ├── i18n/                      # Locale configuration and translation helpers
│   ├── config/                    # Shared TypeScript, ESLint, and tooling config
│   └── test-utils/                # Factories and integration-test helpers
├── infrastructure/
│   ├── docker/                    # Local and production container definitions
│   ├── proxy/                     # Reverse-proxy configuration when self-hosting
│   └── monitoring/                # Logging, tracing, alerting configuration
├── docs/
│   ├── architecture/
│   ├── api/
│   └── runbooks/
├── .github/workflows/
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

Suggested production stack:

- Next.js App Router and TypeScript for all three applications.
- PostgreSQL for persistent data.
- Prisma or Drizzle as the database adapter; choose one during project bootstrap and use it only inside `packages/database` and API infrastructure code.
- Zod schemas in `packages/contracts` for runtime validation and inferred TypeScript types.
- S3-compatible object storage for portfolio images, client logos, PDFs, and social images.
- Standards-based admin authentication with secure HTTP-only sessions, password reset, optional MFA, and role-based authorization.
- Transactional email provider for contact notifications and authentication emails.
- OpenTelemetry-compatible tracing, structured logs, error tracking, uptime checks, and web analytics.

## 3. Application boundaries

### `apps/web`

The public site owns rendering, SEO, localization, accessibility, and conversion flows. It does not connect directly to the database.

Pages and features:

- Arabic and English localized routes under `/[locale]`.
- Home page sections: hero, about, services, portfolio, values, clients, contact, and footer.
- Project listing and project detail pages with stable localized slugs.
- Service listing and service detail pages.
- Contact and quote-request forms with real validation and submission.
- Metadata, canonical links, `hreflang`, Open Graph images, sitemap, robots file, and structured data.
- Optimized local or managed images through `next/image`.
- Server-rendered public content with cache tags and revalidation after dashboard updates.
- Custom loading, empty, error, not-found, and maintenance states.

Server Components should perform public reads through a typed API client. Client Components should be limited to interactions such as filters, forms, navigation, and galleries.

### Dashboard routes

The dashboard is a separate authenticated Next.js application, normally hosted on an admin subdomain. It consumes the API and never imports database code.

Modules:

- Login, logout, password reset, session management, and optional MFA.
- Overview with project counts, unread leads, publishing state, and recent activity.
- Projects: create, edit, preview, publish, unpublish, archive, order, categorize, and manage galleries.
- Services, values, client logos, company profile, contact details, and social links.
- English and Arabic content editing with completeness indicators.
- Media library with upload progress, metadata, alt text, focal point, replacement, and safe deletion checks.
- Contact leads with search, filters, statuses, notes, assignment, export, and spam marking.
- SEO fields and social preview management.
- User and role management.
- Audit log showing actor, action, entity, timestamp, and relevant change metadata.
- Site settings and cache revalidation controls.

Initial roles:

- `OWNER`: full access, including users and security settings.
- `ADMIN`: full content and lead management.
- `EDITOR`: content and media management without user/security access.
- `VIEWER`: read-only dashboard access.

### API routes

The API is a dedicated Next.js application exposing Route Handlers under `/api/v1`. Route files are transport adapters only; business rules live in application use cases.

Each business module follows this boundary:

```text
src/modules/projects/
├── domain/             # Entities, value objects, domain errors, repository ports
├── application/        # Use cases, commands/queries, policies, DTO mapping
├── infrastructure/     # Database repository and external service adapters
└── presentation/http/  # Route handlers, request parsing, response mapping
```

Dependency direction:

```text
presentation -> application -> domain
infrastructure implements ports defined toward the domain/application core
```

Core API modules:

- `auth`
- `users`
- `projects`
- `categories`
- `services`
- `clients`
- `company-profile`
- `site-settings`
- `media`
- `leads`
- `audit-log`
- `health`

API requirements:

- `/api/v1` versioning from the first release.
- Zod validation at every external boundary.
- Consistent success, validation-error, and problem-details responses.
- Cursor pagination for lists that can grow.
- Search, filtering, sorting, and sparse public responses where useful.
- Authentication plus role and permission checks on every admin endpoint.
- CSRF protection for cookie-authenticated mutations and strict CORS allowlists.
- Rate limiting and bot protection for login, upload, and contact endpoints.
- Idempotency for lead submission and media finalization.
- OpenAPI specification generated or checked against the shared contracts.
- Request IDs, structured logging, audit events, and health/readiness endpoints.

Initial endpoint groups:

```text
GET    /api/v1/public/site
GET    /api/v1/public/projects
GET    /api/v1/public/projects/:slug
GET    /api/v1/public/services
POST   /api/v1/public/leads

POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/session

GET    /api/v1/admin/projects
POST   /api/v1/admin/projects
GET    /api/v1/admin/projects/:id
PATCH  /api/v1/admin/projects/:id
DELETE /api/v1/admin/projects/:id
POST   /api/v1/admin/projects/:id/publish

GET    /api/v1/admin/leads
PATCH  /api/v1/admin/leads/:id
GET    /api/v1/admin/media
POST   /api/v1/admin/media/upload-url
POST   /api/v1/admin/media/finalize
```

The remaining content modules follow the same CRUD and publishing conventions.

## 4. Data model

All content records use UUIDs, `createdAt`, `updatedAt`, and optimistic concurrency or an equivalent lost-update safeguard. Published content also has `status`, `publishedAt`, and optional scheduling fields.

Primary entities:

- `User`, `Role`, `Permission`, `Session`, and `PasswordResetToken`.
- `Project`, `ProjectTranslation`, `ProjectCategory`, and `ProjectMedia`.
- `Service` and `ServiceTranslation`.
- `Value` and `ValueTranslation`.
- `Client` and `ClientTranslation` where localized fields are needed.
- `CompanyProfile` and `CompanyProfileTranslation`.
- `SiteSettings` and localized SEO settings.
- `MediaAsset` with storage key, MIME type, size, dimensions, checksum, and alt text.
- `Lead` and `LeadNote`.
- `AuditLog`.

Translations should use related translation tables keyed by locale instead of duplicating full entities. Only Arabic and English are initially accepted, but the model should allow additional locales later.

Deletion policy:

- Content and users are archived or soft-deleted when business history matters.
- Media cannot be deleted while referenced by published content.
- Leads follow a documented retention policy and can be anonymized on request.
- Audit logs are append-only and have a restricted retention policy.

## 5. Shared contracts and UI

`packages/contracts` is the single source of truth for request schemas, response schemas, error codes, permissions, and public types. It must not contain framework, database, or UI dependencies.

`packages/ui` contains design tokens and truly shared primitives such as buttons, fields, dialogs, tables, and feedback states. Public-site compositions and dashboard business components remain inside their own applications to prevent accidental coupling.

No application may import another application's source code. Communication between applications happens through the API contract.

## 6. Security baseline

- Enforce HTTPS and secure, HTTP-only, same-site cookies.
- Store password hashes using a modern memory-hard algorithm if local credentials are enabled.
- Rotate sessions after login and privilege changes; support server-side revocation.
- Require MFA for owner accounts before production sign-off.
- Apply authorization in API use cases as well as route-level guards.
- Validate upload type, size, extension, and file signature; upload directly to object storage using short-lived signed URLs.
- Use a strict Content Security Policy, security headers, origin checks, and a limited CORS policy.
- Keep secrets in the deployment platform's secret manager; commit only `.env.example` files.
- Add dependency, secret, and static-analysis scans to CI.
- Back up the database automatically and test restoration before launch.
- Keep audit records for authentication, authorization, publishing, deletion, settings, and user-management actions.

## 7. Quality strategy

Testing should protect behavior and architectural boundaries rather than mirror implementation details.

- Unit tests: domain rules, permission policies, value objects, validation, and mapping.
- Integration tests: repositories against a real disposable PostgreSQL instance and API use cases with external adapters replaced.
- API contract tests: status codes, schemas, authentication, authorization, pagination, and error responses.
- End-to-end tests: admin login, content publishing, localized public display, lead submission, media upload, and access denial.
- Accessibility tests: keyboard navigation, focus, labels, contrast, landmarks, and automated axe checks.
- Visual regression tests for the public home page and critical dashboard screens.
- Performance budgets for public JavaScript, images, LCP, CLS, and INP.

Every pull request must run formatting, linting, type checking, tests, production builds, migration validation, and dependency/security checks.

## 8. Environments and delivery

Maintain three isolated environments:

- Local: Docker Compose for PostgreSQL and an S3-compatible local object store.
- Staging: production-like services, separate data, protected dashboard, and deployment previews.
- Production: managed PostgreSQL, managed object storage/CDN, email provider, monitoring, and automated backups.

Recommended hostnames:

```text
artexproduction.com           -> public website
admin.artexproduction.com     -> dashboard
api.artexproduction.com       -> API
```

CI/CD flow:

1. Validate changed workspaces on each pull request.
2. Build immutable artifacts for each application.
3. Deploy automatically to staging.
4. Run smoke tests and migration checks.
5. Require approval for the production deployment.
6. Run backward-compatible database migrations before switching application traffic.
7. Verify health checks, error rate, and a critical user journey after deployment.
8. Retain a documented application rollback and database forward-fix procedure.

## 9. Implementation phases

### Phase 0 — Product and content decisions

- Confirm domain ownership, hosting preference, email provider, storage provider, analytics choice, and legal contact details.
- Collect approved Arabic and English copy, real project media, client logos, project categories, and brand files.
- Define dashboard roles, lead workflow, content approval workflow, and retention rules.
- Record current SEO URLs so redirects can be prepared.

Exit condition: content inventory and deployment decisions are approved.

### Phase 1 — Monorepo foundation

- Create the workspace structure and root scripts.
- Scaffold the three Next.js applications with strict TypeScript.
- Add shared lint, formatting, environment validation, and import-boundary rules.
- Add Docker-based local dependencies and `.env.example` documentation.
- Establish CI for lint, typecheck, tests, and builds.

Exit condition: all three empty applications build in CI and run locally from one command.

### Phase 2 — Database, contracts, and API core

- Implement schema, migrations, seed data, repository ports, and database adapters.
- Establish the API response/error format, validation, logging, request IDs, and OpenAPI output.
- Implement health endpoints and test infrastructure.
- Seed the current hardcoded content in both languages.

Exit condition: versioned public read endpoints return seeded content and pass integration/contract tests.

### Phase 3 — Authentication and dashboard shell

- Implement secure sessions, account recovery, MFA, role-based authorization, and audit logging.
- Build the dashboard layout, navigation, access-denied states, and user-management foundation.
- Add rate limiting and authentication monitoring.

Exit condition: each role can access only its permitted dashboard routes and API operations.

### Phase 4 — Content and media management

- Implement projects, categories, services, values, clients, company profile, and settings.
- Add bilingual editors, draft/publish state, previews, ordering, and safe archival.
- Implement direct media upload, image processing, metadata, and reference checks.
- Trigger targeted public-site cache revalidation after publishing.

Exit condition: an editor can create and publish complete bilingual content without code changes.

### Phase 5 — Public website migration

- Port the current design and components into `apps/web`.
- Replace hardcoded translations and portfolio data with API-backed content.
- Implement localized routes, RTL/LTR handling, project/service pages, and image optimization.
- Replace static HTML metadata with the Next.js Metadata API, localized canonical URLs, `hreflang`, sitemap, robots, and structured data.
- Preserve or redirect existing public URLs.

Exit condition: the new site matches the approved design, reads published content, and meets accessibility and performance budgets.

### Phase 6 — Leads and notifications

- Replace the simulated contact form with validated API submission.
- Add spam protection, rate limiting, idempotency, privacy consent, and failure handling.
- Add dashboard lead workflow, notes, search, export, email notifications, and delivery monitoring.

Exit condition: a production-like form submission is stored once, shown in the dashboard, and sends a verified notification.

### Phase 7 — Production hardening and launch

- Complete security review, dependency scan, backup restore drill, load test, and accessibility audit.
- Verify SEO, analytics consent, error tracking, alerts, logs, uptime checks, and operational dashboards.
- Import final production content and perform stakeholder acceptance testing.
- Deploy, verify critical journeys, submit sitemaps, and monitor closely after launch.

Exit condition: the production checklist below passes and rollback procedures have been exercised.

## 10. Production acceptance checklist

- Public pages render correctly in Arabic and English on supported mobile and desktop browsers.
- Editors can manage every visible piece of portfolio content from the dashboard.
- Draft content is private; published content appears after controlled revalidation.
- Authentication, MFA, permissions, session revocation, and password recovery are verified.
- Contact submissions are validated, rate-limited, persisted, notified, and observable.
- Images are optimized, have approved alt text, and do not rely on placeholder URLs.
- Metadata, canonical URLs, alternate-language links, sitemap, robots, social cards, and structured data are correct.
- Error, empty, loading, offline/retry, 404, and 500 states are implemented.
- CI is green; production builds and database migrations have been tested on staging.
- Backups, restore procedures, alerts, ownership, and incident runbooks are documented.
- No secrets, test accounts, debug output, or unapproved personal data are present in source or production logs.

## 11. Decisions required before implementation

These choices should be recorded as short architecture decision records during Phase 0:

1. Managed hosting or self-hosted Docker.
2. Database provider and deployment region.
3. Object-storage and CDN provider.
4. Authentication provider or self-managed credentials.
5. Email provider and sender domain.
6. Analytics, consent, error tracking, and monitoring providers.
7. Whether content requires approval by a second role before publishing.
8. Lead retention period and the users allowed to export leads.

## 12. Recommended first implementation slice

Start with one vertical slice before building every dashboard screen:

1. Monorepo and CI foundation.
2. Database plus `Project` and `ProjectTranslation` entities.
3. Public project read endpoints.
4. Admin authentication and project CRUD with image upload.
5. One localized public project listing/detail flow.

This slice proves authentication, permissions, database access, API contracts, media handling, localization, cache revalidation, testing, and deployment. Once it works in staging, repeat the same patterns for services, clients, values, settings, and leads.
