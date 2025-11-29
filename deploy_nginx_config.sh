#!/bin/bash

# Script de Configuração Nginx - Moz Solidária (Atualizado)
# Servidor: 209.97.128.71
# Path correto: /home/ubuntu/moz-solidaria/
# Data: 2025-11-29

echo "🚀 Configurando Nginx para Moz Solidária..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variáveis
PROJECT_DIR="/home/ubuntu/moz-solidaria"
MEDIA_DIR="$PROJECT_DIR/media"
STATIC_DIR="$PROJECT_DIR/staticfiles"
DIST_DIR="$PROJECT_DIR/dist"

# 1. Criar estrutura de diretórios
echo -e "${YELLOW}📁 Criando estrutura de diretórios...${NC}"
mkdir -p "$MEDIA_DIR/blog_images"
mkdir -p "$MEDIA_DIR/uploads"
mkdir -p "$STATIC_DIR"
mkdir -p "$DIST_DIR"

# 2. Backup da configuração atual
BACKUP_DIR="/root/backups/nginx_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
if [ -f /etc/nginx/sites-available/mozsolidaria ]; then
    cp /etc/nginx/sites-available/mozsolidaria "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Backup criado em: $BACKUP_DIR${NC}"
fi

# 3. Criar configuração do Nginx
NGINX_CONF="/etc/nginx/sites-available/mozsolidaria"

cat > "$NGINX_CONF" << 'NGINXEOF'
# HTTP to HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name mozsolidaria.org www.mozsolidaria.org;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mozsolidaria.org www.mozsolidaria.org;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mozsolidaria.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mozsolidaria.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript 
               application/vnd.ms-fontobject application/x-font-ttf 
               font/opentype image/svg+xml image/x-icon;

    # Root directory for frontend
    root /home/ubuntu/moz-solidaria/dist;
    index index.html;

    # Client body size (for uploads)
    client_max_body_size 50M;

    # Frontend static files
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|json)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        # Cache HTML with shorter expiry
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }
    }

    # Media files - blog_images
    location /media/blog_images/ {
        alias /home/ubuntu/moz-solidaria/media/blog_images/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Handle missing images
        error_page 404 = @missing_blog_image;
    }

    # Media files - uploads
    location /media/uploads/ {
        alias /home/ubuntu/moz-solidaria/media/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Handle missing images
        error_page 404 = @missing_upload;
    }

    # Generic media files
    location /media/ {
        alias /home/ubuntu/moz-solidaria/media/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Handle missing files
        error_page 404 = @missing_media;
    }

    # Fallback for missing blog images
    location @missing_blog_image {
        return 302 https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=800&auto=format&fit=crop;
    }

    # Fallback for missing uploads
    location @missing_upload {
        return 302 https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=800&auto=format&fit=crop;
    }

    # Generic fallback for missing media
    location @missing_media {
        return 302 https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=800&auto=format&fit=crop;
    }

    # Django static files
    location /static/ {
        alias /home/ubuntu/moz-solidaria/staticfiles/;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API requests to Django/Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Manifest
    location /manifest.webmanifest {
        alias /home/ubuntu/moz-solidaria/dist/manifest.webmanifest;
        add_header Content-Type application/manifest+json;
        expires 1d;
    }

    # Logs
    access_log /var/log/nginx/mozsolidaria_access.log;
    error_log /var/log/nginx/mozsolidaria_error.log warn;
}
NGINXEOF

echo -e "${GREEN}✅ Configuração do Nginx criada${NC}"

# 4. Verificar e ajustar permissões
echo -e "${YELLOW}🔐 Ajustando permissões...${NC}"
chown -R www-data:www-data "$MEDIA_DIR"
chown -R www-data:www-data "$STATIC_DIR"
chmod -R 755 "$MEDIA_DIR"
chmod -R 755 "$STATIC_DIR"
chmod -R 755 "$DIST_DIR"

# 5. Habilitar site
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/mozsolidaria

# Desabilitar default se existir
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    echo -e "${YELLOW}⚠️  Site default desabilitado${NC}"
fi

# 6. Testar configuração
echo -e "${YELLOW}🔍 Testando configuração do Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Configuração válida${NC}"
    
    # 7. Recarregar Nginx
    echo -e "${YELLOW}🔄 Recarregando Nginx...${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recarregado${NC}"
else
    echo -e "${RED}❌ Erro na configuração. Restaurando backup...${NC}"
    if [ -f "$BACKUP_DIR/mozsolidaria" ]; then
        cp "$BACKUP_DIR/mozsolidaria" /etc/nginx/sites-available/mozsolidaria
    fi
    nginx -t
    exit 1
fi

# 8. Verificar arquivos de media existentes
echo ""
echo -e "${YELLOW}📊 Estatísticas de arquivos de media:${NC}"

if [ -d "$MEDIA_DIR/blog_images" ]; then
    BLOG_COUNT=$(find "$MEDIA_DIR/blog_images" -type f 2>/dev/null | wc -l)
    echo -e "${GREEN}📁 Imagens em blog_images: $BLOG_COUNT${NC}"
else
    echo -e "${RED}❌ Diretório blog_images não existe${NC}"
fi

if [ -d "$MEDIA_DIR/uploads" ]; then
    UPLOAD_COUNT=$(find "$MEDIA_DIR/uploads" -type f 2>/dev/null | wc -l)
    echo -e "${GREEN}📁 Arquivos em uploads: $UPLOAD_COUNT${NC}"
else
    echo -e "${YELLOW}⚠️  Diretório uploads não existe${NC}"
fi

# 9. Verificar Gunicorn
echo ""
echo -e "${YELLOW}🐍 Verificando Gunicorn...${NC}"
if systemctl is-active --quiet gunicorn; then
    echo -e "${GREEN}✅ Gunicorn está rodando${NC}"
else
    echo -e "${YELLOW}⚠️  Gunicorn não está rodando${NC}"
fi

# 10. Resumo final
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Verificações recomendadas:${NC}"
echo "  1. curl -I https://mozsolidaria.org"
echo "  2. curl -I https://mozsolidaria.org/media/blog_images/"
echo "  3. tail -f /var/log/nginx/mozsolidaria_error.log"
echo ""
echo -e "${YELLOW}📁 Estrutura de diretórios:${NC}"
echo "  Frontend: $DIST_DIR"
echo "  Media: $MEDIA_DIR"
echo "  Static: $STATIC_DIR"
echo ""
