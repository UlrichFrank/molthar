# 📦 Vercel Deployment Guide - Frontend Only

## ⚠️ Important: Vercel is for Frontend (SPA) ONLY

```
┌────────────────────────────────────────────────┐
│  Portale von Molthar - Deployment Architecture │
├────────────────────────────────────────────────┤
│                                                │
│  Frontend (React SPA)      → Deploy to VERCEL  │
│  https://...vercel.app                         │
│                                                │
│  Backend (Node.js + Socket.io) → Deploy to ⚠️  │
│  Do NOT use Vercel for backend                 │
│  Use Railway instead (wss://...railway.app)    │
│                                                │
│  ❌ Vercel has 10s timeout (WebSocket dies)    │
│  ❌ Vercel is stateless (no game state)        │
│  ❌ Vercel can't handle persistent connections │
│                                                │
│  → See RAILWAY_DEPLOYMENT_GUIDE.md             │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Overview - Frontend Only

Vercel is optimized for deploying static sites and SPAs (Single Page Applications) with minimal configuration. This guide covers deploying **ONLY** the React/Vite frontend (`/game-web` folder).

### What is Vercel?
- **Platform:** Global serverless cloud for static sites & SPAs
- **Perfect for:** React, Next.js, Vue, static sites
- **Speed:** Global CDN (60+ edge locations)
- **Cost:** Free tier generous (suitable for production)
- **Deployment:** GitHub integration (auto-deploys on push)
- **Scaling:** Automatic (handles traffic spikes)

### What Vercel CANNOT Do
- ❌ Run persistent Node.js servers
- ❌ Handle WebSocket connections (10 second timeout)
- ❌ Store game state (stateless)
- ❌ Real-time multiplayer
- ❌ Background jobs

**For backend with WebSocket: Use Railway** (see `RAILWAY_DEPLOYMENT_GUIDE.md`)

---

## Prerequisites

1. **Vercel account** (free at https://vercel.com)
2. **GitHub account** (code must be pushed)
3. **Backend deployed** (to Railway first, see `RAILWAY_DEPLOYMENT_GUIDE.md`)
4. **Node.js 18+** locally installed

---

## Step 1: Create Vercel Account & Connect GitHub

**Go to https://vercel.com**

```
1. Click "Sign Up"
2. Choose "Continue with GitHub"
3. Authorize Vercel to access your repositories
4. GitHub will ask for permission (approve)
5. Vercel dashboard opens
```

**Or login if you already have account:**
```
1. Go to https://vercel.com
2. Click "Log In"
3. Select "GitHub"
```

---

## Step 2: Import Project

**Vercel Dashboard → Projects → "Add New"**

```
1. Click "+ Add New" → "Project"
2. Select "Import Git Repository"
3. Find "molthar" in your repositories
4. Click "Import"

Vercel will show configuration (next step)
```

---

## Step 3: Configure Build Settings

**Vercel auto-detects Vite, but verify:**

```
Project name:        portale-von-molthar
Framework:           Vite
Root directory:      ./game-web
Build command:       npm run build
Output directory:    dist
Install command:     npm install
```

**These should be auto-filled. Click "Deploy" if correct.**

If not auto-filled:
- Check if `game-web/` folder exists in repo
- Check if `game-web/package.json` exists
- Commit and push to main branch

---

## Step 4: Set Environment Variables

**Critical:** Frontend needs to know where backend is running.

**Vercel Dashboard → Project → Settings → Environment Variables**

```
Add these variables:

Name:                VITE_BACKEND_URL
Value:               https://api.portale-von-molthar.railway.app
Environments:        Production

Name:                VITE_WEBSOCKET_URL
Value:               wss://api.portale-von-molthar.railway.app
Environments:        Production

Name:                VITE_ENV
Value:               production
Environments:        Production
```

**Important:** Replace `portale-von-molthar` with your actual Railway domain/URL.

---

## Step 5: Deploy

**Vercel Dashboard → Deployments**

```
Wait for build to complete (usually 1-2 minutes)

You should see:
✅ Build completed
✅ Deployed to production

Your URL will be: https://portale-von-molthar.vercel.app
```

**Or redeploy latest code:**
```
1. Click "Redeploy" button
2. Choose "Latest Commit"
3. Wait for build
```

---

## Step 6: Verify Deployment

**Test the frontend is loading:**
```bash
# In browser
https://portale-von-molthar.vercel.app

# Should see:
# - Game start screen
# - No console errors
# - Images loading
```

**Check environment variables are set:**
```
Open browser console (F12 → Console)
Type: import.meta.env.VITE_WEBSOCKET_URL
Should output: https://wss://api.portale-von-molthar.railway.app
```

**Test connection to backend:**
```
1. Open game
2. Try to create room
3. Check browser console for "[Socket] Connected"
4. If no connection, check:
   - Backend is running on Railway
   - Backend URL is correct in env vars
   - CORS is enabled on backend
```

---

## Step 7: Automatic Deployments

**Vercel auto-deploys when you push to GitHub:**

```bash
# Make changes locally
git add .
git commit -m "Update game UI"
git push origin main

