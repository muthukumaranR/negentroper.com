# 🚀 Deployment Guide for negentropic.com

## 🔍 Current Status
- **Repository**: ✅ Successfully pushed to GitHub
- **Domain**: ✅ negentropic.com owned and pointing to DreamHost (205.196.219.189)
- **Issue**: ❌ No content deployed to either DreamHost or GitHub Pages

## 🎯 Deployment Options

### Option 1: GitHub Pages (Recommended for Quick Setup)

**Steps:**
1. **Enable GitHub Pages:**
   ```bash
   # Go to repository settings on GitHub:
   # https://github.com/muthukumaranR/negentropic.com/settings/pages
   
   # Configure:
   # Source: Deploy from a branch
   # Branch: main
   # Folder: / (root)
   ```

2. **Access via GitHub Pages URL:**
   ```
   https://muthukumaranr.github.io/negentropic.com/
   ```

3. **Point domain to GitHub Pages:**
   ```
   # Update DNS records for negentropic.com:
   CNAME: muthukumaranr.github.io
   ```

### Option 2: DreamHost Deployment (Self-Hosted)

**Steps:**
1. **Upload files to DreamHost:**
   ```bash
   # Build the Next.js app for static export
   npm run build
   npm run export  # If configured for static export
   
   # Upload to DreamHost via FTP/SFTP
   # Target: /home/username/negentropic.com/
   ```

2. **Configure Next.js for static export:**
   ```javascript
   // next.config.mjs
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   export default nextConfig
   ```

### Option 3: Full CI/CD to Your Server (Production)

**Steps:**
1. **Set up deployment server:**
   ```bash
   # On your server (205.196.219.189 or new server):
   sudo apt update && sudo apt install docker.io docker-compose
   sudo mkdir -p /opt/negentropic-com
   sudo chown deploy:deploy /opt/negentropic-com
   ```

2. **Configure GitHub Secrets:**
   ```bash
   # In GitHub repository settings → Secrets:
   DEPLOY_HOST=205.196.219.189  # or your server IP
   DEPLOY_USER=deploy
   DEPLOY_SSH_KEY=your-private-ssh-key
   NEXTAUTH_SECRET=random-secret-string
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

3. **Update domain DNS:**
   ```
   # Point negentropic.com A record to your server IP
   A Record: your-server-ip
   ```

## 🎯 Quick Fix: Enable GitHub Pages Now

**Immediate solution to see your landing page:**

1. **Go to repository settings:**
   ```
   https://github.com/muthukumaranR/negentropic.com/settings/pages
   ```

2. **Configure GitHub Pages:**
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
   - Click "Save"

3. **Access your site:**
   ```
   https://muthukumaranr.github.io/negentropic.com/
   ```

4. **Update Next.js for static export (if needed):**
   ```bash
   # Add to next.config.mjs:
   output: 'export'
   ```

## 🔧 Current Repository Structure
```
✅ Landing page: app/page.tsx (cyberpunk theme)
✅ GitHub Actions: .github/workflows/deploy.yml
✅ Docker config: Dockerfile, docker-compose.yml
✅ Documentation: README.md, deployment configs
```

## 🚨 Important Notes

1. **GitHub Pages Limitations:**
   - Static sites only (no server-side rendering)
   - Need to configure Next.js for static export
   - No server APIs or database

2. **DreamHost Deployment:**
   - Supports static files
   - May need PHP/MySQL if dynamic features needed
   - Manual upload required

3. **Full CI/CD Deployment:**
   - Complete feature support
   - Automatic deployments
   - Requires server setup and secrets configuration

## 🎯 Recommended Next Steps

**For immediate results:**
1. Enable GitHub Pages (5 minutes)
2. Configure Next.js for static export
3. Access site at GitHub Pages URL

**For production:**
1. Set up proper server infrastructure
2. Configure CI/CD with secrets
3. Point domain to production server

Your landing page code is ready - it just needs the right deployment target!