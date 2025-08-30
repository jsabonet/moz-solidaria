#!/bin/bash

# MOZ SOLIDÁRIA - DigitalOcean Deployment Script
# This script sets up the application on a DigitalOcean droplet

set -e

echo "🚀 Starting MOZ SOLIDÁRIA DigitalOcean deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

print_info "Updating system packages..."
apt update && apt upgrade -y

print_info "Installing required packages..."
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib git ufw fail2ban

# Create app user
print_info "Creating application user..."
useradd --system --shell /bin/bash --home /var/www/mozsolidaria --create-home mozsolidaria || true

# Create necessary directories
print_info "Creating application directories..."
mkdir -p /var/www/mozsolidaria/{app,staticfiles,media,logs}
mkdir -p /var/log/mozsolidaria
chown -R mozsolidaria:mozsolidaria /var/www/mozsolidaria
chown -R mozsolidaria:mozsolidaria /var/log/mozsolidaria

# PostgreSQL setup
print_info "Setting up PostgreSQL..."
sudo -u postgres createdb moz_solidaria_db || true
sudo -u postgres psql -c "CREATE USER adamoabdala WITH PASSWORD 'Jeison2@@';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE moz_solidaria_db TO adamoabdala;" || true
sudo -u postgres psql -c "ALTER USER adamoabdala CREATEDB;" || true

print_status "PostgreSQL configured successfully"

# Install Python dependencies globally (or use virtual environment)
print_info "Installing Python dependencies..."
pip3 install --upgrade pip
pip3 install gunicorn psycopg2-binary

print_info "Deployment script completed!"
print_warning "Next steps:"
echo "1. Clone your repository to /var/www/mozsolidaria/app/"
echo "2. Create virtual environment and install requirements"
echo "3. Configure environment variables"
echo "4. Run database migrations"
echo "5. Collect static files"
echo "6. Configure Nginx"
echo "7. Set up Gunicorn service"

print_info "Run the application setup script next: ./setup_app.sh"
