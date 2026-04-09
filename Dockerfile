# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace definition and lockfile first (layer cache)
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package.json files for all workspace packages
COPY shared/package.json       ./shared/
COPY backend/package.json      ./backend/
COPY game-web/package.json     ./game-web/
COPY card-manager/package.json ./card-manager/

# Install all dependencies (needed to resolve workspace links)
RUN pnpm install --frozen-lockfile

# Copy source
COPY shared/   ./shared/
COPY backend/  ./backend/

# Build shared, then backend
RUN pnpm --filter @portale-von-molthar/shared run build
RUN pnpm --filter portale-von-molthar-backend run build

# ── Stage 2: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY shared/package.json       ./shared/
COPY backend/package.json      ./backend/
COPY game-web/package.json     ./game-web/
COPY card-manager/package.json ./card-manager/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder stage
COPY --from=builder /app/shared/dist  ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "backend/dist/server-bgio.js"]
