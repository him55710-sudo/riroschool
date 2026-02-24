# Dockerfile for Node Worker

FROM mcr.microsoft.com/playwright:v1.42.0-jammy AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root configurations and workspaces
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/

# Install dependencies (only required for worker and shared)
RUN pnpm install --filter worker...

# Copy source maps
COPY packages/shared/ ./packages/shared/
COPY apps/worker/ ./apps/worker/

# Generate prisma client for shared
RUN cd packages/shared && npx prisma generate

# Build shared package
RUN cd packages/shared && pnpm typecheck

# Build worker
RUN cd apps/worker && pnpm build

# Start worker
WORKDIR /app/apps/worker
CMD ["pnpm", "start"]
