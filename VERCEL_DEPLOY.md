# Deploy to Vercel

This guide walks you through deploying SynthChat to Vercel for free.

## Prerequisites

- GitHub account
- Vercel account (free, sign up with GitHub)

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create repo on GitHub (via web or CLI)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/synthchat.git
git branch -M main
git push -u origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository: `YOUR_USERNAME/synthchat`
4. Vercel will auto-detect settings:
   - Framework: `Vite`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

5. Click **Deploy**

Wait 1-2 minutes for the build to complete.

## Step 3: Access Your App

Vercel will provide a URL like:
```
https://synthchat-xyz123.vercel.app
```

Open this on your iPhone, set your PIN, and install as PWA.

## Step 4: Custom Domain (Optional)

For extra privacy, use a custom domain:

1. Buy a domain from Namecheap (~$10/year)
2. In Vercel Dashboard → Project → Settings → Domains
3. Add your domain
4. Follow DNS instructions (add CNAME record)

Now you have a private URL like `https://chat.yourdomain.com`

## Automatic Deployments

Every time you push to `main`, Vercel auto-deploys:

```bash
git add .
git commit -m "Update features"
git push origin main
# Vercel automatically redeploys
```

## Environment Variables (if using backend)

If you add a backend later, add env vars:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add your variables (e.g., `API_TOKEN`, `JWT_SECRET`)
3. Redeploy

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard. Common issues:
- Missing `package.json` dependencies
- TypeScript errors (run `npm run typecheck` locally first)

### 404 on Routes

The `vercel.json` rewrite rules handle this. If missing, add:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### PWA Not Installing

Check browser console for manifest errors. Ensure:
- `manifest.json` exists in `public/`
- Icons referenced correctly
- Served over HTTPS (Vercel handles this)

## Cost

| Tier | Price | Limits |
|------|-------|--------|
| Hobby (Free) | $0 | 100GB bandwidth, 6K build mins |
| Pro | $20/mo | 1TB bandwidth, 400K build mins |

For 2 users: **Free tier is plenty**.

## Security Note

- Code is public (if repo is public)
- PIN protects the app (hashed locally)
- Use custom domain + don't share URL for privacy
- Consider making repo **private** if you add sensitive config
