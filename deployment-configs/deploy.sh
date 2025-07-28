#!/bin/bash

# Deployment script for Raspberry Pi
set -e

echo "🚀 Starting deployment to Raspberry Pi..."

# Configuration
DEPLOY_DIR="/opt/negentroper-com"
SERVICE_NAME="negentroper-web"
BACKUP_DIR="/opt/backups/negentroper-$(date +%Y%m%d-%H%M%S)"

# Create deployment directory if it doesn't exist
sudo mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Create backup of current deployment
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "📦 Creating backup..."
    sudo mkdir -p $(dirname $BACKUP_DIR)
    sudo cp -r $DEPLOY_DIR $BACKUP_DIR
fi

# Stop existing container
echo "🛑 Stopping existing containers..."
sudo docker-compose down || true

# Pull latest code (this will be done by GitHub Actions)
echo "📥 Extracting deployment files..."
sudo tar -xzf /tmp/deployment.tar.gz

# Build and start new containers
echo "🏗️ Building and starting containers..."
sudo docker-compose -f docker-compose.simple.yml build --no-cache
sudo docker-compose -f docker-compose.simple.yml up -d

# Wait for health check
echo "🔍 Waiting for health check..."
sleep 30

# Verify deployment
if sudo docker-compose -f docker-compose.simple.yml ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Site should be available at http://$(hostname -I | awk '{print $1}')"
    
    # Clean up old images
    echo "🧹 Cleaning up old Docker images..."
    sudo docker image prune -f
else
    echo "❌ Deployment failed!"
    echo "🔄 Rolling back..."
    
    # Rollback
    if [ -d "$BACKUP_DIR" ]; then
        sudo cp -r $BACKUP_DIR/* $DEPLOY_DIR/
        sudo docker-compose -f docker-compose.simple.yml up -d
    fi
    exit 1
fi

echo "🎉 Deployment completed successfully!"