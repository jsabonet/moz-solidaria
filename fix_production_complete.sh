#!/bin/bash

echo "🎨 MOZ SOLIDÁRIA - Configuração de Produção Completa"
echo "=================================================="

cd /home/ubuntu/moz-solidaria/backend
source venv/bin/activate

echo "1️⃣ Configurando arquivos estáticos..."

# Criar diretórios necessários
sudo mkdir -p /var/www/mozsolidaria/static
sudo mkdir -p /var/www/mozsolidaria/media
sudo chown -R root:root /var/www/mozsolidaria

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

echo "2️⃣ Atualizando configurações Django..."

# Atualizar .env com configurações de produção
cat > .env << 'EOF'
DEBUG=False
SECRET_KEY=moz-solidaria-production-secret-key-2024-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,167.99.93.20,209.97.128.71
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080,http://localhost:8081,http://127.0.0.1:8081,http://209.97.128.71:8000,http://209.97.128.71

# CSRF Settings
CSRF_TRUSTED_ORIGINS=http://209.97.128.71:8000,http://209.97.128.71,http://127.0.0.1:8000,http://localhost:8000
CSRF_COOKIE_SECURE=False
CSRF_COOKIE_HTTPONLY=False
SESSION_COOKIE_SECURE=False

# Database Configuration - PostgreSQL DigitalOcean
DATABASE_URL=postgresql://adamoabdala:Jeison2%40%40@127.0.0.1:5432/moz_solidaria_db

# PostgreSQL Configuration
DB_NAME=moz_solidaria_db
DB_USER=adamoabdala
DB_PASSWORD=Jeison2@@
DB_HOST=127.0.0.1
DB_PORT=5432

# Static Files
STATIC_URL=/static/
STATIC_ROOT=/var/www/mozsolidaria/static
MEDIA_URL=/media/
MEDIA_ROOT=/var/www/mozsolidaria/media

# JWT Configuration
JWT_SECRET_KEY=moz-solidaria-jwt-secret-key-2024
EOF

echo "3️⃣ Instalando e configurando Nginx..."

# Instalar Nginx
sudo apt update
sudo apt install -y nginx

# Configurar Nginx para servir arquivos estáticos
sudo tee /etc/nginx/sites-available/mozsolidaria > /dev/null << 'EOF'
server {
    listen 80;
    server_name 209.97.128.71;

    # Logs
    access_log /var/log/nginx/mozsolidaria_access.log;
    error_log /var/log/nginx/mozsolidaria_error.log;

    # Static files
    location /static/ {
        alias /var/www/mozsolidaria/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /var/www/mozsolidaria/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CSRF headers
        proxy_set_header X-CSRFToken $http_x_csrftoken;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/mozsolidaria /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e recarregar Nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "4️⃣ Reiniciando serviços..."

# Reiniciar Gunicorn
sudo systemctl restart mozsolidaria

echo "5️⃣ Verificando status..."

# Status dos serviços
sudo systemctl status nginx --no-pager
sudo systemctl status mozsolidaria --no-pager

echo "✅ Configuração completa!"
echo "🌐 Acesse: http://209.97.128.71"
echo "⚙️ Admin: http://209.97.128.71/admin/"
echo "🔍 Debug: sudo journalctl -u mozsolidaria -f"
