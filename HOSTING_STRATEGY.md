# 🏠 Hosting Strategy - Frontend vs Backend

**Clear explanation of why we use different platforms for frontend and backend**

---

## The Problem with "Deploy Everything to Vercel"

### Vercel is Designed for Static/SPA Apps, NOT Real-time Games

| Aspect | Vercel | What We Need |
|--------|--------|------------|
| **Runtime** | Serverless Functions | Persistent Server |
| **Max Timeout** | 10 seconds | Always connected |
| **Connections** | HTTP/HTTPS stateless | WebSocket persistent |
| **Use Case** | Next.js apps, static sites | Real-time multiplayer |
| **Cost** | Low (compute on-demand) | Predictable (container always running) |
| **Scalability** | Horizontal (functions spin up/down) | Vertical (more memory/CPU) |

---

## Solution: Hybrid Hosting

```
┌─────────────────────────────────────────────┐
│         Portale von Molthar                │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (React SPA)        Backend (Node) │
│  ┌─────────────────┐      ┌──────────────┐ │
│  │ Vercel CDN      │      │ Railway      │ │
│  │ 100% Ideal      │      │ 100% Ideal   │ │
│  │                 │      │              │ │
│  │ ✓ Fast builds   │      │ ✓ WebSocket  │ │
│  │ ✓ CDN global    │      │ ✓ Persistent │ │
│  │ ✓ Auto scaling  │      │ ✓ Stateful   │ │
│  │ ✓ Free tier ok  │      │ ✓ $10+/month │ │
│  └─────────────────┘      └──────────────┘ │
│         ↓ HTTPS                ↓ WSS        │
│    https://...           wss://api...      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Detailed Comparison

### Frontend: React SPA on Vercel

**Perfect because:**
- ✅ Static assets (HTML, CSS, JS, images)
- ✅ No server computation needed
- ✅ Vercel CDN caches globally
- ✅ Zero-config deployment
- ✅ Preview deployments for PRs
- ✅ Auto-scaling handles traffic spikes
- ✅ Free tier: 100GB bandwidth/month
- ✅ Fast builds (< 1 minute)

**Vercel Features for Frontend:**
```
Deployment:
→ Push to GitHub
→ Vercel auto-detects Vite
→ Runs: npm run build
→ Uploads dist/ to CDN
→ Done in 1-2 minutes

Performance:
→ Global CDN (60+ edge locations)
→ Static asset caching (1 year)
→ Gzip/Brotli compression
→ Image optimization
```

**Example Vercel Flow:**
```bash
# You push code
git push origin main

# Vercel sees change (GitHub webhook)
# → Runs: npm install
# → Runs: npm run build
# → Creates dist/ folder
# → Uploads to CDN
# → HTTPS/HTTP2 enabled
# → Your app is live in 2 minutes
```

---

### Backend: Node.js Server on Railway

**Perfect because:**
- ✅ Always-on container
- ✅ WebSocket support (TCP level)
- ✅ Persistent server state (game rooms)
- ✅ Easy Socket.io integration
- ✅ Environment variables
- ✅ Logs & monitoring
- ✅ Simple deployment
- ✅ ~$10-20/month (predictable)

**Railway Features:**
```
Deployment:
→ Push to GitHub
→ Railway sees Dockerfile or package.json
→ Builds and starts container
→ Service runs continuously
→ Logs available in dashboard

Real-time:
→ WebSocket upgrade on HTTPS
→ WSS connection (WebSocket Secure)
→ Rooms stored in memory (or Redis)
→ Game state synced instantly
```

**Example Railway Flow:**
```bash
# You push code to /backend
git push origin main