# Vercel sees push (GitHub webhook)
# → Vercel rebuilds frontend
# → Deploy complete in 1-2 minutes
# → Live site updated automatically
```

**No manual steps needed!**

---

## Step 8: Monitor & Metrics

**Vercel Dashboard → Analytics**

```
Real-time metrics:
- Request count
- Error rate
- Edge cache hit rate
- Response times
- Bandwidth usage

Free tier limits:
- 100 GB bandwidth/month (more than enough)
```

---

## Step 9: Custom Domain (Optional)

**If you own a domain:**

**Vercel Dashboard → Project Settings → Domains**

```
1. Click "Add Domain"
2. Type your domain: portale-von-molthar.com
3. Add CNAME record to your DNS:
   Name:   www
   Target: cname.vercel-dns.com
   TTL:    3600

4. Wait 5-10 minutes for DNS propagation
5. Test: https://www.portale-von-molthar.com

SSL certificate auto-generated (free)
```

---

## Step 10: Performance Optimization

**Vercel provides:**
- ✅ Automatic image optimization
- ✅ Code splitting
- ✅ Minification
- ✅ Gzip/Brotli compression
- ✅ HTTP/2 Server Push
- ✅ Edge caching

**Check build output:**
```
Vercel Dashboard → Deployments → Click deployment

View:
- Bundle size
- Cache headers
- Image optimization report
```

---

## Troubleshooting

### Build Fails

**Check Vercel Build Logs:**
```
1. Vercel Dashboard → Deployments
2. Click failed deployment
3. Scroll to "Build Logs"
4. Look for error messages
```

**Common issues:**
```
Error: "Cannot find module 'react'"
→ Run locally first: npm install && npm run build
→ Commit node_modules? NO (use .gitignore)
→ Let Vercel run npm install

Error: "game-web folder not found"
→ Check folder structure exists
→ Commit package.json to game-web/

Error: "TypeScript compilation failed"
→ Fix errors: npm run build locally
→ Verify no TypeScript errors
→ Push fixed code

Error: Environment variable undefined
→ Check Settings → Environment Variables
→ Verify correct names (case-sensitive)
→ Redeploy after adding variables
```

### Site Loads but Backend Connection Fails

**Check in browser console (F12):**
```
Error: "[Socket] Connection failed"
→ Verify VITE_WEBSOCKET_URL is set
→ Check backend is running on Railway
→ Check CORS enabled on backend
→ Look for CORS errors in console

Error: "Mixed content: https page loading ws://"
→ Use wss:// (secure WebSocket)
→ Not ws:// in production
```

**Test backend directly:**
```bash
curl https://api.portale-von-molthar.railway.app/health

Should return:
{"status":"ok","timestamp":"..."}

If fails:
→ Backend not running
→ Wrong URL in env vars
→ Check Railway dashboard
```

### Slow Performance

**Vercel Dashboard → Analytics**

```
If slow:
1. Check edge cache hit rate
2. Check image sizes (should be <100KB each)
3. Check JavaScript bundle size
4. Run: npm run build locally
5. Check: dist/ folder size
```

**If > 1MB:**
```
npm run build --stats

Check:
- Large dependencies
- Unused imports
- Image optimization
- Code splitting opportunities
```

---

## Production Checklist

- [ ] Vercel account created
- [ ] GitHub repo connected
- [ ] build settings correct (Vite, ./game-web)
- [ ] Environment variables set:
  - [ ] VITE_BACKEND_URL
  - [ ] VITE_WEBSOCKET_URL
- [ ] Frontend deployed successfully
- [ ] Backend deployed to Railway
- [ ] WebSocket connection tested
- [ ] Custom domain configured (optional)
- [ ] Analytics being monitored
- [ ] Error tracking enabled (optional: Sentry)

---

## Cost Breakdown

**Vercel Pricing:**
- Free tier: 100 GB bandwidth/month + 1000 serverless function executions/month
- Pro: $20/month (more analytics, custom domains free)

**For P4 Frontend:**
- Expected: Free tier sufficient
- High traffic (10k users): $20/month Pro plan

**Bandwidth estimate:**
- 1000 users/day
- Each user downloads ~500 KB (JS + CSS + images)
- = 500 MB/day = ~15 GB/month (plenty for free)

---

## Related Documentation

- **Local Development:** See `LOCAL_DEVELOPMENT.md`
- **Backend Deployment:** See `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Architecture Overview:** See `HOSTING_STRATEGY.md`
- **Architecture Diagram:** See `PHASE_4_ROADMAP.md` (Section 4.4.2)

---

## Quick Reference

**Deployment flow:**
```
1. Git push to GitHub
2. Vercel webhook triggered
3. Vercel runs: npm install && npm run build
4. Uploads dist/ to CDN
5. Live in 1-2 minutes
```

**Manual deploy:**
```
Vercel Dashboard → Deployments → Redeploy
Choose "Latest Commit" → Deploy
```

**Check status:**
```
Vercel Dashboard → Deployments
Green = deployed
Yellow = building
Red = failed
```

**View logs:**
```
Vercel Dashboard → Deployments → Click deployment → Build Logs
```

---

**Created:** P4 - Frontend Deployment  
**Status:** Ready to deploy  
**Estimated time:** 5 minutes (first time), 2 minutes (after)
