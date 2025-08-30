#!/bin/bash

# MOZ SOLIDÁRIA - Application Setup Script for DigitalOcean
# Run this after the initial server setup

set -e

echo "🔧 Setting up MOZ SOLIDÁRIA application..."

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

# Variables
APP_DIR="/var/www/mozsolidaria/app"
VENV_DIR="/var/www/mozsolidaria/venv"
USER="mozsolidaria"

# Switch to app user for the rest of the setup
print_info "Switching to mozsolidaria user for application setup..."

sudo -u $USER bash << 'EOF'
set -e

APP_DIR="/var/www/mozsolidaria/app"
VENV_DIR="/var/www/mozsolidaria/venv"

# Clone repository (replace with your actual repository URL)
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/jsabonet/moz-solidaria.git $APP_DIR
else
    echo "📥 Updating repository..."
    cd $APP_DIR && git pull origin main
fi

cd $APP_DIR

# Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv $VENV_DIR
source $VENV_DIR/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file from template
echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.production .env
    echo "📝 Please edit /var/www/mozsolidaria/app/backend/.env with your actual values"
fi

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create superuser (optional - you can do this manually later)
echo "👤 Creating superuser (skip if already exists)..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@mozsolidaria.org', 'changeme123')
    print('Superuser created: admin / changeme123')
else:
    print('Superuser already exists')
" || true

# Collect static files
echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Application setup completed!"
EOF

print_status "Application setup completed successfully!"
print_info "Next step: Configure Nginx and Gunicorn services"
