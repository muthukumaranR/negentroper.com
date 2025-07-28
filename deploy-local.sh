#!/bin/bash

# Local deployment script for Mac
set -e

echo "🚀 Starting local deployment on Mac..."

# Configuration
REPO_DIR="/Users/mramasub/projekts/negentroper/negentroper-cms"
COMPOSE_FILE="docker-compose.simple.yml"

# Navigate to repo directory
cd "$REPO_DIR"

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build new image
echo "🏗️ Building Docker image..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Stop and remove old container
echo "🛑 Stopping old container..."
docker-compose -f $COMPOSE_FILE down

# Start new container
echo "🚀 Starting new container..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for health check
echo "⏳ Waiting for container to be healthy..."
sleep 10

# Check status
if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Site is available at:"
    echo "   - http://localhost"
    echo "   - http://$(ipconfig getifaddr en0)"
    
    # Show container logs
    echo ""
    echo "📋 Recent logs:"
    docker-compose -f $COMPOSE_FILE logs --tail=20
else
    echo "❌ Deployment failed!"
    docker-compose -f $COMPOSE_FILE logs
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo "🎉 Local deployment completed!"