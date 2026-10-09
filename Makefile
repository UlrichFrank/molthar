.PHONY: help install dev build start stop clean test test-report test-e2e \
        binary binary-local binary-frontend smoke \
        deploy deploy-upload deploy-check deploy-rollback deploy-logs deploy-status deploy-restart deploy-init

# ── vServer Deployment ────────────────────────────────────────────────────────
# SSH alias (see ~/.ssh/config). Molthar runs as systemd service "molthar"
# (single binary) behind Traefik (systemd, config in TRAEFIK_DIR).
DEPLOY_HOST    ?= vServer
DEPLOY_DIR     ?= /opt/molthar
TRAEFIK_DIR    ?= /etc/traefik
# Base domain for app subdomains
APPS_DOMAIN    ?= apps.diefranks.eu
APP_URL        ?= https://molthar.$(APPS_DOMAIN)
# Loopback: only Traefik on the same host reaches the service (see molthar.service)
BIND_IP        ?= 127.0.0.1
SERVICE_PORT   ?= 3002
# Short git SHA — shown after a deploy
GIT_SHA        := $(shell git rev-parse --short HEAD)

BINARY_FLAGS   := --compile

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)Portale von Molthar - Development Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Installation:$(NC)"
	@echo "  make install        Install all dependencies (pnpm)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev            Start backend & frontend (parallel)"
	@echo "  make backend        Start backend only (localhost:3001)"
	@echo "  make frontend       Start frontend only (localhost:5173)"
	@echo ""
	@echo "$(GREEN)Building:$(NC)"
	@echo "  make build          Build backend only"
	@echo "  make build-all      Build backend and shared packages"
	@echo ""
	@echo "$(GREEN)Single Binary:$(NC)"
	@echo "  make binary-local             Build dist/molthar for this machine (Bun)"
	@echo "  make binary                   Build dist/molthar-linux-x64 for the vServer"
	@echo "  make smoke URL=<url>          Lobby/NPC games against a running server"
	@echo ""
	@echo "$(GREEN)Deployment (vServer, systemd behind Traefik):$(NC)"
	@echo "  make deploy                    Build binary → upload → restart → health check"
	@echo "  make deploy-rollback           Switch back to the previous binary"
	@echo "  make deploy-logs               Follow the service log (journald)"
	@echo "  make deploy-status             Service status and binary checksums"
	@echo "  make deploy-restart            Restart the service"
	@echo "  make deploy-init               Check vServer prerequisites"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test           Run all tests (shared + game-web)"
	@echo "  make test-shared    Run tests for shared package"
	@echo "  make test-watch    Run tests in watch mode (shared)"
	@echo "  make test-report    Generate test report for card validation"
	@echo "  make test-e2e       Play real lobby/NPC games against a running backend"
	@echo ""
	@echo "$(GREEN)Cleanup:$(NC)"
	@echo "  make stop           Stop all running services"
	@echo "  make clean          Remove node_modules and build artifacts"
	@echo "  make clean-all      Remove all dependencies and builds"

# Install dependencies using pnpm
install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	pnpm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

# Build backend (requires shared to be built first)
build:
	@echo "$(BLUE)Building backend...$(NC)"
	@echo "$(BLUE)Note: Make sure shared package is built first!$(NC)"
	cd backend && pnpm run build
	@echo "$(GREEN)✓ Backend built$(NC)"

# Build shared package first, then backend (with clean builds)
build-all: clean
	@echo "$(BLUE)Building shared package...$(NC)"
	cd shared && pnpm run build
	@echo "$(GREEN)✓ Shared package built$(NC)"
	@echo "$(BLUE)Building backend...$(NC)"
	cd backend && pnpm run build
	@echo "$(GREEN)✓ Backend built$(NC)"
	@echo "$(GREEN)✓ All packages built$(NC)"

# Start backend only
backend: build
	@echo "$(BLUE)Starting backend on localhost:3001...$(NC)"
	cd backend && node dist/server-bgio.js

# Start frontend only
frontend:
	@echo "$(BLUE)Starting frontend on localhost:5173...$(NC)"
	cd game-web && pnpm run dev

# Start both backend and frontend (parallel)
dev: build-all
	@echo "$(BLUE)Starting backend and frontend...$(NC)"
	@echo "$(GREEN)Backend:  localhost:3001$(NC)"
	@echo "$(GREEN)Frontend: localhost:5173$(NC)"
	@echo ""
	@echo "Press Ctrl+C to stop all services"
	@echo ""
	@(cd backend && node dist/server-bgio.js) & \
	BACKEND_PID=$$!; \
	(cd game-web && pnpm run dev) & \
	FRONTEND_PID=$$!; \
	trap "kill $$BACKEND_PID $$FRONTEND_PID 2>/dev/null; echo '$(GREEN)✓ Services stopped$(NC)'; exit 0" INT; \
	wait

