#!/bin/bash

echo "🚀 MOZ SOLIDÁRIA - Production Deployment Script"
echo "==============================================="

# Navigate to backend directory
cd /home/ubuntu/moz-solidaria/backend

# Activate virtual environment
source venv/bin/activate

# Update environment variables
export DJANGO_SETTINGS_MODULE=moz_solidaria_api.settings

# Create log directories
sudo mkdir -p /var/log/gunicorn
sudo chown -R $USER:$USER /var/log/gunicorn

echo "🔍 Testing Django configuration..."
python manage.py check --deploy

if [ $? -ne 0 ]; then
    echo "❌ Django configuration check failed"
    exit 1
fi

echo "📊 Collecting static files..."
python manage.py collectstatic --noinput

echo "🔄 Testing database connection..."
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
    print('✅ Database connection successful!')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection test failed"
    exit 1
fi

echo "🧪 Testing Django development server first..."
timeout 10s python manage.py runserver 127.0.0.1:8001 &
DEV_SERVER_PID=$!
sleep 5

# Test if development server responds
curl -s http://127.0.0.1:8001/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Django development server working"
    kill $DEV_SERVER_PID 2>/dev/null
else
    echo "❌ Django development server not responding"
    kill $DEV_SERVER_PID 2>/dev/null
    exit 1
fi

echo "🔧 Starting Gunicorn with proper configuration..."

# Kill any existing Gunicorn processes
pkill -f gunicorn

# Start Gunicorn with configuration file
gunicorn --config gunicorn.conf.py moz_solidaria_api.wsgi:application

echo "✅ Deployment completed!"
