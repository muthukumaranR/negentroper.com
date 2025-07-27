#!/bin/bash

# Negentroper Proxy Installation Script
set -e

echo "🚀 Installing Negentroper Proxy System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    print_status "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version check passed: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Create necessary directories
print_status "Creating directory structure..."
mkdir -p data ssl/certs ssl/private logs config

# Copy example files if they don't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from example..."
    cp .env.example .env
    print_warning "Please edit .env file to configure your settings"
fi

if [ ! -f data/projects.json ]; then
    print_status "Creating example projects registry..."
    cp data/projects.example.json data/projects.json
fi

# Make CLI executable
print_status "Making CLI executable..."
chmod +x bin/negentroper-proxy

# Add to PATH (optional)
read -p "Add negentroper-proxy to PATH? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create symlink in user's local bin
    mkdir -p ~/.local/bin
    ln -sf "$(pwd)/bin/negentroper-proxy" ~/.local/bin/negentroper-proxy
    print_status "Added to ~/.local/bin/ (make sure ~/.local/bin is in your PATH)"
fi

# Generate API key
print_status "Generating secure API key..."
API_KEY=$(openssl rand -hex 32)
sed -i.bak "s/your-secret-admin-key-here/$API_KEY/" .env
print_status "Generated API key: $API_KEY"

# Set up systemd service (optional)
if command -v systemctl &> /dev/null; then
    read -p "Set up systemd service? (requires sudo) (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create proxy user
        if ! id "proxy" &>/dev/null; then
            print_status "Creating proxy user..."
            sudo useradd -r -s /bin/false proxy
        fi
        
        # Copy service file
        sudo cp config/systemd.service.example /etc/systemd/system/negentroper-proxy.service
        
        # Update service file with current directory
        sudo sed -i "s|/opt/negentroper-proxy|$(pwd)|g" /etc/systemd/system/negentroper-proxy.service
        
        # Set permissions
        sudo chown -R proxy:proxy . || print_warning "Could not change ownership to proxy user"
        
        # Reload systemd
        sudo systemctl daemon-reload
        
        print_status "Systemd service created. Enable with: sudo systemctl enable negentroper-proxy"
    fi
fi

# Check for nginx (optional)
if command -v nginx &> /dev/null; then
    read -p "Set up nginx configuration? (requires sudo) (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo cp config/nginx.conf.example /etc/nginx/sites-available/negentroper-proxy
        print_status "Nginx configuration copied to /etc/nginx/sites-available/"
        print_warning "To enable: sudo ln -s /etc/nginx/sites-available/negentroper-proxy /etc/nginx/sites-enabled/"
        print_warning "Then: sudo nginx -t && sudo systemctl reload nginx"
    fi
fi

# Set up SSL (optional)
read -p "Generate self-signed SSL certificate for development? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v openssl &> /dev/null; then
        print_status "Generating self-signed certificate..."
        openssl req -x509 -newkey rsa:4096 \
            -keyout ssl/private/negentroper.com.key \
            -out ssl/certs/negentroper.com.crt \
            -days 365 -nodes \
            -subj "/CN=*.negentroper.com"
        print_status "Self-signed certificate generated"
        print_warning "For production, use Let's Encrypt certificates"
    else
        print_error "OpenSSL not found"
    fi
fi

# Test installation
print_status "Testing installation..."
if ./bin/negentroper-proxy --help > /dev/null 2>&1; then
    print_status "CLI tool working correctly"
else
    print_error "CLI tool test failed"
    exit 1
fi

# Final instructions
echo
echo "🎉 Installation completed successfully!"
echo
echo "Next steps:"
echo "1. Edit .env file to configure your settings"
echo "2. Configure DNS to point *.negentroper.com to this server"
echo "3. Start the proxy server:"
echo "   ./bin/negentroper-proxy start"
echo
echo "Useful commands:"
echo "   ./bin/negentroper-proxy status          # Check system status"
echo "   ./bin/negentroper-proxy projects list   # List all projects"
echo "   ./bin/negentroper-proxy discovery scan  # Scan for services"
echo
echo "Admin API key: $API_KEY"
echo "Save this key securely!"
echo

print_warning "Remember to:"
print_warning "- Configure your DNS records"
print_warning "- Update SSL settings in .env for production"
print_warning "- Review security settings"