# Stop any running services
stop:
	@echo "$(BLUE)Stopping services...$(NC)"
	@lsof -i :3001 2>/dev/null | grep node | awk '{print $$2}' | xargs kill -9 2>/dev/null || true
	@lsof -i :5173 2>/dev/null | grep node | awk '{print $$2}' | xargs kill -9 2>/dev/null || true
	@lsof -i :5174 2>/dev/null | grep node | awk '{print $$2}' | xargs kill -9 2>/dev/null || true
	@echo "$(GREEN)✓ Services stopped$(NC)"

# Clean build artifacts
clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf backend/dist
	rm -rf game-web/dist
	rm -rf shared/dist
	@echo "$(GREEN)✓ Build artifacts removed$(NC)"

# Clean everything
clean-all: clean stop
	@echo "$(BLUE)Removing node_modules...$(NC)"
	rm -rf node_modules
	rm -rf backend/node_modules
	rm -rf game-web/node_modules
	rm -rf shared/node_modules
	rm -rf pnpm-lock.yaml
	@echo "$(GREEN)✓ All dependencies removed$(NC)"

# Quick status check
status:
	@echo "$(BLUE)Checking service status...$(NC)"
	@echo -n "Backend (3001): "; nc -z localhost 3001 >/dev/null 2>&1 && echo "$(GREEN)✓ Running$(NC)" || echo "$(RED)✗ Stopped$(NC)"
	@echo -n "Frontend (5173): "; nc -z localhost 5173 >/dev/null 2>&1 && echo "$(GREEN)✓ Running$(NC)" || echo "$(RED)✗ Stopped$(NC)"

# Run all tests (shared package)
test:
	@echo "$(BLUE)Running all tests...$(NC)"
	cd shared && pnpm test -- --run
	@echo "$(GREEN)✓ All tests completed$(NC)"

# Run tests for shared package only
test-shared:
	@echo "$(BLUE)Running tests for shared package...$(NC)"
	cd shared && pnpm test -- --run
	@echo "$(GREEN)✓ Tests completed$(NC)"

# Run tests in watch mode (useful for development)
test-watch:
	@echo "$(BLUE)Running tests in watch mode (shared)...$(NC)"
	@echo "$(GREEN)Press Ctrl+C to exit watch mode$(NC)"
	cd shared && pnpm test

# End-to-end reliability loop: lobby → waiting room → full game incl. NPCs.
# Needs a running backend (make backend). RUNS=n repeats every scenario n times.
test-e2e:
	@echo "$(BLUE)Running lobby/NPC end-to-end scenarios...$(NC)"
	@curl -sf http://127.0.0.1:3001/games >/dev/null \
		|| { echo "$(RED)✗ Backend not reachable on :3001 — run 'make backend' first$(NC)"; exit 1; }
	cd backend && RUNS=$${RUNS:-3} node e2e/lobby-e2e.cjs

# Generate detailed test report for card cost validation
test-report:
	@echo "$(BLUE)Generating test report...$(NC)"
	@cd shared && npm run build >/dev/null 2>&1 || echo "Building shared package first..."
	@cd shared && node scripts/generate-test-report.js
	@echo "$(GREEN)✓ Report saved to shared/test-report.html$(NC)"

# ── Single Binary ─────────────────────────────────────────────────────────────
# Server, NPCs, card data and game page in one executable (bun build --compile).
# The frontend is built without VITE_SERVER_URL, so it talks to its own origin.

binary-frontend:
	@echo "$(BLUE)Building shared, frontend and asset manifest...$(NC)"
	cd shared && pnpm run build
	cd game-web && env -u VITE_SERVER_URL pnpm run build
	cd backend && bun scripts/gen-assets.ts

# For the machine you are on (local tests)
binary-local: binary-frontend
	cd backend && bun build src/main-binary.ts $(BINARY_FLAGS) --outfile ../dist/molthar
	@echo "$(GREEN)✓ dist/molthar$(NC)"

# For the vServer (Linux x86-64), cross-compiled
binary: binary-frontend
	cd backend && bun build src/main-binary.ts $(BINARY_FLAGS) --target=bun-linux-x64 --outfile ../dist/molthar-linux-x64
	@echo "$(GREEN)✓ dist/molthar-linux-x64$(NC)"

# Real lobby clients and NPC games against a running server, e.g.
#   make smoke URL=http://127.0.0.1:3002
#   make smoke URL=https://molthar.$(APPS_DOMAIN)
# The corruption scenario needs the server's data directory: local only (make test-e2e).
smoke:
	@test -n "$(URL)" || { echo "$(RED)Usage: make smoke URL=http://127.0.0.1:3002$(NC)"; exit 1; }
	cd backend && pnpm run build >/dev/null
	cd backend && SERVER=$(URL) ONLY=$${ONLY:-handy,npc,mixed} RUNS=$${RUNS:-1} node e2e/lobby-e2e.cjs

