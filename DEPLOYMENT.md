# Deployment Guide - Look, I Tried

## Quick Deploy to GitHub

### 1. Create GitHub Repository

**Option A: Via GitHub CLI (fastest)**
```bash
# Install GitHub CLI if needed
brew install gh

# Login to GitHub
gh auth login

# Create public repo and push
gh repo create look-i-tried --public --source=. --remote=origin --push
```

**Option B: Via GitHub Website**
```bash
# 1. Go to https://github.com/new
# 2. Fill in:
#    - Repository name: look-i-tried
#    - Description: Outfit customizer web app with AI generation and QR downloads
#    - Public repository
#    - Don't initialize with README (we already have one)
# 3. Click "Create repository"

# 4. Then run these commands:
git remote add origin https://github.com/YOUR_USERNAME/look-i-tried.git
git branch -M main
git push -u origin main
```

---

## Deploy to Netlify

### Option 1: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod

# Follow the prompts:
# - Create & configure a new site
# - Build command: npm run build
# - Publish directory: .next
```

### Option 2: Netlify Dashboard

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize
4. Select your `look-i-tried` repository
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Environment variables:** (if using optional features)
     ```
     OPENAI_API_KEY=your_key_here
     CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
     CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
     CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret
     ```
6. Click "Deploy site"

**Your site will be live at:** `https://your-site-name.netlify.app`

---

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, then deploy to production:
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework:** Next.js (auto-detected)
   - **Build command:** Auto-detected
   - **Environment variables:** (optional)
     ```
     OPENAI_API_KEY
     CLOUDFLARE_R2_ACCOUNT_ID
     CLOUDFLARE_R2_ACCESS_KEY_ID
     CLOUDFLARE_R2_SECRET_ACCESS_KEY
     ```
4. Click "Deploy"

**Your site will be live at:** `https://your-site.vercel.app`

---

## Environment Variables Setup

### Development (.env.local)
Already configured locally - **don't commit this file!**

### Production (Netlify/Vercel)

**Required for AI Generation:**
```bash
OPENAI_API_KEY=sk-proj-...
```

**Required for QR Downloads:**
```bash
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=outfit-images
CLOUDFLARE_R2_PUBLIC_URL=https://your-cdn.com
```

---

## Custom Domain (Optional)

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### Vercel
1. Go to Project → Settings → Domains
2. Add your domain
3. Configure DNS records

---

## Post-Deployment Checklist

- [ ] Site is live and accessible
- [ ] All features working (upload, customize, download)
- [ ] Mobile responsive
- [ ] Webcam permission works
- [ ] Background removal works
- [ ] QR code generation works (if R2 configured)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (auto with Netlify/Vercel)

---

## Monitoring

### Netlify
- **Analytics:** Site → Analytics
- **Logs:** Site → Deploys → Deploy log
- **Functions:** Site → Functions

### Vercel
- **Analytics:** Project → Analytics
- **Logs:** Project → Deployments → Logs
- **Performance:** Auto-tracked

---

## Troubleshooting

### Build Fails
**Check:**
- `package.json` dependencies are correct
- Build command is `npm run build`
- Node version compatible (18+)

### Environment Variables Not Working
**Fix:**
- Re-deploy after adding env vars
- Check variable names (no typos)
- Restart build

### 404 Errors
**Fix:**
- Ensure publish directory is `.next`
- Check `netlify.toml` configuration
- Verify build completed successfully

---

## GitHub Repository Setup

### README.md
Already included with:
- Project description
- Features list
- Setup instructions
- Technology stack

### .gitignore
Already configured to exclude:
- `node_modules/`
- `.env.local`
- `.next/`
- Build artifacts

---

## Share Your Project

Once deployed, share:
- **Live URL:** https://your-site.netlify.app
- **GitHub:** https://github.com/YOUR_USERNAME/look-i-tried
- **Demo video:** Record a quick walkthrough

---

Happy deploying! 🚀

