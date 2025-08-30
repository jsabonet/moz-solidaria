#!/bin/bash

# MOZ SOLIDÁRIA - Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting MOZ SOLIDÁRIA deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version check passed: $(node --version)"

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Run linting
print_status "Running code quality checks..."
npm run lint || print_warning "Linting completed with warnings"

# Clean previous build
print_status "Cleaning previous build..."
rm -rf dist/

# Build for production
print_status "Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_status "Build completed successfully!"

# Display build info
echo ""
echo "📊 Build Information:"
echo "📁 Output directory: dist/"
echo "📦 Build size:"
du -sh dist/ 2>/dev/null || echo "Unable to calculate size"

# Count files
FILE_COUNT=$(find dist -type f | wc -l)
echo "📄 Total files: $FILE_COUNT"

echo ""
echo "🎉 Deployment preparation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload the 'dist/' folder to your web server"
echo "2. Configure server for SPA routing (see DEPLOYMENT.md)"
echo "3. Set up environment variables for production"
echo "4. Configure SSL certificate"
echo "5. Test the deployment"

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
