# GitHub Actions Deployment Configuration Guide

## 🚀 Quick Setup for Push-to-Deploy

This guide will help you configure GitHub Actions to automatically deploy to your Mac whenever you push to the main branch.

## 📋 Prerequisites Checklist

- [x] Docker installed on Mac
- [x] GitHub Actions workflow configured
- [x] SSH key generated (`~/.ssh/github-actions-deploy`)
- [ ] SSH enabled on Mac
- [ ] GitHub secrets configured
- [ ] GitHub variables configured

## 🔧 Step-by-Step Configuration

### 1️⃣ Enable SSH on your Mac

1. Open **System Settings** (or System Preferences on older macOS)
2. Navigate to **General** → **Sharing**
3. Enable **Remote Login**
4. Note your username and IP address shown

### 2️⃣ Verify SSH Key Setup

The SSH key has already been generated. Let's verify it's in your authorized_keys:

```bash
# Check if the key is authorized
grep "github-actions-deploy" ~/.ssh/authorized_keys

# If not found, add it:
cat ~/.ssh/github-actions-deploy.pub >> ~/.ssh/authorized_keys
```

### 3️⃣ Get Your Deployment Information

Run this command to get your deployment details:

```bash
echo "DEPLOY_HOST: $(ipconfig getifaddr en0)"
echo "DEPLOY_USER: $(whoami)"
echo "DEPLOY_PATH: ~/negentroper-deploy"
```

### 4️⃣ Configure GitHub Secrets

Go to: https://github.com/muthukumaranR/negentroper.com/settings/secrets/actions

Click "New repository secret" for each:

1. **DEPLOY_HOST**
   - Name: `DEPLOY_HOST`
   - Value: Your Mac's IP (from step 3)

2. **DEPLOY_USER**
   - Name: `DEPLOY_USER`
   - Value: Your Mac username (from step 3)

3. **DEPLOY_SSH_KEY**
   - Name: `DEPLOY_SSH_KEY`
   - Value: Contents of `~/.ssh/github-actions-deploy` (private key)
   
   To copy the private key:
   ```bash
   cat ~/.ssh/github-actions-deploy | pbcopy
   ```

### 5️⃣ Configure GitHub Variables

Go to: https://github.com/muthukumaranR/negentroper.com/settings/variables/actions

Click "New repository variable" for each:

1. **DEPLOY_ENABLED**
   - Name: `DEPLOY_ENABLED`
   - Value: `true`

2. **DEPLOY_PATH**
   - Name: `DEPLOY_PATH`
   - Value: `~/negentroper-deploy`

3. **DEPLOY_URL**
   - Name: `DEPLOY_URL`
   - Value: `http://[YOUR_MAC_IP]` (replace with IP from step 3)

## 🧪 Testing the Deployment

### Option 1: Push to Main Branch
```bash
# Make a small change
echo "<!-- Deployment test -->" >> README.md
git add README.md
git commit -m "Test GitHub Actions deployment"
git push origin main
```

### Option 2: Manual Workflow Trigger
1. Go to https://github.com/muthukumaranR/negentroper.com/actions
2. Click on "🚀 Deploy Negentroper.com" workflow
3. Click "Run workflow" → "Run workflow"

## 📊 Monitoring Deployment

### Check GitHub Actions Progress
- Visit: https://github.com/muthukumaranR/negentroper.com/actions
- Look for the running workflow
- Click to see real-time logs

### Check Local Deployment
```bash
# Check if container is running
docker ps | grep negentroper-web

# View container logs
docker logs negentroper-web

# Test the site
curl http://localhost
```

## 🔄 Changing Deployment Targets

To deploy to a different machine:

1. Generate SSH key on the new target
2. Update GitHub secrets with new host/user/key
3. Update GitHub variables with new path/URL
4. Push to trigger deployment

To temporarily disable deployment:
- Set `DEPLOY_ENABLED` variable to `false`

## 🚨 Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection manually
ssh -i ~/.ssh/github-actions-deploy $(whoami)@localhost
```

### Permission Issues
```bash
# Ensure deployment directory exists and is writable
mkdir -p ~/negentroper-deploy
chmod 755 ~/negentroper-deploy
```

### Docker Issues
```bash
# Restart Docker Desktop
# Check Docker daemon is running
docker info
```

## 📱 Accessing Your Site

Once deployed, your site will be available at:
- Local: http://localhost
- Network: http://[YOUR_MAC_IP]
- From same network devices: http://[YOUR_MAC_IP]

## 🎯 Next Steps

1. Complete the GitHub configuration (secrets + variables)
2. Push a commit to test the deployment
3. Monitor the GitHub Actions workflow
4. Access your site at the configured URL

The deployment is designed to be resilient with health checks, rollback capabilities, and proper error handling.