#!/bin/bash

echo "🔧 MOZ SOLIDÁRIA - PostgreSQL Authentication Fix"
echo "=================================================="

# 1. Backup current configurations
echo "📋 Creating backups..."
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)

# 2. Stop PostgreSQL service
echo "🛑 Stopping PostgreSQL..."
sudo systemctl stop postgresql

# 3. Start PostgreSQL in single user mode to reset password
echo "🔄 Resetting user password..."
sudo -u postgres postgres --single -D /var/lib/postgresql/*/main << EOF
ALTER USER adamoabdala WITH PASSWORD 'Jeison2@@';
\q
EOF

# 4. Configure pg_hba.conf for md5 authentication
echo "🔐 Configuring authentication..."
sudo sed -i '/^local.*all.*all.*peer/c\local   all             all                                     md5' /etc/postgresql/*/main/pg_hba.conf
sudo sed -i '/^host.*all.*all.*127.0.0.1\/32.*scram-sha-256/c\host    all             all             127.0.0.1/32            md5' /etc/postgresql/*/main/pg_hba.conf

# 5. Start PostgreSQL service
echo "▶️ Starting PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 6. Wait for service to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# 7. Test connection with new configuration
echo "🧪 Testing PostgreSQL connection..."
PGPASSWORD='Jeison2@@' psql -h 127.0.0.1 -U adamoabdala -d moz_solidaria_db -c "SELECT version();"

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL connection successful!"
    
    # 8. Test Django connection
    echo "🧪 Testing Django connection..."
    cd /home/ubuntu/moz-solidaria/backend
    source venv/bin/activate
    
    # Test Django settings
    python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()
from django.db import connection
connection.cursor()
print('✅ Django database connection successful!')
"
    
    if [ $? -eq 0 ]; then
        echo "🎉 All connections working! Running migrations..."
        python manage.py migrate
        echo "🎯 System ready for deployment!"
    else
        echo "❌ Django connection failed"
        exit 1
    fi
else
    echo "❌ PostgreSQL connection failed"
    exit 1
fi

echo "✅ PostgreSQL fix completed successfully!"
