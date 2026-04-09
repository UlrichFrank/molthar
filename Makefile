.PHONY: help install dev build start stop clean test test-report \
        docker-build docker-build-backend docker-build-frontend docker-run docker-stop docker-logs

DOCKER_TAG     ?= latest
BACKEND_IMAGE  ?= portale-backend
FRONTEND_IMAGE ?= portale-frontend
# Ports (override if defaults are occupied: BACKEND_PORT=3002 make docker-run)
BACKEND_PORT   ?= 3001
FRONTEND_PORT  ?= 80
# URL the browser uses to reach the backend (baked into the frontend bundle)
SERVER_URL     ?= http://localhost:$(BACKEND_PORT)
# GitHub Container Registry
REGISTRY       ?= ghcr.io/ulrichfrank
REGISTRY_BACKEND  ?= $(REGISTRY)/molthar-backend
REGISTRY_FRONTEND ?= $(REGISTRY)/molthar-frontend
# Set PLATFORMS=linux/amd64,linux/arm64 to build multi-platform images locally
PLATFORMS      ?=

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
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-build              Build backend + frontend images"
	@echo "  make docker-build-backend      Build backend image only"
	@echo "  make docker-build-frontend     Build frontend image only"
	@echo "  make docker-run                Start containers via docker compose"
	@echo "  make docker-stop               Stop containers"
	@echo "  make docker-logs               Follow container logs"
	@echo "  make docker-push               Tag + push images to ghcr.io (needs docker login)"
	@echo "  make docker-run-prod           Run production images from ghcr.io"
	@echo ""
	@echo "$(GREEN)Testing:$(NC)"
	@echo "  make test           Run all tests (shared + game-web)"
	@echo "  make test-shared    Run tests for shared package"
	@echo "  make test-watch    Run tests in watch mode (shared)"
	@echo "  make test-report    Generate test report for card validation"
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

# Generate detailed test report for card cost validation
test-report:
	@echo "$(BLUE)Generating test report...$(NC)"
	@cd shared && npm run build >/dev/null 2>&1 || echo "Building shared package first..."
	@cd shared && node scripts/generate-test-report.js
	@echo "$(GREEN)✓ Report saved to shared/test-report.html$(NC)"

# ── Docker ────────────────────────────────────────────────────────────────────

# Build backend Docker image
# For multi-platform: PLATFORMS=linux/amd64,linux/arm64 make docker-build-backend
docker-build-backend:
	@echo "$(BLUE)Building backend image ($(BACKEND_IMAGE):$(DOCKER_TAG))...$(NC)"
	$(if $(PLATFORMS), \
		docker buildx build --platform $(PLATFORMS) -t $(BACKEND_IMAGE):$(DOCKER_TAG) -f Dockerfile --load ., \
		docker build -t $(BACKEND_IMAGE):$(DOCKER_TAG) -f Dockerfile . \
	)
	@echo "$(GREEN)✓ Backend image built$(NC)"

# Build frontend Docker image
# For multi-platform: PLATFORMS=linux/amd64,linux/arm64 make docker-build-frontend
docker-build-frontend:
	@echo "$(BLUE)Building frontend image ($(FRONTEND_IMAGE):$(DOCKER_TAG))...$(NC)"
	$(if $(PLATFORMS), \
		docker buildx build --platform $(PLATFORMS) -t $(FRONTEND_IMAGE):$(DOCKER_TAG) -f Dockerfile.frontend --load ., \
		docker build -t $(FRONTEND_IMAGE):$(DOCKER_TAG) -f Dockerfile.frontend . \
	)
	@echo "$(GREEN)✓ Frontend image built$(NC)"

# Build both images
docker-build: docker-build-backend docker-build-frontend

# Start containers via docker compose
docker-run:
	@echo "$(BLUE)Starting containers...$(NC)"
	@echo "$(GREEN)Backend:  http://localhost:$(BACKEND_PORT)$(NC)"
	@echo "$(GREEN)Frontend: http://localhost:$(FRONTEND_PORT)$(NC)"
	BACKEND_PORT=$(BACKEND_PORT) FRONTEND_PORT=$(FRONTEND_PORT) SERVER_URL=$(SERVER_URL) docker compose up -d
	@echo "$(GREEN)✓ Containers started (make docker-logs to follow logs)$(NC)"

# Stop and remove containers
docker-stop:
	@echo "$(BLUE)Stopping containers...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Containers stopped$(NC)"

# Follow logs from all containers
docker-logs:
	docker compose logs -f

# Tag local images and push to GitHub Container Registry
# Requires: docker login ghcr.io -u <github-username> --password <PAT>
docker-push: docker-build
	@echo "$(BLUE)Pushing images to $(REGISTRY)...$(NC)"
	docker tag $(BACKEND_IMAGE):$(DOCKER_TAG)  $(REGISTRY_BACKEND):$(DOCKER_TAG)
	docker tag $(FRONTEND_IMAGE):$(DOCKER_TAG) $(REGISTRY_FRONTEND):$(DOCKER_TAG)
	docker push $(REGISTRY_BACKEND):$(DOCKER_TAG)
	docker push $(REGISTRY_FRONTEND):$(DOCKER_TAG)
	@echo "$(GREEN)✓ Images pushed to ghcr.io$(NC)"

# Run production images from ghcr.io (for Synology / server deployment)
docker-run-prod:
	@echo "$(BLUE)Starting production containers from ghcr.io...$(NC)"
	EXTRA_ORIGINS=$(EXTRA_ORIGINS) docker compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Containers started$(NC)"
