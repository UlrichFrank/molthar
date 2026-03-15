#!/bin/bash

# Portale von Molthar - Local Development Setup

echo "🎮 Portale von Molthar - Local Development"
echo "==========================================="
echo ""
echo "Starting servers..."
echo ""

# Start backend on port 8000
echo "📍 Starting backend server on http://localhost:8000"
cd /Users/ulrich.frank/Dev/private/molthar/backend
pnpm dev &
BACKEND_PID=$!

sleep 2

# Start frontend on port 5173  
echo "📍 Starting frontend on http://localhost:5173"
cd /Users/ulrich.frank/Dev/private/molthar/game-web
pnpm dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo ""
echo "🔗 Frontend: http://localhost:5173"
echo "🎮 Backend:  http://localhost:8000"
echo "🏥 Health:   http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait
