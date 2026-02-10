# Deployment Guide for KZgrid

This guide covers deploying the KZgrid application to production using Vercel (recommended) or other platforms.

## Table of Contents

- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying Next.js applications. It provides automatic deployments, preview URLs, and excellent performance.

### Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier available)
2. A configured Supabase project (see [SETUP.md](SETUP.md))
3. Your Supabase credentials ready

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository `MarvinRucinski/KZgrid`

3. **Configure Project**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

   **Where to find these values:**
   - Go to your Supabase project dashboard
   - Settings → API
   - Copy "Project URL" and "anon public" key

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd /path/to/KZgrid
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new one
   - Confirm settings
   - Add environment variables when prompted

5. **Set environment variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   
   Select "Production" and "Preview" for both variables.

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy every push to `main` branch to production
- Create preview deployments for pull requests
- Run build checks on every commit

---

## Manual Deployment

### Option 1: Deploy to VPS (Ubuntu/Debian)

1. **Prepare your server**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Clone and build**
   ```bash
   git clone https://github.com/MarvinRucinski/KZgrid.git
   cd KZgrid
   npm install
   npm run build
   ```

3. **Create environment file**
   ```bash
   nano .env.local
   ```
   
   Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the application**
   ```bash
   pm2 start npm --name "kzgrid" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx as reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   COPY package.json package-lock.json ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   ENV NEXT_TELEMETRY_DISABLED=1
   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV=production
   ENV NEXT_TELEMETRY_DISABLED=1

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT=3000
   ENV HOSTNAME="0.0.0.0"

   CMD ["node", "server.js"]
   ```

2. **Build and run**
   ```bash
   docker build -t kzgrid .
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_url \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
     kzgrid
   ```

---

## Environment Variables

The application requires the following environment variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes | `eyJhbGciOiJIUzI1NiI...` |

### Setting Environment Variables

**Vercel:**
- Dashboard: Project Settings → Environment Variables
- CLI: `vercel env add VARIABLE_NAME`

**VPS:**
- Create `.env.local` file in project root
- Use environment variables in systemd service or PM2 config

**Docker:**
- Pass via `-e` flag or docker-compose environment section

---

## Post-Deployment Checklist

After deploying, verify the following:

- [ ] Application loads successfully at the deployment URL
- [ ] Grid displays with 3x3 layout
- [ ] Categories load from Supabase (check network tab)
- [ ] Search modal opens when clicking cells
- [ ] User search returns results
- [ ] Answer validation works (cells turn green/red)
- [ ] Images load correctly (if using user photos)
- [ ] No console errors in browser
- [ ] Mobile responsive design works

### Test Your Deployment

1. **Visit your deployed URL**
   - For Vercel: `https://your-project.vercel.app`
   - For custom domain: `https://your-domain.com`

2. **Test functionality**
   - Click any cell in the grid
   - Search for "Jan" or "Anna"
   - Select a user and verify validation

3. **Check browser console**
   - Press F12 to open developer tools
   - Look for any errors in Console tab
   - Verify API calls in Network tab

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module" or "Module not found"**
- Solution: Clear build cache and reinstall dependencies
  ```bash
  rm -rf .next node_modules package-lock.json
  npm install
  npm run build
  ```

**Error: "supabaseUrl is required"**
- Solution: Ensure environment variables are set correctly
- Verify variable names match exactly: `NEXT_PUBLIC_SUPABASE_URL`
- For Vercel: Check Environment Variables in project settings
- For VPS: Ensure `.env.local` exists and is properly formatted

### Runtime Errors

**"Failed to fetch" or network errors**
- Check Supabase project is running and accessible
- Verify API keys are correct
- Check Supabase project region/URL

**Images not loading**
- Verify `next.config.ts` includes Supabase hostname pattern
- Check image URLs are valid and accessible
- Review browser console for CORS errors

**Categories or users not showing**
- Verify database migration was run successfully
- Check Supabase database tables have data
- Test Supabase connection directly in SQL Editor

### Performance Issues

**Slow page load**
- Enable Vercel Analytics to identify bottlenecks
- Consider implementing caching for category data
- Optimize images (ensure proper sizing)

**High API usage**
- Review Supabase usage in dashboard
- Implement query result caching if needed
- Check for unnecessary re-renders in React components

---

## Custom Domain Setup

### On Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

### DNS Configuration Example

For domain `kzgrid.yourdomain.com`:

```
Type: CNAME
Name: kzgrid
Value: cname.vercel-dns.com
```

Or for root domain:

```
Type: A
Name: @
Value: 76.76.21.21
```

---

## Monitoring and Analytics

### Vercel Analytics

1. Enable in Project Settings → Analytics
2. View real-time metrics and user behavior
3. Monitor Web Vitals (LCP, FID, CLS)

### Supabase Monitoring

1. Go to Supabase Dashboard
2. Navigate to Database → Usage
3. Monitor API requests, database size, bandwidth

---

## Continuous Deployment

Once deployed, every push to your main branch will automatically deploy to production on Vercel.

### Deployment Workflow

```
git add .
git commit -m "Your changes"
git push origin main
↓
Vercel automatically:
  1. Detects the push
  2. Runs npm install
  3. Runs npm run build
  4. Deploys to production
  5. Notifies you via email/Slack
```

### Preview Deployments

For pull requests:
1. Create a new branch
2. Make changes and push
3. Open pull request
4. Vercel creates preview deployment
5. Test on preview URL before merging

---

## Support

If you encounter issues during deployment:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
3. Review [Supabase Documentation](https://supabase.com/docs)
4. Open an issue on GitHub

---

## Summary

**Recommended Quick Start:**
1. Push code to GitHub
2. Connect to Vercel
3. Add Supabase environment variables
4. Deploy (2 minutes)
5. Test your application

**Your app will be live and automatically updated on every push to main branch!**
