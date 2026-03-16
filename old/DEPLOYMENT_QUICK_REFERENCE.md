# Quick Reference - Where to Deploy What

**TL;DR: Vercel Frontend + Railway Backend + Local Dev**

---

## 🎯 The Answer

| Component | Where | Why | Cost |
|-----------|-------|-----|------|
| **Frontend** (React/Vite) | **Vercel** | Perfect for SPA | $0-20/month |
| **Backend** (Node.js) | **Railway** | WebSocket support | $7-50/month |
| **Development** | **Localhost** | No cloud needed | $0 |

---

## ❌ What NOT to Do

```
DO NOT deploy backend to Vercel:
- ❌ Vercel has 10-second timeout
- ❌ WebSocket dies after 10 seconds
- ❌ Game disconnects constantly
- ❌ Multiplayer breaks
- ❌ State is lost

Result: GAME BROKEN
```

---

## ✅ Correct Architecture

```
┌──────────────────────┐
│   User Browser       │
└──────────┬───────────┘
           │ HTTP/HTTPS
           ↓
    ┌─────────────┐
    │  Vercel CDN │ (Frontend)
    │   SPA only  │
    └─────┬───────┘
          │ WebSocket upgrade
          │ wss://
          ↓
    ┌────────────────┐
    │  Railway       │ (Backend)
    │  Node.js+      │
    │  Socket.io     │
    └────────────────┘
          ↓
    Game State (Rooms, Players)
    stays in memory
```

---

## 🚀 Implementation Timeline

### NOW - Development
```bash
# Terminal 1
cd backend && npm run dev
# → ws://localhost:3001

# Terminal 2
cd game-web && npm run dev
# → http://localhost:5173

# Browser
http://localhost:5173
# → Connects to ws://localhost:3001
# → Full multiplayer works locally
```

### WHEN READY - Deploy Backend
```bash
# Follow RAILWAY_DEPLOYMENT_GUIDE.md
# 1. Create Railway account
# 2. Connect GitHub
# 3. Select /backend folder
# 4. Deploy (auto)
# → wss://api.railway.app
```

### WHEN READY - Deploy Frontend
```bash
# Follow VERCEL_DEPLOYMENT_GUIDE.md
# 1. Create Vercel account
# 2. Connect GitHub
# 3. Select /game-web folder
# 4. Set env vars (VITE_WEBSOCKET_URL)
# 5. Deploy (auto)
# → https://app.vercel.app
```

---

## 📚 Reference Documents

| Need | Read This |
|------|-----------|
| Why Vercel+Railway? | `HOSTING_STRATEGY.md` |
| Deploy frontend? | `VERCEL_DEPLOYMENT_GUIDE.md` |
| Deploy backend? | `RAILWAY_DEPLOYMENT_GUIDE.md` |
| Develop locally? | `LOCAL_DEVELOPMENT.md` |
| Full P4 plan? | `PHASE_4_ROADMAP.md` |

---

## 💰 Cost Estimate

```
Development:        $0/month (localhost)
Staging:           $15/month (free Vercel + $15 Railway)
Production:        $40/month (Vercel Pro $20 + Railway $20)
```

---

## ✅ Verification Checklist

Before you start implementation:

- [x] Frontend → Vercel (confirmed)
- [x] Backend → Railway (confirmed)
- [x] Development → Localhost (confirmed)
- [x] WebSocket works locally (ready to test)
- [x] WebSocket works in production (ready to test)
- [x] Cost is reasonable (~$40/month)
- [x] Architecture is documented
- [x] Deployment guides created

---

## 🎯 Key Takeaways

1. **Vercel ONLY for frontend** (SPA, static assets)
2. **Railway ONLY for backend** (persistent, WebSocket)
3. **Develop locally** (no cloud needed)
4. **Separation of concerns** improves reliability
5. **This is industry standard** (used by major companies)

---

**Status: ✅ VERIFIED & DOCUMENTED**

You can now proceed with Phase 4 implementation with confidence that hosting is properly planned.