# ── Deployment to vServer ─────────────────────────────────────────────────────
# One-time server setup: see deploy/README.md. Each deploy uploads binary,
# systemd unit and Traefik route, keeps the running binary as .prev and
# restarts the service. Matches and NPC credentials in /var/lib/molthar stay.

deploy: binary deploy-upload
	@echo "$(GREEN)✓ Deploy complete ($(GIT_SHA))$(NC)"

deploy-upload:
	@ssh $(DEPLOY_HOST) 'systemctl is-active --quiet traefik' \
		|| { echo "$(RED)Traefik is not running on $(DEPLOY_HOST) — make server-setup in the spielothek repo$(NC)"; exit 1; }
	@echo "$(BLUE)Uploading binary, unit and route...$(NC)"
	scp -q dist/molthar-linux-x64 $(DEPLOY_HOST):$(DEPLOY_DIR)/molthar.new
	scp -q deploy/molthar/molthar.service $(DEPLOY_HOST):/etc/systemd/system/molthar.service
	scp -q deploy/molthar/traefik-molthar.yml $(DEPLOY_HOST):$(TRAEFIK_DIR)/dynamic/molthar.yml
	@# Keep the running binary as .prev for deploy-rollback
	ssh $(DEPLOY_HOST) 'set -e; cd $(DEPLOY_DIR); chmod 755 molthar.new; \
		if [ -f molthar ]; then mv -f molthar molthar.prev; fi; mv molthar.new molthar; \
		systemctl daemon-reload; systemctl enable --quiet molthar; systemctl restart molthar'
	@$(MAKE) --no-print-directory deploy-check

deploy-check:
	@ssh $(DEPLOY_HOST) 'for i in $$(seq 1 30); do curl -sf -o /dev/null http://$(BIND_IP):$(SERVICE_PORT)/games && exit 0; sleep 0.5; done; exit 1' \
		|| { echo "$(RED)Service does not answer — see make deploy-logs$(NC)"; exit 1; }
	@curl -sf -o /dev/null $(APP_URL)/ || { echo "$(RED)$(APP_URL) does not answer via Traefik$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Service answers (local and via Traefik)$(NC)"

deploy-rollback:
	ssh $(DEPLOY_HOST) 'set -e; cd $(DEPLOY_DIR); test -f molthar.prev || { echo "no previous binary"; exit 1; }; \
		mv molthar molthar.tmp; mv molthar.prev molthar; mv molthar.tmp molthar.prev; \
		systemctl restart molthar'
	@$(MAKE) --no-print-directory deploy-check

deploy-logs:
	ssh -t $(DEPLOY_HOST) 'journalctl -u molthar -f -n 100'

deploy-status:
	ssh $(DEPLOY_HOST) 'systemctl status molthar --no-pager | head -12; sha256sum $(DEPLOY_DIR)/molthar*; systemctl is-active traefik'

deploy-restart:
	ssh $(DEPLOY_HOST) 'systemctl restart molthar'
	@$(MAKE) --no-print-directory deploy-check

deploy-init:
	@echo "$(BLUE)Checking vServer prerequisites on $(DEPLOY_HOST)...$(NC)"
	@ssh -o ConnectTimeout=5 $(DEPLOY_HOST) 'systemctl is-active --quiet traefik' && echo "$(GREEN)✓ Traefik running$(NC)" || { echo "$(RED)✗ Traefik not running — make server-setup in the spielothek repo$(NC)"; exit 1; }
	@ssh $(DEPLOY_HOST) 'test -d $(TRAEFIK_DIR)/dynamic' && echo "$(GREEN)✓ $(TRAEFIK_DIR)/dynamic exists$(NC)" || echo "$(RED)✗ $(TRAEFIK_DIR)/dynamic missing — make server-setup in the spielothek repo$(NC)"
	@ssh $(DEPLOY_HOST) 'id molthar' >/dev/null 2>&1 && echo "$(GREEN)✓ System user molthar$(NC)" || echo "$(RED)✗ useradd --system --no-create-home --shell /usr/sbin/nologin molthar$(NC)"
	@ssh $(DEPLOY_HOST) 'test -d $(DEPLOY_DIR)' && echo "$(GREEN)✓ $(DEPLOY_DIR) exists$(NC)" || echo "$(RED)✗ mkdir -p $(DEPLOY_DIR)$(NC)"
	@echo "$(BLUE)See deploy/README.md for full setup steps.$(NC)"