# Railway sees change
# → Reads Dockerfile or package.json
# → npm install && npm start
# → Container starts on port 3001
# → Listens for WebSocket connections
# → Your backend is live in 3 minutes
```

---

## Cost Breakdown

### Development (Local)
```
Frontend: $0 (Vite local dev)
Backend:  $0 (Node local)
Total:    $0/month
```

### Staging/Testing (Optional)
```
Vercel:   $0-20/month (can use free tier)
Railway:  $7-15/month (hobby tier)
Total:    $7-35/month
```

### Production (1000+ users)
```
Vercel:   $20/month (Pro plan)
Railway:  $30-50/month (standard container)
Database: $30/month (PostgreSQL, if needed)
Total:    $80-100/month
```

---

## Why NOT Other Platforms

### ❌ AWS Lambda for Backend
- **Problem:** 15-minute timeout (WebSocket dies)
- **Problem:** Cold start (2-3 seconds on first request)
- **Problem:** Complex setup (IAM, VPC, security)
- **Better alternative:** Railway (same power, easier)

### ❌ Vercel Edge Functions for Backend
- **Problem:** 10-second timeout
- **Problem:** Stateless (can't keep game rooms)
- **Problem:** No WebSocket support
- **This won't work** for real-time games

### ❌ Netlify for Frontend
- **Problem:** Nearly identical to Vercel
- **Slightly different DX**
- **Vercel is better for React**

### ❌ Heroku for Backend
- **Problem:** Free tier no longer available
- **Problem:** Slower than Railway
- **Railway is better**

### ❌ Self-hosting (your own server)
- **Problem:** DevOps complexity
- **Problem:** Security management
- **Problem:** Scaling is manual
- **Problem:** Less reliable than platforms

---

## Architecture Decision Record

**Decision:** Use Vercel (Frontend) + Railway (Backend)

**Rationale:**
1. **Best-in-class** for each component
2. **Easy to learn** (both have good docs)
3. **Cost-effective** (free/cheap to start)
4. **Production-ready** (used by major apps)
5. **Easy switching** (not lock-in proprietary)

**Alternatives Considered:**
- AWS: Too complex, overkill
- GCP/Azure: More expensive
- Single platform: No platform does both well
- Self-hosting: Operational burden

**Trade-offs Accepted:**
- Vendor lock-in (acceptable for small projects)
- Can't run everything locally without platforms
- Learning curve for each platform (small)

---

## Deployment Checklist by Environment

### Local Development (No Cloud Needed)
```bash
# Terminal 1
cd backend && npm run dev    # http://localhost:3001

# Terminal 2
cd game-web && npm run dev   # http://localhost:5173

# Open browser: http://localhost:5173
# Test game locally
✅ Done!
```

### Staging (Test Before Production)
```bash
# Backend to Railway
1. Create Railway account
2. Connect GitHub
3. Select /backend folder
4. Deploy

# Frontend to Vercel
1. Create Vercel account
2. Connect GitHub
3. Select /game-web folder
4. Deploy

# Update env vars
- VITE_BACKEND_URL → Railway URL
- VITE_WEBSOCKET_URL → Railway WSS URL
✅ Test multiplayer in staging
```

### Production (Live)
```bash
# Same as staging, but with:
1. Custom domain
2. SSL certificate (auto)
3. Monitoring (Sentry, etc.)
4. Database backups
5. Error tracking
✅ Monitor uptime
```

---

## When to Consider Alternatives

### If You Need...

**More backend power:**
- → Move to AWS Lambda + SQS (complex)
- → Or Railway Scale tier ($50-100/month)

**Lower latency:**
- → Vercel Edge + Cloudflare Workers
- → Or multiple backends globally

**Real database:**
- → Add PostgreSQL to Railway
- → Or managed database (AWS RDS)

**User authentication:**
- → Add Auth0 or Firebase Auth
- → Easy integration with Vercel

**File storage:**
- → Add AWS S3 or Cloudinary
- → For card images, user profiles

---

## Summary

| Component | Choice | Why |
|-----------|--------|-----|
| **Frontend** | Vercel | Perfect for SPA, CDN, easy |
| **Backend** | Railway | WebSocket, persistent, cheap |
| **Database** | PostgreSQL on Railway | If needed, same hosting |
| **Local Dev** | Localhost | No dependencies needed |
| **Auth** | Auth0 (optional) | If user accounts needed |
| **Storage** | CDN (local assets) | Card images with Vercel CDN |

---

## Next Steps

1. ✅ **Develop locally** (already set up)
2. ⏳ **Deploy backend to Railway** (when ready)
3. ⏳ **Deploy frontend to Vercel** (when ready)
4. ⏳ **Connect them** (update env vars)
5. ⏳ **Monitor** (Sentry, Railway logs)

See:
- `LOCAL_DEVELOPMENT.md` - How to code locally
- `VERCEL_DEPLOYMENT_GUIDE.md` - How to deploy frontend
- `RAILWAY_DEPLOYMENT_GUIDE.md` - How to deploy backend (next)

---

**Created:** P4 Planning  
**Status:** Architecture decided  
**Confidence:** Very High (this is industry standard)
