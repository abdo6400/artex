# Deploying Artex

## Prerequisites

Use PostgreSQL 18 with TLS, automated backups, and a separate staging database. Configure HTTPS at the ingress for the single platform application. Never expose PostgreSQL directly to the internet.

Set `DATABASE_URL`, a random `RATE_LIMIT_SALT` of at least 32 characters, `API_INTERNAL_URL`, `WEB_ORIGIN`, `DASHBOARD_ORIGIN`, and `NEXT_PUBLIC_SITE_URL` for each environment. The ingress must replace client-supplied forwarding headers with the real client address. Otherwise the shared IP quota can be bypassed.

## First deployment

1. Run `pnpm install --frozen-lockfile` and `pnpm check`.
2. Run `pnpm db:check` and `pnpm db:migrate` against the staging database first.
3. Set `OWNER_EMAIL`, `OWNER_NAME`, and `OWNER_PASSWORD` temporarily, then run `pnpm db:seed-owner`. This creates an account without overwriting an existing one. Remove the bootstrap password from the deployment environment afterward.
4. Run `pnpm db:seed-site` to import initial bilingual copy. It never overwrites saved content.
5. Build the immutable platform container using `infrastructure/docker/Dockerfile`. The production Compose file runs this application against an external database.
6. Apply migrations before switching application traffic. Start the platform and verify `/api/v1/ready`, `/dashboard/login`, `/en`, and `/ar`.
7. Verify login, role denial, account disabling, publishing in both languages, and lead submission in staging. Repeat a small smoke test after production rollout.

The liveness endpoint `/api/v1/health` checks the process. The readiness endpoint `/api/v1/ready` checks PostgreSQL; do not use liveness as evidence that database writes work.

## Rollback

Retain the previous application image and roll back application traffic if health or error rate deteriorates. Database migrations should be additive; use a forward fix for schema defects. Restore a database only after identifying the affected period and potential loss of newer writes.

## Backup and restore drill

Schedule provider snapshots and encrypted offsite backups. Restore into an isolated database, run migrations and smoke tests, verify record counts and representative media references, and record recovery time and the newest recovered transaction. Perform this drill before launch and periodically afterward.

## Security operations

Disable an account to revoke all its sessions. Password and role changes also revoke sessions. Retain audit records according to the agreed retention policy. Remove expired sessions and old rate-limit windows periodically; keep audit cleanup separate from application credentials. Do not log passwords, bearer tokens, contact messages, or connection strings.

## Release status

Container configuration requires a Docker-capable host for verification. Self-service password recovery, outbound email delivery, and provider monitoring still require implementation or integration before the full production acceptance checklist can be signed off.

Managed images live in the platform's persistent media volume. Back up this volume alongside PostgreSQL and preserve the media encryption-independent identifiers on restore. The filesystem adapter targets a single VPS; before scaling application instances across multiple hosts, replace it with a shared object-storage adapter. Incoming images are decoded, stripped of metadata, resized to fit 2400 pixels, and re-encoded as WebP. SVG, animated images, and undecodable files are rejected.

## Authenticator security and recovery

Set `MFA_ENCRYPTION_KEY` to an independent random 32-byte hexadecimal key (`openssl rand -hex 32`). Keep it in the secret manager and back it up securely; losing it prevents verification of existing authenticators. Production owner accounts must complete authenticator enrollment before admin API access. The encryption key is never sent to the browser. Each successful authenticator time step can be used only once.

If an authorized administrator loses their authenticator, an operator with database access can set `RECOVERY_EMAIL` and `RECOVERY_PASSWORD`, then run `pnpm db:recover-account`. It changes the password, resets MFA, revokes all sessions, and adds an audit record. Verify the account holder's identity through the established support process first. Remove recovery secrets from the environment immediately afterward. On the VPS, run this through the `operations` service; the owner must enroll MFA again on their next login.
