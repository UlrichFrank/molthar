# Single-stage build — avoids pnpm symlink issues when copying node_modules
# between stages. The image is larger (includes devDeps/build tools) but
# node module resolution works correctly at runtime.
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace definition and lockfile first (layer cache)
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package.json files for all workspace packages
COPY shared/package.json       ./shared/
COPY backend/package.json      ./backend/
COPY game-web/package.json     ./game-web/
COPY card-manager/package.json ./card-manager/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY shared/  ./shared/
COPY backend/ ./backend/

# Build shared, then backend
RUN pnpm --filter @portale-von-molthar/shared run build
RUN pnpm --filter portale-von-molthar-backend run build

EXPOSE 3001

ENV NODE_ENV=production
# Listen on all interfaces inside the container (default 127.0.0.1 is unreachable from outside)
ENV HOST=0.0.0.0

CMD ["node", "backend/dist/server-bgio.js"]
