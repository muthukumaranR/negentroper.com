# 🔧 Domain Name Fix: negentropic → negentroper

## 🎯 Current Situation
- ✅ **Correct domain**: negentroper.com (owned, IP: 162.255.119.164)
- ❌ **Wrong repository**: negentropic.com 
- 🏠 **Goal**: Host locally and point domain to local server

## 🚀 Solution Steps

### Step 1: Rename GitHub Repository

**Manual GitHub Steps:**
1. Go to: `https://github.com/muthukumaranR/negentropic.com/settings`
2. Scroll to "Repository name"
3. Change: `negentropic.com` → `negentroper.com`
4. Click "Rename"

### Step 2: Update Local Git Remote

```bash
# Update the remote URL to match new repository name
git remote set-url origin https://github.com/muthukumaranR/negentroper.com.git

# Verify the change
git remote -v
```

### Step 3: Update All Documentation

**Files to update:**
- README.md
- DEPLOYMENT_GUIDE.md
- GitHub Actions workflow
- Docker configurations
- Package.json

### Step 4: Local Hosting Setup

**Option A: Next.js Development Server (Quick Test)**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at: http://localhost:3000
```

**Option B: Production Build + Local Server**
```bash
# Build for production
npm run build

# Serve locally
npx serve out -p 3000

# Or use a simple HTTP server
python3 -m http.server 3000 -d out
```

**Option C: Docker Local Hosting**
```bash
# Build Docker image
docker build -t negentroper-com .

# Run locally
docker run -p 3000:3000 negentroper-com

# Access at: http://localhost:3000
```

### Step 5: Point Domain to Local Server

**If you want negentroper.com to point to your local machine:**

1. **Public Access (requires port forwarding):**
   ```bash
   # Get your public IP
   curl ifconfig.me
   
   # Configure router port forwarding: 80 → your-local-ip:3000
   # Update DNS A record: negentroper.com → your-public-ip
   ```

2. **Local DNS (for testing):**
   ```bash
   # Edit /etc/hosts (macOS/Linux)
   sudo nano /etc/hosts
   
   # Add line:
   127.0.0.1 negentroper.com
   ```

### Step 6: Update GitHub Actions Workflow

**File: `.github/workflows/deploy.yml`**
- Update all references from `negentropic.com` → `negentroper.com`
- Update environment URL
- Update deployment targets

## 🎯 Quick Fix Commands

Run these commands to fix everything:

```bash
# 1. Update git remote
git remote set-url origin https://github.com/muthukumaranR/negentroper.com.git

# 2. Build and test locally
npm install
npm run build
npx serve out -p 3000

# 3. Test at http://localhost:3000
```

## 🏠 Local Hosting Recommendations

**For Development:**
- Use `npm run dev` for live reloading
- Access at `http://localhost:3000`

**For Production Testing:**
- Use `npm run build` then `npx serve out`
- More realistic production environment

**For Public Access:**
- Set up port forwarding on router
- Configure DNS A record to point to your public IP
- Consider using ngrok for temporary public access

## 📱 Mobile Testing

**Test on mobile devices:**
```bash
# Find your local IP
ipconfig getifaddr en0  # macOS
# or
hostname -I  # Linux

# Access from mobile: http://your-local-ip:3000
```

Your cyberpunk landing page will work perfectly with negentroper.com! 🚀