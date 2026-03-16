.PHONY: help install dev build start stop clean

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

# Build shared package first, then backend
build-all:
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
