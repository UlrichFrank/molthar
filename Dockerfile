# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy workspace definition and lockfile first (layer cache)
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package.json files for all workspace packages
COPY shared/package.json       ./shared/
COPY backend/package.json      ./backend/
COPY game-web/package.json     ./game-web/
COPY card-manager/package.json ./card-manager/

# Install all dependencies (incl. devDeps needed to build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY shared/  ./shared/
COPY backend/ ./backend/

# Build shared, then backend
RUN pnpm --filter @portale-von-molthar/shared run build
RUN pnpm --filter portale-von-molthar-backend run build

# Bundle a self-contained production deployment: real node_modules with the
# shared workspace package inlined and devDeps pruned. --legacy is required
# because the repo uses a shared workspace lockfile.
RUN pnpm --filter=portale-von-molthar-backend deploy --prod --legacy /prod

# ── Stage 2: Runtime ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Listen on all interfaces inside the container (default 127.0.0.1 is unreachable from outside)
ENV HOST=0.0.0.0

# Only the production artifacts — no source, no build tools, no devDeps
COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /prod/dist         ./dist
COPY --from=builder /prod/package.json ./package.json

# cards.json is loaded at runtime by shared/cardDatabaseLoader.js.
# WORKDIR is /app, so the loader's cwd-relative lookup finds it here.
COPY assets/cards.json ./assets/cards.json

EXPOSE 3001

CMD ["node", "dist/server-bgio.js"]
