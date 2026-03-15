# 🚀 Vercel Deployment Guide - Portale von Molthar

**Quick Reference for deploying P4 to production**

---

## Prerequisites

- [ ] GitHub account with code pushed
- [ ] Vercel account (free at https://vercel.com)
- [ ] Backend deployed (Railway/Heroku)
- [ ] Node.js 18+ installed locally

---

## Step 1: Create Vercel Account & Connect GitHub

```bash
# 1. Go to https://vercel.com
# 2. Sign in with GitHub
# 3. Authorize Vercel to access your repositories
# 4. Click "New Project"
# 5. Select "portale-von-molthar" repository
# 6. Click "Import"
```

**Vercel will auto-detect:**
- Framework: Vite
- Root directory: ./game-web
- Build command: npm run build
- Output directory: dist

---

## Step 2: Create vercel.json Configuration

**File:** `game-web/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  
  "env": {
    "VITE_BACKEND_URL": "@VITE_BACKEND_URL",
    "VITE_WEBSOCKET_URL": "@VITE_WEBSOCKET_URL",
    "VITE_ENV": "@VITE_ENV",
    "VITE_SENTRY_DSN": "@VITE_SENTRY_DSN"
  },
  
  "regions": ["fra1"],
  
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)\\.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    }
  ],
  
  "redirects": [
    {
      "source": "/api/(.*)",
      "destination": "${VITE_BACKEND_URL}/api/:1",
      "permanent": false
    }
  ]
}
```

---

## Step 3: Update Environment Variables

**In Vercel Dashboard:**

```
Project Settings → Environment Variables

Variable Name: VITE_BACKEND_URL
Value: https://portale-von-molthar-api.railway.app
Development: (leave empty for local dev)
Preview: https://portale-von-molthar-api.railway.app
Production: https://portale-von-molthar-api.railway.app

---

Variable Name: VITE_WEBSOCKET_URL
Value: wss://portale-von-molthar-api.railway.app
Development: ws://localhost:3001
Preview: wss://portale-von-molthar-api.railway.app
Production: wss://portale-von-molthar-api.railway.app

---

Variable Name: VITE_ENV
Value: production

---

Variable Name: VITE_SENTRY_DSN
Value: (get from Sentry project)
```

---

## Step 4: Update Frontend Socket Configuration

**File:** `src/lib/socket-client.ts`

```typescript
import { io } from 'socket.io-client';

// Get URLs from environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

console.log('[Socket] Connecting to:', WEBSOCKET_URL || BACKEND_URL);

// Create socket connection
export const socket = io(WEBSOCKET_URL || BACKEND_URL, {
  // For production, use WSS (WebSocket Secure)
  transports: ['websocket', 'polling'],
  
  // Reconnection options
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  
  // WebSocket specific
  secure: import.meta.env.VITE_ENV === 'production', // Use WSS in production
  
  // Auth (if needed)
  // auth: {
  //   token: getAuthToken()
  // }
});

// Connection handlers
socket.on('connect', () => {
  console.log('[Socket] Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);
  // Show "Reconnecting..." UI
});

socket.on('connect_error', (error) => {
  console.error('[Socket] Connection Error:', error);
});

export default socket;
```

---

## Step 5: Create .env.local for Local Development

**File:** `game-web/.env.local`

```
VITE_BACKEND_URL=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_ENV=development
VITE_SENTRY_DSN=
```

**File:** `game-web/.env.production`

```
VITE_BACKEND_URL=https://portale-von-molthar-api.railway.app
VITE_WEBSOCKET_URL=wss://portale-von-molthar-api.railway.app
VITE_ENV=production
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

---

## Step 6: Test Build Locally

```bash
cd game-web

# Build with production env vars
npm run build

# Check output
ls -la dist/
# Should see: index.html, assets/, etc.

# Test locally with local backend
npm run dev
# Visit http://localhost:5173
# Check console for WebSocket connection
```

---

## Step 7: Deploy to Vercel

```bash
# Ensure everything is committed
git status

# Push to GitHub
git push origin main

# Vercel automatically deploys!
# Check: https://vercel.com/dashboard

# Or trigger manual deployment
vercel --prod
```

**Expected output:**
```
✓ Build completed
✓ Deployed to production: https://portale-von-molthar.vercel.app
✓ Build took 45s
✓ Assets: 2.5 MB total
```

---

## Step 8: Verify Production Deployment

```bash
# 1. Visit production URL
https://portale-von-molthar.vercel.app

# 2. Open browser console (F12)
# Look for: "[Socket] Connected: <id>"

# 3. Test game flow
# - Create room
# - Join as another player
# - Play a game

# 4. Check network tab
# - WebSocket connection to backend (wss://)
# - No failed requests

# 5. Check performance
# - Page load < 2s
# - Assets cached
# - No console errors
```

---

## Step 9: Configure Custom Domain (Optional)

```bash
# In Vercel Dashboard:
# Project Settings → Domains

# Add your domain:
# portale-von-molthar.com

# Vercel provides DNS records:
# - CNAME: www.vercel-dns.com
# - Or use A record with provided IP

# Update your domain registrar:
# Go to your domain provider (GoDaddy, Namecheap, etc.)
# Add DNS records from Vercel
# Wait 5-10 minutes for propagation

# Verify:
# - https://portale-von-molthar.com (works)
# - SSL certificate auto-renewed
```

---

## Step 10: Set Up Monitoring

### Sentry (Error Tracking)

```bash
# 1. Sign up at https://sentry.io
# 2. Create project: Portale von Molthar
# 3. Get DSN from project settings
# 4. Add to Vercel env: VITE_SENTRY_DSN=<dsn>

# 5. Initialize in frontend:
# src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  tracesSampleRate: 1.0,
});
```

### Vercel Analytics

```
Dashboard → Analytics
- Shows real user metrics
- Core Web Vitals
- Request distribution
- Error tracking
```

---

## Troubleshooting

### Issue: Build Fails on Vercel

**Solution:**
```bash
# 1. Check build logs in Vercel Dashboard
# 2. Common causes:
#    - Missing environment variable
#    - TypeScript error
#    - Missing dependency

