FROM node:24-bookworm-slim AS builder
WORKDIR /workspace
RUN corepack enable
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @artex/web build
RUN mkdir -p apps/web/public

FROM node:24-bookworm-slim AS runtime
WORKDIR /workspace
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /workspace/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /workspace/apps/web/public ./apps/web/public
RUN mkdir -p /var/lib/artex/media && chown node:node /var/lib/artex/media
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
