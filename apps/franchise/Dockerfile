FROM node:22-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/franchise/package.json apps/franchise/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile --filter @stackbuild/franchise...

COPY packages/ui/src packages/ui/src
COPY apps/franchise apps/franchise

WORKDIR /app/apps/franchise
EXPOSE 5176
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]
