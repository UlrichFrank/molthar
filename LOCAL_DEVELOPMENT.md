# 💻 LOCAL DEVELOPMENT SETUP - Without Vercel

**Guide for developing P4 locally without any cloud dependencies**

---

## Architecture

```
Your Computer
├── Frontend (Vite Dev Server)
│   └── http://localhost:5173
├── Backend (Node.js + Socket.io)
│   └── ws://localhost:3001
└── Game Engine (Shared)
```

---

## Prerequisites

- Node.js 18+ (download from https://nodejs.org)
- Git
- Terminal/Command line
- A code editor (VS Code recommended)

**Check installation:**

```bash
node --version        # Should be v18.0.0 or higher
npm --version         # Should be v9.0.0 or higher
git --version         # Should work
```

---

## Project Structure

```
portale-von-molthar/
├── backend/                    # Node.js server
│   ├── src/
│   │   ├── server.ts          # Express + Socket.io server
│   │   ├── types.ts           # Shared types
│   │   ├── game/              # Game engine integration
│   │   ├── rooms/             # Room management
│   │   ├── ai/                # AI strategies
│   │   └── utils/             # Utilities
│   ├── package.json
│   └── .env                   # Backend config
│
└── game-web/                   # React frontend
    ├── src/
    │   ├── lib/
    │   │   └── socket-client.ts  # Socket.io client
    │   ├── components/
    │   └── ...
    ├── package.json
    └── .env.local             # Frontend config
```

---

## Step 1: Clone & Setup

```bash
# Clone repository
git clone <repo-url>
cd portale-von-molthar

# Install frontend dependencies
cd game-web
npm install

# Install backend dependencies
cd ../backend
npm install

# Create environment files
cp .env.example .env
# (Defaults are localhost, should work as-is)

cd ..  # Back to root
```

---

## Step 2: Start Backend Server

**Terminal 1 - Backend:**

```bash
cd backend

# Run development server with hot-reload
npm run dev

# Expected output:
# ✨ [14:23:45] Using tsconfig.json
# 🚀 Server running on port 3001
# 📡 WebSocket server ready at ws://localhost:3001
```

**Verify backend is running:**

```bash
# In another terminal:
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"2024-03-15T14:23:45.123Z","stats":{...}}
```

---

## Step 3: Start Frontend Dev Server

**Terminal 2 - Frontend:**

```bash
cd game-web

# Run Vite development server
npm run dev

# Expected output:
# ✨ Vite Server running at: http://localhost:5173
# ➜ Local:   http://localhost:5173/
# ➜ press h for help
```

---

## Step 4: Open in Browser

```
http://localhost:5173
```

**Check browser console (F12) for:**
- No errors
- Socket.io connection: "[Socket] Connected: <id>"
- Frontend loads properly

---

## Development Workflow

### Making Changes

**Backend changes:**
```bash
# Edit src/server.ts or src/rooms/RoomManager.ts
# Frontend will auto-hot-reload
# (Backend has ts-node with hot-reload)
```

**Frontend changes:**
```bash
# Edit src/components/GameBoard.tsx
# Vite will hot-reload immediately in browser
```

### Testing Game Flow Locally

```bash
# 1. Open http://localhost:5173 in Browser Tab 1
# 2. Open http://localhost:5173 in Browser Tab 2 (or different browser)
# 3. Create room in Tab 1
# 4. Join room from Tab 2
# 5. Play a game with real-time sync
# 6. Check console for WebSocket events
```

---

## Environment Configuration

### Backend (.env)

```bash
# backend/.env
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
RECONNECT_GRACE_PERIOD=15000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)

```bash
# game-web/.env.local
VITE_BACKEND_URL=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_ENV=development
VITE_SENTRY_DSN=
```

---

## Debugging

### Backend Debugging

**VS Code Debug Configuration:**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "program": "${workspaceFolder}/backend/src/server.ts",
      "restart": true,
      "rtsRequest": "launch",
      "preLaunchTask": "build-backend",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

**Or use console.log:**

```bash
# Backend logs go to terminal
# Look for: [14:23:45] [INFO] Message

# Set log level:
LOG_LEVEL=debug npm run dev  # More verbose
LOG_LEVEL=warn npm run dev   # Less verbose
```

### Frontend Debugging

**In browser:**
- F12 opens DevTools
- Console tab shows React errors
- Network tab shows WebSocket events
- React DevTools extension helpful

**VS Code Debugger:**
```bash
# Install debugger for Chrome extension
# Run > JavaScript Debug Terminal
# npm run dev
# DevTools attaches automatically
```

---

## Common Issues

### Issue: "Cannot find module 'socket.io'"

**Solution:**
```bash
cd backend
npm install
```

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Find process using port
lsof -i :3001

# Kill process (macOS/Linux)
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### Issue: "WebSocket connection failed"

**Check:**
1. Backend is running: `npm run dev` in backend folder
2. Correct URL in frontend: `ws://localhost:3001`
3. Browser console for errors (F12)
4. Network tab shows WebSocket connection

**Solution:**
```bash
# Backend logs should show connection
[14:23:45] [INFO] Client connected: abc123

# If not, backend isn't listening
```

### Issue: "Types not found" or TypeScript errors

**Solution:**
```bash
# Rebuild TypeScript
backend$ npm run type-check
game-web$ npm run type-check

# Or just run again (ts-node will recompile)
```

---

## Testing Locally

### Unit Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd game-web
npm test
```

### Integration Tests (Manual)

**Scenario 1: Create and Join Room**
```
1. Open Browser A: http://localhost:5173
2. Click "Create Room" with name "Test"
3. Get room ID (e.g., "ABC12345")
4. Open Browser B: http://localhost:5173
5. Click "Join Room" and paste room ID
6. Both should see each other in player list
```

**Scenario 2: Play Full Game**
```
1. Both players in room, marked ready
2. Click "Start Game"
3. Current player performs action
4. Both see state update in real-time
5. Other player's turn
6. Continue until game finished
```

**Scenario 3: Test Disconnection**
```
1. Both players in game
2. Close Browser Tab 1
3. Backend logs should show "Client disconnected"
4. Backend waits 15 seconds for reconnection
5. Reopen http://localhost:5173 in new tab
6. Should be able to rejoin same game
```

---

## Performance Monitoring

### View Backend Stats

```bash
# In terminal
curl http://localhost:3001/api/stats

# Returns:
{
  "totalRooms": 2,
  "waitingRooms": 1,
  "playingRooms": 1,
  "totalPlayers": 4
}
```

### View Network Traffic

**Browser DevTools → Network → WS**
```
ws://localhost:3001/socket.io/?...
- Frames tab shows messages sent/received
- Look for game:action events
```

### View Logs

```bash
# Backend terminal shows all activity
# Each log line has timestamp and level:
# [14:23:45] [INFO] Message
# [14:23:46] [DEBUG] Detailed info
# [14:23:47] [WARN] Warning
# [14:23:48] [ERROR] Error
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/multiplayer

# Make changes
# ...

# Test locally
npm run dev   # Terminal 1: backend
npm run dev   # Terminal 2: frontend

# Commit
git add .
git commit -m "feat: Add multiplayer room system"

# Push
git push origin feature/multiplayer

# Create Pull Request on GitHub
```

---

## Troubleshooting Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed: `npm install` in both folders
- [ ] Backend running: `npm run dev` in backend folder
- [ ] Frontend running: `npm run dev` in game-web folder
- [ ] Backend on localhost:3001
- [ ] Frontend on localhost:5173
- [ ] WebSocket connected in browser console
- [ ] No CORS errors (should be none locally)
- [ ] Game actions work in browser
- [ ] Check backend terminal for logs

---

## Next Steps

Once local development is working:

1. **Deploy Backend to Railway** (see Railway setup guide)
2. **Deploy Frontend to Vercel** (see Vercel setup guide)
3. **Update environment variables** for production URLs
4. **Test end-to-end** with production servers

---

## Quick Commands Reference

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd game-web && npm run dev

# Terminal 3 - Testing (optional)
cd backend && npm test
cd game-web && npm test

# Build for production
cd backend && npm run build
cd game-web && npm run build

# Check everything
cd backend && npm run type-check
cd game-web && npm run type-check
```

---

**Stuck?** Check:
1. Browser console (F12)
2. Backend terminal logs
3. `curl http://localhost:3001/health`
4. Verify ports (lsof on macOS/Linux, netstat on Windows)

**Happy coding!** 🚀
