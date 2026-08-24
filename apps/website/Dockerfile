FROM node:22-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/website/package.json apps/website/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile --filter @stackbuild/website...

COPY packages/ui/src packages/ui/src
COPY apps/website apps/website

WORKDIR /app/apps/website
EXPOSE 5175
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]
