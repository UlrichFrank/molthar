# 🚂 Railway Deployment Guide - Backend (Node.js + Socket.io)

**Complete guide to deploy the backend to Railway for production multiplayer gaming**

---

## Why Railway?

| Feature | Railway | Vercel | AWS Lambda |
|---------|---------|--------|-----------|
| **WebSocket** | ✅ Yes | ❌ No (10s timeout) | ❌ No (15m timeout) |
| **Persistent** | ✅ Always on | ❌ Serverless | ❌ Serverless |
| **Cost** | $7-50/month | $20+/month | Unpredictable |
| **Setup** | 5 minutes | N/A | 30+ minutes |
| **Logs** | Real-time | Paid | CloudWatch |
| **Scaling** | Vertical | Horizontal | Complex |

**Railway is the best choice for a Node.js Socket.io backend.**

---

## Prerequisites

1. **GitHub account** (for deployment)
2. **Railway account** (sign up at https://railway.app)
3. **Node.js 18+** installed locally
4. **Dockerfile** or `package.json` in `/backend` folder (already created)

---

## Step 1: Create Railway Project

```bash
# Go to https://railway.app
# Click "Create New Project"
# Select "Deploy from GitHub"

# Or: Use Railway CLI
npm install -g @railway/cli
railway login
railway init
```

---

## Step 2: Connect GitHub Repository

```
Railway Dashboard:
1. Click "Create New Project"
2. Choose "GitHub"
3. Connect your GitHub account
4. Select: molthar (your repo)
5. Choose "Deploy from GitHub"
```

**Railway will automatically:**
- Detect Node.js from package.json
- Detect TypeScript
- Run: npm install
- Run: npm run build
- Run: npm start

---

## Step 3: Configure Environment Variables

**Railway Dashboard:**
```
Project Settings → Variables

Add these:

NODE_ENV                  production
PORT                      3001 (Railway assigns, don't change)
LOG_LEVEL                 info (or debug for troubleshooting)
FRONTEND_URL              https://portale-von-molthar.vercel.app
ENABLE_CORS               true
```

**For later:**
- DATABASE_URL (if using PostgreSQL)
- REDIS_URL (if using Redis for caching)
- SENTRY_DSN (for error tracking)

---

## Step 4: Create Dockerfile (if needed)

**If Railway can't auto-detect Node.js, create `/backend/Dockerfile`:**

```dockerfile
# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy TypeScript files
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
```

**Then commit to Git:**
```bash
git add backend/Dockerfile
git commit -m "Add Dockerfile for Railway deployment"
git push origin main
```

Railway will detect the Dockerfile and use it.

---

## Step 5: Deploy

**Option A: GitHub-based (Recommended)**
```
Railway Dashboard:
1. Click "Deployments" tab
2. Wait for automatic build (2-5 minutes)
3. Watch logs in real-time
4. Service goes live automatically
```

**Option B: CLI-based**
```bash
cd backend
railway link              # Connect to Railway project
railway up                # Deploy latest code
railway logs --follow     # Watch logs live
```

**Option C: Push to GitHub**
```bash
git push origin main      # Railway auto-detects and deploys
```

---

## Step 6: Verify Deployment

**Check in Railway Dashboard:**
```
1. Deployments tab → See build progress
2. Logs tab → See startup messages
3. You should see:
   "Server running on port 3001"
   "[Socket] Server initialized"
```

**Get your URL:**
```
Project Settings → Domains
Example: portale-von-molthar-api.railway.app
```

**Test the backend is running:**
```bash
curl https://portale-von-molthar-api.railway.app/health
# Should return:
# {"status":"ok","timestamp":"2024-01-15T..."}
```

---

## Step 7: Update Frontend to Use Railway Backend

**game-web/.env.production**
```bash
VITE_BACKEND_URL=https://portale-von-molthar-api.railway.app
VITE_WEBSOCKET_URL=wss://portale-von-molthar-api.railway.app
```

**Frontend code (src/lib/socket-client.ts):**
```typescript
import { io } from 'socket.io-client';

const getSocketURL = () => {
  if (import.meta.env.DEV) {
    return 'ws://localhost:3001';  // Local development
  }
  return import.meta.env.VITE_WEBSOCKET_URL || 'wss://...railway.app';
};

export const socket = io(getSocketURL(), {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

**Deploy frontend to Vercel:**
```bash
git push origin main
# Vercel auto-detects and deploys
# Frontend now connects to Railway backend
```

---

## Step 8: Monitor in Production

**Railway Dashboard → Metrics:**
- Memory usage
- CPU usage
- Request count
- Error rate

**Real-time logs:**
```bash
railway logs --follow
```

**Common issues:**
```
Issue: "Connection refused"
→ Check PORT environment variable
→ Restart Railway service

Issue: "WebSocket connection failed"
→ Check FRONTEND_URL is correct
→ Verify CORS is enabled
→ Check Rails has WSS certificate (auto)

Issue: "Out of memory"
→ Scale up: Railway → Scale
→ Increase memory allocation
→ Check for memory leaks in code
```

---

## Step 9: Custom Domain (Optional)

**Railway Dashboard → Domains:**
```
1. Click "Add Domain"
2. Choose your domain (you own it)
3. Update DNS (CNAME record)
   Name: api
   Target: portale-von-molthar-api.railway.app
   TTL: 3600
4. Wait 5-10 minutes
5. Test: https://api.youromain.com
```

**Update frontend env var:**
```bash
VITE_WEBSOCKET_URL=wss://api.yourdomain.com
```

---

## Step 10: Backup & Disaster Recovery

**Enable auto-backups (if using database):**

**Railway Database Support:**
```
1. Click "+ New" in Railway
2. Select "PostgreSQL"
3. Automatically configured
4. Your backend can connect via DATABASE_URL
5. Railway handles backups
```

**Database connection in backend:**
```typescript
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();
// Use client for queries
```

---

## Troubleshooting

### Build Fails
```
Check logs in Railway Dashboard:
1. Click "Deployments"
2. Click the failed deployment
3. See error messages
4. Common issues:
   - Missing package.json
   - Wrong Node.js version
   - Syntax errors in code
   - Missing environment variables
```

**Fix:**
```bash
# Test locally first
cd backend
npm install
npm run build
npm start

# Should work locally before Railway
# Then push to git
git push origin main
```

### Port Issues
```
Railway auto-assigns PORT environment variable
Your server should listen on process.env.PORT or 3001:

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
```

### WebSocket Connection Failed
```
1. Check URL format: wss://api.railway.app (not ws://)
2. Check CORS in backend:
   cors: {
     origin: process.env.FRONTEND_URL,
     methods: ['GET', 'POST'],
   }
3. Check transports: ['websocket', 'polling']
4. Restart Railway service
```

### Out of Memory
```
Railway Dashboard → Settings → Scaling:
1. Increase memory from 512MB to 1GB
2. Or add more containers for load balancing
3. Check code for memory leaks
```

---

## Production Checklist

- [ ] Environment variables set in Railway
- [ ] CORS configured for Vercel frontend URL
- [ ] WebSocket tested locally (ws://localhost:3001)
- [ ] WebSocket tested on production (wss://...)
- [ ] Database connected (if using)
- [ ] Logs accessible in Railway dashboard
- [ ] Metrics monitored (memory, CPU)
- [ ] Error tracking enabled (Sentry optional)
- [ ] Custom domain configured (optional)
- [ ] Backup strategy in place (for database)

---

## Cost Breakdown

**Railway Pricing:**
- Free tier: 500 hours/month (not suitable for production)
- Hobby: $5/month + $0.10/hour usage
- Pro: $20/month (5 containers, unlimited hours)

**For P4 Multiplayer:**
- Expected: ~$15-30/month
- Low traffic: $10-15/month
- High traffic (1000+ concurrent): $50-100/month

**Bundle:**
- Vercel (frontend): $20/month
- Railway (backend): $20/month
- **Total: ~$40/month**

---

## Next Steps

1. ✅ Create Railway account
2. ✅ Connect GitHub repo
3. ✅ Set environment variables
4. ✅ Deploy and monitor
5. ✅ Test WebSocket connection
6. ✅ Update frontend environment vars
7. ✅ Deploy frontend to Vercel
8. ✅ Test multiplayer game
9. ✅ Monitor production logs
10. ✅ Scale if needed

---

## Quick Reference

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend && railway init

# Deploy
railway up

# View logs
railway logs --follow

# Get project URL
railway open

# View environment variables
railway env list

# Set environment variable
railway env set NODE_ENV=production

# View metrics
railway metric
```

---

**Created:** P4 - Backend Deployment  
**Status:** Ready for deployment  
**Estimated time:** 15 minutes to deploy
