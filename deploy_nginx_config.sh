#!/bin/bash

# Script de Deploy e Configuração do Nginx - Moz Solidária
# Servidor: 209.97.128.71
# Data: 2025-11-29

echo "🚀 Iniciando configuração do servidor Moz Solidária..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar configuração atual do Nginx
echo -e "${YELLOW}📋 Verificando configuração do Nginx...${NC}"
nginx -t

# 2. Backup da configuração atual
BACKUP_DIR="/root/backups/nginx_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /etc/nginx/sites-available/* "$BACKUP_DIR/"
echo -e "${GREEN}✅ Backup criado em: $BACKUP_DIR${NC}"

# 3. Criar/atualizar configuração do Nginx para Moz Solidária
NGINX_CONF="/etc/nginx/sites-available/mozsolidaria"

cat > "$NGINX_CONF" << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name mozsolidaria.org www.mozsolidaria.org;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server Block
server {
    listen 443 ssl http2;
    server_name mozsolidaria.org www.mozsolidaria.org;

    # SSL Configuration (ajuste os caminhos dos certificados)
    ssl_certificate /etc/letsencrypt/live/mozsolidaria.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mozsolidaria.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "upgrade-insecure-requests" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Root directory for frontend build
    root /var/www/mozsolidaria/frontend/dist;
    index index.html;

    # Serve static files from frontend build
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Serve media files (uploaded images, documents, etc)
    location /media/ {
        alias /var/www/mozsolidaria/media/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Handle missing images gracefully
        error_page 404 = @missing_media;
    }
    
    # Fallback for missing media files
    location @missing_media {
        return 302 https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=800&auto=format&fit=crop;
    }

    # Serve static files from Django
    location /static/ {
        alias /var/www/mozsolidaria/static/;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to Django/Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts for long requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Logs
    access_log /var/log/nginx/mozsolidaria_access.log;
    error_log /var/log/nginx/mozsolidaria_error.log;
}
EOF

echo -e "${GREEN}✅ Configuração do Nginx criada/atualizada${NC}"

# 4. Habilitar site
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/mozsolidaria
echo -e "${GREEN}✅ Site habilitado${NC}"

# 5. Testar configuração
echo -e "${YELLOW}🔍 Testando configuração do Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
    
    # 6. Recarregar Nginx
    echo -e "${YELLOW}🔄 Recarregando Nginx...${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recarregado${NC}"
else
    echo -e "${RED}❌ Erro na configuração do Nginx. Restaurando backup...${NC}"
    cp "$BACKUP_DIR"/* /etc/nginx/sites-available/
    nginx -t
    exit 1
fi

# 7. Verificar estrutura de diretórios
echo -e "${YELLOW}📁 Verificando estrutura de diretórios...${NC}"

REQUIRED_DIRS=(
    "/var/www/mozsolidaria"
    "/var/www/mozsolidaria/frontend"
    "/var/www/mozsolidaria/frontend/dist"
    "/var/www/mozsolidaria/media"
    "/var/www/mozsolidaria/media/blog_images"
    "/var/www/mozsolidaria/static"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}⚠️  Criando diretório: $dir${NC}"
        mkdir -p "$dir"
    else
        echo -e "${GREEN}✅ $dir existe${NC}"
    fi
done

# 8. Verificar permissões
echo -e "${YELLOW}🔐 Ajustando permissões...${NC}"
chown -R www-data:www-data /var/www/mozsolidaria/media
chown -R www-data:www-data /var/www/mozsolidaria/static
chmod -R 755 /var/www/mozsolidaria/media
chmod -R 755 /var/www/mozsolidaria/static

echo -e "${GREEN}✅ Permissões ajustadas${NC}"

# 9. Verificar serviço Django/Gunicorn
echo -e "${YELLOW}🐍 Verificando serviço Django...${NC}"
if systemctl is-active --quiet gunicorn; then
    echo -e "${GREEN}✅ Gunicorn está rodando${NC}"
else
    echo -e "${YELLOW}⚠️  Gunicorn não está rodando. Iniciando...${NC}"
    systemctl start gunicorn
    if systemctl is-active --quiet gunicorn; then
        echo -e "${GREEN}✅ Gunicorn iniciado${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar Gunicorn${NC}"
    fi
fi

# 10. Verificar arquivos de media existentes
echo -e "${YELLOW}📊 Estatísticas de arquivos de media...${NC}"
if [ -d "/var/www/mozsolidaria/media/blog_images" ]; then
    MEDIA_COUNT=$(find /var/www/mozsolidaria/media/blog_images -type f | wc -l)
    echo -e "${GREEN}📁 Total de imagens em blog_images: $MEDIA_COUNT${NC}"
    
    if [ $MEDIA_COUNT -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Nenhuma imagem encontrada. Verifique upload de arquivos.${NC}"
    fi
else
    echo -e "${RED}❌ Diretório blog_images não existe${NC}"
fi

# 11. Mostrar status final
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Configuração concluída com sucesso!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "  1. Fazer deploy do frontend: npm run build && rsync dist/ para /var/www/mozsolidaria/frontend/"
echo "  2. Verificar logs: tail -f /var/log/nginx/mozsolidaria_error.log"
echo "  3. Testar URLs:"
echo "     - https://mozsolidaria.org (frontend)"
echo "     - https://mozsolidaria.org/api/ (backend)"
echo "     - https://mozsolidaria.org/media/blog_images/ (imagens)"
echo "  4. Certificado SSL: certbot renew --dry-run"
echo ""
echo -e "${GREEN}🎉 Servidor configurado e pronto!${NC}"
