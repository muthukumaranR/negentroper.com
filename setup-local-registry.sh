#!/bin/bash

# Setup local Docker registry on Mac
echo "🐳 Setting up local Docker registry..."

# Start registry container
docker run -d \
  --restart=always \
  --name registry \
  -p 5000:5000 \
  -v /Users/mramasub/docker-registry:/var/lib/registry \
  registry:2

# Configure Docker to allow insecure registry
echo "📝 Configuring Docker daemon..."
echo "Add this to Docker Desktop settings > Docker Engine:"
echo '{
  "insecure-registries": ["192.168.1.198:5000"]
}'

echo "✅ Registry running at: 192.168.1.198:5000"
echo "🔄 Restart Docker Desktop after adding insecure-registries"