#!/bin/bash

# Script de Configuração do Nginx - Moz Solidária (Versão Atualizada)
# Servidor: 209.97.128.71
# Diretório: /home/ubuntu/moz-solidaria/
# Data: 2025-11-29

set -e  # Parar em caso de erro

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 Configurando Nginx para Moz Solidária...${NC}"
echo ""

# Definir caminhos
PROJECT_DIR="/home/ubuntu/moz-solidaria"
FRONTEND_DIST="$PROJECT_DIR/dist"
MEDIA_DIR="$PROJECT_DIR/backend/media"
STATIC_DIR="$PROJECT_DIR/backend/static"

# 1. Verificar estrutura de diretórios
echo -e "${YELLOW}📁 Verificando estrutura de diretórios...${NC}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Diretório do projeto não encontrado: $PROJECT_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Projeto encontrado: $PROJECT_DIR${NC}"

# 2. Criar diretórios necessários se não existirem
echo -e "${YELLOW}📦 Criando diretórios necessários...${NC}"

mkdir -p "$MEDIA_DIR/blog_images"
mkdir -p "$MEDIA_DIR/uploads"
mkdir -p "$STATIC_DIR"

echo -e "${GREEN}✅ Diretórios criados/verificados${NC}"

# 3. Verificar configuração do Django
echo -e "${YELLOW}🐍 Verificando configuração do Django...${NC}"

SETTINGS_FILE="$PROJECT_DIR/backend/mozsolidaria/settings.py"
if [ -f "$SETTINGS_FILE" ]; then
    echo -e "${BLUE}MEDIA_ROOT atual:${NC}"
    grep "MEDIA_ROOT" "$SETTINGS_FILE" || echo "Não encontrado"
    echo -e "${BLUE}MEDIA_URL atual:${NC}"
    grep "MEDIA_URL" "$SETTINGS_FILE" || echo "Não encontrado"
else
    echo -e "${YELLOW}⚠️  Settings não encontrado em $SETTINGS_FILE${NC}"
fi

