# 🚀 Quick Local Setup for Negentroper.com

## 🎯 Immediate Solution (No npm issues)

### Step 1: Manual Repository Rename on GitHub
1. **Go to**: https://github.com/muthukumaranR/negentropic.com/settings
2. **Scroll down** to "Repository name"
3. **Change**: `negentropic.com` → `negentroper.com`
4. **Click "Rename"**

### Step 2: Test Landing Page Locally

**Option A: Simple Python Server (No dependencies)**
```bash
# Serve the current directory
cd /Users/mramasub/projekts/negentroper/negentroper-cms
python3 -m http.server 3000

# Access at: http://localhost:3000
```

**Option B: Use the React development files directly**
```bash
# Navigate to the app directory
cd app

# Create a simple index.html that loads the React component
# (We'll create this file)
```

**Option C: Copy landing page to simple HTML**
I can extract the landing page content and create a standalone HTML file that works without Node.js dependencies.

### Step 3: Point Your Domain (negentroper.com) to Local

**For local testing:**
```bash
# Edit your hosts file
sudo nano /etc/hosts

# Add this line:
127.0.0.1 negentroper.com

# Now negentroper.com will point to localhost
```

**For public access:**
```bash
# 1. Get your public IP
curl ifconfig.me

# 2. Configure router port forwarding: 80 → your-computer:3000
# 3. Update DNS A record: negentroper.com → your-public-ip
```

## 🎨 Alternative: Standalone HTML Version

Let me create a standalone HTML version of your cyberpunk landing page that works without any dependencies:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Negentroper - AI/Computer Scientist</title>
    <!-- Embedded CSS and JS -->
</head>
<body>
    <!-- Your cyberpunk landing page -->
</body>
</html>
```

This would include:
- ✅ Neural network animations
- ✅ Matrix digital rain
- ✅ Glitch text effects
- ✅ Interactive particles
- ✅ All cyberpunk styling
- ✅ No dependencies needed

## 🔧 Current Status

✅ **Fixed**: Domain name corrected to negentroper.com
✅ **Fixed**: Git remote updated
✅ **Fixed**: Documentation updated
⏳ **Pending**: GitHub repository rename (manual step)
⏳ **Pending**: Local hosting setup

## 🚀 Next Steps

1. **Rename GitHub repository** (manual)
2. **Choose local hosting method** (Python server recommended)
3. **Test locally** at http://localhost:3000
4. **Configure domain** pointing (optional)

Your cyberpunk landing page is ready to run locally! 🎮