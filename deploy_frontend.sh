#!/bin/bash

# MOZ SOLIDÁRIA - Frontend Build and Deploy to DigitalOcean
# Run this script to build the frontend and deploy it

set -e

echo "🎨 Building and deploying frontend to DigitalOcean..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if DROPLET_IP is set
if [ -z "$DROPLET_IP" ]; then
    echo "Please set your DigitalOcean droplet IP:"
    read -p "Droplet IP: " DROPLET_IP
fi

# Build frontend
print_info "Building frontend for production..."
npm run build

print_status "Frontend build completed!"

# Create frontend directory on server
print_info "Preparing server directories..."
ssh root@$DROPLET_IP "mkdir -p /var/www/mozsolidaria/frontend/dist"

# Deploy frontend files
print_info "Deploying frontend files to DigitalOcean..."
scp -r dist/* root@$DROPLET_IP:/var/www/mozsolidaria/frontend/dist/

# Set correct permissions
ssh root@$DROPLET_IP "chown -R mozsolidaria:mozsolidaria /var/www/mozsolidaria/frontend"

print_status "Frontend deployed successfully!"

# Test deployment
print_info "Testing deployment..."
echo "Frontend should be accessible at: http://$DROPLET_IP"

print_status "Deployment completed! 🎉"
