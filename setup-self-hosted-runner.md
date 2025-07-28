# Setup Self-Hosted GitHub Runner

## 🏠 Why Self-Hosted Runner?

Since your Mac is on a private network (192.168.1.198), GitHub's cloud runners can't reach it. A self-hosted runner runs on your Mac and can deploy locally.

## 🚀 Quick Setup

### 1️⃣ Download Runner
```bash
# Create runner directory
mkdir -p ~/github-runner && cd ~/github-runner

# Download latest runner (macOS)
curl -o actions-runner-osx-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-osx-x64-2.321.0.tar.gz

# Extract
tar xzf ./actions-runner-osx-x64-2.321.0.tar.gz
```

### 2️⃣ Configure Runner
Go to: https://github.com/muthukumaranR/negentroper.com/settings/actions/runners/new

Copy the configuration commands shown there, which will look like:
```bash
./config.sh --url https://github.com/muthukumaranR/negentroper.com --token XXXXXX
```

### 3️⃣ Install as Service
```bash
# Install as background service
sudo ./svc.sh install

# Start the service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

### 4️⃣ Update Workflow
Add `runs-on: self-hosted` to your workflow jobs:

```yaml
deploy:
  name: 🚀 Deploy to Mac
  runs-on: self-hosted  # Changed from ubuntu-latest
  needs: [build, pre-deploy-check]
  # ... rest of config
```

## ✅ Benefits
- Direct access to your Mac (localhost deployment)
- No network configuration needed
- Faster builds (local resources)
- Full control over environment

## ⚠️ Considerations
- Your Mac needs to be always on for deployments
- Runner uses your Mac's resources
- Security: Only enable for trusted repositories