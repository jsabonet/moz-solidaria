#!/bin/bash

echo "🔧 MOZ SOLIDÁRIA - Complete Production Setup"
echo "============================================="

# 1. Update system and install dependencies
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y nginx supervisor postgresql-client

# 2. Create dedicated user if not exists
if ! id "mozuser" &>/dev/null; then
    echo "👤 Creating dedicated user 'mozuser'..."
    sudo adduser --system --group --home /home/mozuser --shell /bin/bash mozuser
fi

# 3. Set up proper permissions
echo "🔑 Setting up permissions..."
sudo chown -R mozuser:mozuser /home/ubuntu/moz-solidaria
sudo chmod +x /home/ubuntu/moz-solidaria/backend/venv/bin/gunicorn

# 4. Create log directories
echo "📁 Creating log directories..."
sudo mkdir -p /var/log/mozsolidaria
sudo chown mozuser:mozuser /var/log/mozsolidaria

# 5. Update Gunicorn configuration for production
echo "⚙️ Updating Gunicorn configuration..."
cd /home/ubuntu/moz-solidaria/backend

cat > gunicorn.conf.py << 'EOF'
# Gunicorn Production Configuration for MOZ SOLIDÁRIA
import multiprocessing

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = 2
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 2

# Restart workers after this many requests
max_requests = 1000
max_requests_jitter = 50

# Process naming
proc_name = 'mozsolidaria_gunicorn'

# Server mechanics
daemon = False
pidfile = '/var/run/mozsolidaria.pid'
user = 'mozuser'
group = 'mozuser'

# Logging
errorlog = '/var/log/mozsolidaria/error.log'
loglevel = 'info'
accesslog = '/var/log/mozsolidaria/access.log'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
EOF

# 6. Install systemd service
echo "🚀 Installing systemd service..."
sudo cp /home/ubuntu/moz-solidaria/mozsolidaria.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mozsolidaria

# 7. Test Django before starting service
echo "🧪 Testing Django application..."
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=moz_solidaria_api.settings

python manage.py check --deploy
if [ $? -ne 0 ]; then
    echo "❌ Django check failed"
    exit 1
fi

python manage.py collectstatic --noinput

# 8. Test database connection
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
    echo "❌ Database test failed"
    exit 1
fi

# 9. Start the service
echo "▶️ Starting MOZ SOLIDÁRIA service..."
sudo systemctl start mozsolidaria

# 10. Check service status
sleep 5
sudo systemctl status mozsolidaria --no-pager

# 11. Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mozsolidaria > /dev/null << 'EOF'
server {
    listen 80;
    server_name 209.97.128.71;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/ubuntu/moz-solidaria/backend;
    }

    location /media/ {
        root /home/ubuntu/moz-solidaria/backend;
    }

    location / {
        include proxy_params;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/mozsolidaria /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "✅ MOZ SOLIDÁRIA production setup completed!"
echo "🌐 Application should be available at: http://209.97.128.71"
echo "📊 Check status with: sudo systemctl status mozsolidaria"
echo "📋 View logs with: sudo journalctl -u mozsolidaria -f"