# 3. Test locally first:
npm install
npm run build

# 4. If it works locally but fails on Vercel:
# - Check env vars are set correctly
# - Commit and push again
# - Clear Vercel cache: Settings → Git → Redeploy
```

### Issue: WebSocket Connection Fails

**Check:**
```
1. Backend is running:
   curl -I https://portale-von-molthar-api.railway.app

2. CORS is configured (if needed):
   Access-Control-Allow-Origin: https://portale-von-molthar.vercel.app

3. WebSocket is enabled on backend:
   socketIO.engine.generateId = () => uuidv4();

4. Firewall/proxy not blocking WebSocket:
   Check browser console for CORS or blocked errors
```

### Issue: Assets Not Loading

**Solution:**
```bash
# 1. Verify assets are in public/assets/
ls -la public/assets/

# 2. Check paths in components:
// Correct:
<img src="/assets/cards/pearls/pearl-5.png" />

// Wrong:
<img src="./assets/cards/pearls/pearl-5.png" />

# 3. Rebuild and redeploy
npm run build
git push origin main
```

### Issue: Slow Page Load

**Optimize:**
```
1. Compress images:
   - Convert PNG to WebP
   - Use ImageOptim or similar

2. Enable brotli compression:
   - vite.config.ts already configured

3. Code splitting:
   - Move Socket.io to separate chunk
   - Lazy load components

4. CDN caching:
   - vercel.json already configured
   - Assets cached for 1 year
```

---

## Maintenance

### Regular Tasks

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Run tests before deploying
npm test

# Deploy
git push origin main
```

### Monitoring

```
Daily:
- Check Vercel dashboard for errors
- Monitor WebSocket connections
- Check server logs (Railway)

Weekly:
- Review analytics
- Check error rates
- Review database usage

Monthly:
- Security audit
- Performance review
- Cost optimization
```

---

## Database Setup (Optional - for future phases)

### PostgreSQL on Railway

```bash
# Railway CLI already installed
railway add postgres

# Get connection string
railway variable list

# Environment variable
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Backup Strategy

```
1. Daily backups from Railway
2. Export to S3 bucket
3. Test restore weekly
```

---

## Performance Checklist

- [ ] Build time < 2 minutes
- [ ] Bundle size < 300KB (gzipped)
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 4s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3s
- [ ] WebSocket latency < 100ms
- [ ] 99.9% uptime

---

## Security Checklist

- [ ] HTTPS everywhere (Vercel auto)
- [ ] WSS for WebSocket (production only)
- [ ] API keys in environment variables
- [ ] No secrets in code
- [ ] CORS configured correctly
- [ ] Rate limiting on backend
- [ ] Input validation
- [ ] SQL injection prevention

---

## Deployment Checklist

```
Pre-deployment:
□ All tests passing
□ No TypeScript errors
□ Build succeeds locally
□ Environment variables set in Vercel
□ Backend deployed and running
□ WebSocket tested locally

Deployment:
□ Push to main branch
□ Monitor Vercel build
□ Check production URL
□ Verify WebSocket connection
□ Run smoke tests
□ Check error tracking (Sentry)

Post-deployment:
□ Monitor analytics
□ Check for errors
□ Performance metrics
□ User feedback
```

---

**Created:** Session 7  
**Last Updated:** P4 Implementation  
**Status:** Ready for deployment
