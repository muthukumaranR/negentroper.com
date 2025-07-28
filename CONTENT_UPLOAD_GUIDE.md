# 📤 Content Upload Guide

## Quick Commands

### 1. Add New Content
```bash
# Navigate to project
cd /Users/mramasub/projekts/negentroper/negentroper-cms

# Add your changes
git add .

# Commit with message
git commit -m "Add new content: [describe what you added]"

# Push to GitHub
git push origin main
```

### 2. Update Existing Content
```bash
# Edit files as needed
# Then:
git add .
git commit -m "Update: [describe changes]"
git push origin main
```

## File Locations

- **Landing page**: `standalone-landing.html` (no dependencies)
- **Next.js version**: `app/page.tsx` (requires build)
- **Documentation**: `*.md` files
- **Images**: `public/` folder

## Deployment Options

### GitHub Pages (Auto-deploy)
- Push to main branch
- Site updates automatically
- View at: `https://muthukumaranr.github.io/negentroper.com/`

### Local Testing
```bash
# Test standalone version
open standalone-landing.html

# Or serve with Python
python3 -m http.server 3000
# Visit: http://localhost:3000/standalone-landing.html
```

## Common Workflows

### Add New Page
1. Create HTML file in root directory
2. `git add [filename].html`
3. `git commit -m "Add new page: [filename]"`
4. `git push origin main`

### Update Landing Page
1. Edit `standalone-landing.html`
2. `git add standalone-landing.html`
3. `git commit -m "Update landing page: [describe changes]"`
4. `git push origin main`

### Add Images/Assets
1. Add files to `public/` folder
2. `git add public/`
3. `git commit -m "Add assets: [describe files]"`
4. `git push origin main`

## Status Check
```bash
# Check what's changed
git status

# See commit history
git log --oneline -5

# Check current branch
git branch
```

That's it. Add, commit, push.