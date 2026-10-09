# Release status — 7 October 2026

The deployment target supports one Vercel project or one VPS container serving the website, dashboard, and API routes from the same origin. A production domain and live hosting access have not been established.

## Implemented

- Bilingual public portfolio with API-backed content, published project pages, galleries, metadata, sitemap, and contact submissions.
- Dashboard editing for bilingual site copy and settings, projects, image uploads, leads, and users.
- Database-backed sessions, scrypt credentials, role permissions, owner authenticator enrollment, replay protection, session revocation, and audited operator recovery.
- Draft privacy, optimistic writes, image normalization, authenticated image previews, and public access only to referenced published media.
- Shared database rate limits, bounded inquiry bodies, consent, and retry deduplication.
- Nonce-based browser Content Security Policy, production configuration and schema readiness checks, CI, migrations, and deployment runbooks.

## Verification

The full local `pnpm check` sequence passes: formatting, architecture boundaries, lint, strict TypeScript checks, 23 tests including real PostgreSQL integration, and the unified production build. Dependency auditing reports no known production vulnerabilities, and migration-history validation passes. A database backup was restored into a separate local database and record counts matched. These checks do not verify Linux containers, browser hydration under CSP, or a live HTTPS deployment.

## Remaining launch gates

1. Obtain an owned domain and hosting access; configure DNS, firewall, private secrets, and certificate contact details.
2. Build and run the Linux Docker stack in staging; verify routing, HTTPS, readiness, and full public/dashboard journeys in supported browsers.
3. Implement and verify outbound inquiry notifications, delivery monitoring, and self-service password recovery if required. Current recovery requires an authorized database operator.
4. Complete browser accessibility and performance checks, final content approval, and replacement of placeholder media.
5. Configure external uptime/error alerts, scheduled encrypted offsite database and media backups, retention, and a complete restore drill including authenticator keys.

The platform must not be described as fully production-ready until these gates pass. See [VPS.md](VPS.md) for deployment commands and [DEPLOYMENT.md](DEPLOYMENT.md) for recovery and security operations.
