#!/bin/bash

echo "🔧 MOZ SOLIDÁRIA - PostgreSQL Authentication Fix (Working Version)"
echo "=================================================================="

# Find PostgreSQL version and paths
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
PG_CONFIG_DIR="/etc/postgresql/${PG_VERSION}/main"
PG_DATA_DIR="/var/lib/postgresql/${PG_VERSION}/main"

echo "📋 Found PostgreSQL version: $PG_VERSION"
echo "📂 Config directory: $PG_CONFIG_DIR"

# 1. Backup current configurations
echo "📋 Creating backups..."
if [ -f "$PG_CONFIG_DIR/pg_hba.conf" ]; then
    sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup created"
else
    echo "❌ pg_hba.conf not found at $PG_CONFIG_DIR"
    exit 1
fi

# 2. Check current PostgreSQL status
echo "📊 Checking PostgreSQL status..."
sudo systemctl status postgresql --no-pager

# 3. Update user password using psql (safer than single-user mode)
echo "🔄 Updating user password..."
sudo -u postgres psql -c "ALTER USER adamoabdala WITH PASSWORD 'Jeison2@@';"

if [ $? -eq 0 ]; then
    echo "✅ Password updated successfully"
else
    echo "❌ Failed to update password"
    exit 1
fi

# 4. Configure pg_hba.conf for md5 authentication
echo "🔐 Configuring authentication..."
sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.temp"

# Replace authentication methods
sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_CONFIG_DIR/pg_hba.conf"
sudo sed -i 's/host    all             all             127.0.0.1\/32            scram-sha-256/host    all             all             127.0.0.1\/32            md5/' "$PG_CONFIG_DIR/pg_hba.conf"

# Show changes
echo "📋 Authentication configuration changes:"
diff "$PG_CONFIG_DIR/pg_hba.conf.temp" "$PG_CONFIG_DIR/pg_hba.conf" || echo "No differences found"

# 5. Reload PostgreSQL configuration
echo "🔄 Reloading PostgreSQL configuration..."
sudo systemctl reload postgresql

# Wait a moment for reload
sleep 3

# 6. Test connection with new configuration
echo "🧪 Testing PostgreSQL connection..."
PGPASSWORD='Jeison2@@' psql -h 127.0.0.1 -U adamoabdala -d moz_solidaria_db -c "SELECT version();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL connection successful!"
    
    # 7. Test Django connection
    echo "🧪 Testing Django connection..."
    cd /home/ubuntu/moz-solidaria/backend
    
    # Activate virtual environment if not already active
    if [ -z "$VIRTUAL_ENV" ]; then
        source venv/bin/activate
    fi
    
    # Test Django database connection
    python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
    print('✅ Django database connection successful!')
except Exception as e:
    print(f'❌ Django connection failed: {e}')
    exit(1)
" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "🎉 All connections working! Running migrations..."
        python manage.py migrate
        echo "🎯 System ready for deployment!"
    else
        echo "❌ Django connection failed - checking configuration..."
        echo "📋 Current Django database config:"
        python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()
from django.conf import settings
print(settings.DATABASES['default'])
" 2>/dev/null
    fi
else
    echo "❌ PostgreSQL connection failed"
    echo "📋 Checking PostgreSQL status..."
    sudo systemctl status postgresql --no-pager
    echo "📋 Checking pg_hba.conf..."
    sudo cat "$PG_CONFIG_DIR/pg_hba.conf" | grep -E "(local|host.*127)"
    exit 1
fi

echo "✅ PostgreSQL fix completed!"