# 4. Backup da configuração atual do Nginx
BACKUP_DIR="/root/backups/nginx_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -d /etc/nginx/sites-available ]; then
    cp -r /etc/nginx/sites-available/* "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✅ Backup criado: $BACKUP_DIR${NC}"
fi

# 5. Criar configuração do Nginx
NGINX_CONF="/etc/nginx/sites-available/mozsolidaria"

echo -e "${YELLOW}🔧 Criando configuração do Nginx...${NC}"

cat > "$NGINX_CONF" << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name mozsolidaria.org www.mozsolidaria.org;
    
    # Redirect all HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
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
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss application/json 
               application/javascript application/xml image/svg+xml;

    # Frontend - React App
    root $FRONTEND_DIST;
    index index.html;

    # Serve static frontend files
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache control for HTML (no cache)
        location ~* \.html\$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
        
        # Cache static assets (JS, CSS, images, fonts)
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # Serve media files (user uploads)
    location /media/ {
        alias $MEDIA_DIR/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # Try to serve file, if not found return 404 (frontend will handle fallback)
        try_files \$uri =404;
    }

    # Serve Django static files
    location /static/ {
        alias $STATIC_DIR/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxy API requests to Django/Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Django admin interface
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logs
    access_log /var/log/nginx/mozsolidaria_access.log;
    error_log /var/log/nginx/mozsolidaria_error.log warn;
}
EOF

echo -e "${GREEN}✅ Configuração do Nginx criada${NC}"

# 6. Habilitar site
echo -e "${YELLOW}🔗 Habilitando site...${NC}"

# Remover link antigo se existir
rm -f /etc/nginx/sites-enabled/mozsolidaria
rm -f /etc/nginx/sites-enabled/default

# Criar novo link
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/mozsolidaria

echo -e "${GREEN}✅ Site habilitado${NC}"

# 7. Testar configuração do Nginx
echo -e "${YELLOW}🧪 Testando configuração do Nginx...${NC}"

if nginx -t 2>&1 | tee /tmp/nginx_test.log; then
    echo -e "${GREEN}✅ Configuração válida${NC}"
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    cat /tmp/nginx_test.log
    echo -e "${YELLOW}Restaurando backup...${NC}"
    cp "$BACKUP_DIR"/* /etc/nginx/sites-available/ 2>/dev/null || true
    exit 1
fi

# 8. Ajustar permissões
echo -e "${YELLOW}🔐 Ajustando permissões...${NC}"

# Permissões para media
chown -R www-data:www-data "$MEDIA_DIR"
chmod -R 755 "$MEDIA_DIR"

# Permissões para static
chown -R www-data:www-data "$STATIC_DIR"
chmod -R 755 "$STATIC_DIR"

# Permissões para frontend dist
if [ -d "$FRONTEND_DIST" ]; then
    chown -R www-data:www-data "$FRONTEND_DIST"
    chmod -R 755 "$FRONTEND_DIST"
fi

echo -e "${GREEN}✅ Permissões ajustadas${NC}"

# 9. Recarregar Nginx
echo -e "${YELLOW}🔄 Recarregando Nginx...${NC}"
systemctl reload nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx recarregado com sucesso${NC}"
else
    echo -e "${RED}❌ Nginx não está rodando${NC}"
    systemctl status nginx --no-pager
    exit 1
fi

# 10. Verificar Gunicorn
echo -e "${YELLOW}🐍 Verificando Gunicorn...${NC}"

if systemctl is-active --quiet gunicorn; then
    echo -e "${GREEN}✅ Gunicorn está rodando${NC}"
else
    echo -e "${YELLOW}⚠️  Gunicorn não está rodando. Tentando iniciar...${NC}"
    systemctl start gunicorn
    sleep 2
    if systemctl is-active --quiet gunicorn; then
        echo -e "${GREEN}✅ Gunicorn iniciado${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar Gunicorn${NC}"
        systemctl status gunicorn --no-pager
    fi
fi

# 11. Estatísticas de arquivos
echo ""
echo -e "${BLUE}📊 Estatísticas:${NC}"
echo -e "  Frontend dist: $(du -sh $FRONTEND_DIST 2>/dev/null | cut -f1 || echo 'N/A')"
echo -e "  Media files: $(find $MEDIA_DIR -type f 2>/dev/null | wc -l) arquivos"
echo -e "  Media size: $(du -sh $MEDIA_DIR 2>/dev/null | cut -f1 || echo 'N/A')"
echo -e "  Static files: $(find $STATIC_DIR -type f 2>/dev/null | wc -l) arquivos"

# 12. Listar imagens recentes
echo ""
echo -e "${BLUE}📸 Imagens recentes em blog_images:${NC}"
ls -lht "$MEDIA_DIR/blog_images/" 2>/dev/null | head -10 || echo "Nenhuma imagem encontrada"

# 13. Resumo final
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Configuração concluída com sucesso!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Informações importantes:${NC}"
echo -e "  🌐 Site: https://mozsolidaria.org"
echo -e "  📁 Frontend: $FRONTEND_DIST"
echo -e "  📂 Media: $MEDIA_DIR"
echo -e "  📦 Static: $STATIC_DIR"
echo -e "  🔧 Config: $NGINX_CONF"
echo ""
echo -e "${YELLOW}🔍 Verificações recomendadas:${NC}"
echo -e "  1. curl -I https://mozsolidaria.org"
echo -e "  2. curl -I https://mozsolidaria.org/media/blog_images/"
echo -e "  3. tail -f /var/log/nginx/mozsolidaria_error.log"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo -e "  - Coletar static files: cd $PROJECT_DIR/backend && python manage.py collectstatic --noinput"
echo -e "  - Verificar imagens ausentes e fazer upload se necessário"
echo -e "  - Testar site: https://mozsolidaria.org"
echo ""
