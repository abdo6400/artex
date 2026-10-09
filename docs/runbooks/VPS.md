# VPS deployment

Deployment uses one owned hostname for the website, dashboard, and API routes. `artexproduction.com` is an example only; domain registration, ownership, and DNS availability have not been verified. Use a domain owned by Artex before launching.

Point the website DNS record to the VPS. Open TCP 80 and 443 and UDP 443; restrict SSH to trusted addresses. Install Docker Engine and the Compose plugin. The provided stack exposes only Caddy; application listeners and PostgreSQL have no host port bindings.

Copy `infrastructure/docker/.env.example` to a private `.env` file, replace the example hostnames, and generate independent random secrets. Keep it outside version control with permissions restricted to the deployment account. Use a hexadecimal database password, for example from `openssl rand -hex 32`.

From the repository root:

```sh
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.vps.yml build
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.vps.yml up -d postgres
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.vps.yml run --rm operations pnpm db:migrate
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.vps.yml run --rm operations pnpm db:seed-site
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.vps.yml run --rm operations pnpm db:seed-owner
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.vps.yml up -d platform caddy
```

Remove `OWNER_PASSWORD` after bootstrapping. Verify `/api/v1/ready`, sign in at `/dashboard/login`, publish a test draft in both languages, and submit a test inquiry. Caddy obtains certificates after DNS and firewall configuration are correct. Inspect `docker compose logs --tail=100` if any service fails to start.

The application containers run as the unprivileged Node user. Persist both database and certificate volumes. Never run `docker compose down -v` on production: it deletes those volumes.

## Backups

Use a restricted directory on the host and capture a custom-format backup:

```sh
umask 077
docker compose --env-file infrastructure/docker/.env -f infrastructure/docker/compose.vps.yml exec -T postgres pg_dump -U artex -d artex -Fc > /secure/backup/path/artex.dump
```

Schedule this command with the host's scheduler, encrypt and transfer backups offsite, enforce retention, and alert when the job fails. Include the `media-data` volume and securely retained MFA encryption key in the recovery plan. A backup file alone does not verify recovery. Restore it into a separate database using `pg_restore`, restore the corresponding media snapshot, compare record counts, and run critical journeys before recording the drill as successful.

## Launch gates

Docker images, Caddy routing, HTTPS issuance, DNS, backup restoration, and real notification delivery must be tested on staging. The local Windows environment has validated PostgreSQL directly but has no Docker daemon. Do not label this stack production-verified until staging checks pass.
