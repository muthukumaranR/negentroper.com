#!/bin/bash

# GitHub Webhook Deployment Script
# This script handles the deployment process when triggered by GitHub webhooks

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Configuration
REPO_DIR="${REPO_PATH:-$(pwd)}"
WEBHOOK_SERVER_DIR="$REPO_DIR/webhook-server"
LOG_FILE="$WEBHOOK_SERVER_DIR/deploy.log"
PID_FILE="$WEBHOOK_SERVER_DIR/server.pid"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log "❌ Deployment failed at line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

log "📂 Working directory: $REPO_DIR"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    log "❌ Not in a git repository"
    exit 1
fi

# Pull latest changes
log "📥 Pulling latest changes from main branch..."
git fetch origin
git reset --hard origin/main

log "✅ Git pull completed"

# Install/update dependencies if package.json changed
if [ -f "$WEBHOOK_SERVER_DIR/package.json" ]; then
    cd "$WEBHOOK_SERVER_DIR"
    
    # Check if node_modules exists and package.json is newer
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        log "📦 Installing/updating dependencies..."
        npm install --production
        log "✅ Dependencies updated"
    else
        log "📦 Dependencies are up to date"
    fi
    
    cd "$REPO_DIR"
fi

# Process content if content directory exists
if [ -d "content" ]; then
    log "📝 Processing markdown content..."
    # Create public directory if it doesn't exist
    mkdir -p public
    log "✅ Content processing setup complete"
fi

# Restart the webhook server
log "🔄 Restarting webhook server..."

# Kill existing process if running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        log "🛑 Stopping existing server (PID: $PID)"
        kill "$PID"
        sleep 2
        
        # Force kill if still running
        if kill -0 "$PID" 2>/dev/null; then
            log "🔨 Force killing server"
            kill -9 "$PID"
        fi
    fi
    rm -f "$PID_FILE"
fi

# Start new server process
cd "$WEBHOOK_SERVER_DIR"
nohup node server.js > server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

log "✅ Webhook server started (PID: $SERVER_PID)"

# Wait a moment and check if server is running
sleep 2
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    log "❌ Server failed to start"
    exit 1
fi

# Test server health
log "🔍 Testing server health..."
sleep 3

if command -v curl >/dev/null 2>&1; then
    if curl -f "http://localhost:${PORT:-3001}/health" >/dev/null 2>&1; then
        log "✅ Server health check passed"
    else
        log "⚠️  Server health check failed, but server is running"
    fi
else
    log "⚠️  curl not available, skipping health check"
fi

log "🎉 Deployment completed successfully!"
log "📊 Server PID: $SERVER_PID"
log "📂 Log file: $LOG_FILE"
log "🌐 Server should be running on port ${PORT:-3001}"

# Clean up old log files (keep last 10)
find "$WEBHOOK_SERVER_DIR" -name "deploy.log.*" -type f | sort | head -n -10 | xargs rm -f 2>/dev/null || true

exit 0