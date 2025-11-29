# Script Automatizado para Diagnosticar e Corrigir Nginx no Servidor
# Uso: .\fix_nginx_server.ps1

$SERVER = "root@209.97.128.71"

Write-Host "🔧 Conectando ao servidor e diagnosticando problema do Nginx..." -ForegroundColor Green
Write-Host ""

# Criar script de diagnóstico e correção no servidor
$SCRIPT = @'
#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "🔍 DIAGNÓSTICO DO SERVIDOR - Moz Solidária"
echo "═══════════════════════════════════════════════════════"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Verificar estrutura de diretórios
echo -e "${BLUE}📁 1. ESTRUTURA DE DIRETÓRIOS${NC}"
echo "Diretório do projeto:"
ls -la /home/ubuntu/moz-solidaria/
echo ""
echo "Verificando dist:"
ls -la /home/ubuntu/moz-solidaria/dist/ | head -20
echo ""

# 2. Verificar Django settings para MEDIA
echo -e "${BLUE}🐍 2. CONFIGURAÇÃO DJANGO - MEDIA${NC}"
grep -E "MEDIA_ROOT|MEDIA_URL" /home/ubuntu/moz-solidaria/backend/mozsolidaria/settings.py
echo ""

# 3. Procurar arquivos de media
echo -e "${BLUE}📂 3. ARQUIVOS DE MEDIA${NC}"
echo "Procurando diretórios de media..."
find /home/ubuntu/moz-solidaria -name "blog_images" -type d
find /home/ubuntu/moz-solidaria -name "uploads" -type d
find /home/ubuntu/moz-solidaria -name "media" -type d
echo ""
echo "Total de imagens no servidor:"
find /home/ubuntu/moz-solidaria -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" \) | wc -l
echo ""
echo "Exemplos de imagens encontradas:"
find /home/ubuntu/moz-solidaria -type f -name "*.jpeg" | head -10
echo ""

# 4. Ver configuração atual do Nginx
echo -e "${BLUE}🌐 4. CONFIGURAÇÃO ATUAL DO NGINX${NC}"
echo "Arquivos de configuração disponíveis:"
ls -la /etc/nginx/sites-available/
echo ""
echo "Configuração ativa:"
if [ -f /etc/nginx/sites-enabled/mozsolidaria ]; then
    cat /etc/nginx/sites-enabled/mozsolidaria
elif [ -f /etc/nginx/sites-available/mozsolidaria ]; then
    cat /etc/nginx/sites-available/mozsolidaria
elif [ -f /etc/nginx/sites-enabled/default ]; then
    cat /etc/nginx/sites-enabled/default
else
    echo "Nenhuma configuração encontrada!"
fi
echo ""

# 5. Testar configuração do Nginx
echo -e "${BLUE}✅ 5. TESTE DE CONFIGURAÇÃO NGINX${NC}"
nginx -t
echo ""

# 6. Status do Gunicorn
echo -e "${BLUE}🐍 6. STATUS DO GUNICORN${NC}"
systemctl status gunicorn --no-pager | head -20
echo ""

# 7. Últimos erros do Nginx
echo -e "${BLUE}📋 7. ÚLTIMOS ERROS DO NGINX${NC}"
echo "Erros gerais:"
tail -30 /var/log/nginx/error.log
echo ""
if [ -f /var/log/nginx/mozsolidaria_error.log ]; then
    echo "Erros específicos do mozsolidaria:"
    tail -30 /var/log/nginx/mozsolidaria_error.log
fi
echo ""

# 8. Verificar permissões
echo -e "${BLUE}🔐 8. PERMISSÕES${NC}"
ls -ld /home/ubuntu/moz-solidaria/
ls -ld /home/ubuntu/moz-solidaria/dist/
ls -ld /home/ubuntu/moz-solidaria/backend/media/ 2>/dev/null || echo "Diretório media não existe em backend/"
echo ""

echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DIAGNÓSTICO CONCLUÍDO${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""

# PROPOSTA DE CORREÇÃO
echo -e "${YELLOW}🔧 PROPOSTA DE CORREÇÃO:${NC}"
echo ""
echo "Baseado no diagnóstico, será criada configuração Nginx correta."
echo "Pressione ENTER para continuar com a correção ou Ctrl+C para cancelar..."
read

# Criar configuração correta do Nginx
echo -e "${BLUE}📝 Criando configuração do Nginx...${NC}"

# Backup da configuração atual
mkdir -p /root/backups/nginx
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -f /etc/nginx/sites-available/mozsolidaria ]; then
    cp /etc/nginx/sites-available/mozsolidaria "/root/backups/nginx/mozsolidaria_$TIMESTAMP"
    echo "Backup criado: /root/backups/nginx/mozsolidaria_$TIMESTAMP"
fi

# Descobrir onde está o MEDIA_ROOT do Django
MEDIA_ROOT=$(grep "MEDIA_ROOT" /home/ubuntu/moz-solidaria/backend/mozsolidaria/settings.py | grep -oP "=\s*['\"]?\K[^'\"]+(?=['\"]?)" | head -1)
if [ -z "$MEDIA_ROOT" ]; then
    MEDIA_ROOT="/home/ubuntu/moz-solidaria/backend/media"
    echo "MEDIA_ROOT não encontrado, usando padrão: $MEDIA_ROOT"
else
    echo "MEDIA_ROOT encontrado: $MEDIA_ROOT"
fi

# Criar diretórios necessários
mkdir -p "$MEDIA_ROOT/blog_images"
mkdir -p "$MEDIA_ROOT/uploads"
mkdir -p /home/ubuntu/moz-solidaria/dist
chown -R www-data:www-data "$MEDIA_ROOT"
chmod -R 755 "$MEDIA_ROOT"

cat > /etc/nginx/sites-available/mozsolidaria << 'NGINXCONF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name mozsolidaria.org www.mozsolidaria.org;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name mozsolidaria.org www.mozsolidaria.org;

    # SSL Configuration
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

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Frontend - Servir dist do projeto
    root /home/ubuntu/moz-solidaria/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webmanifest)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Media files - Servir do Django media root
    location /media/ {
        alias MEDIA_ROOT_PLACEHOLDER/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
        
        # Adicionar CORS se necessário
        add_header Access-Control-Allow-Origin *;
        
        # Fallback para imagem placeholder se não encontrar
        try_files $uri @missing_media;
    }
    
    location @missing_media {
        return 302 https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=800&auto=format&fit=crop;
    }

    # Static files do Django
    location /static/ {
        alias /home/ubuntu/moz-solidaria/backend/static/;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API - Proxy para Gunicorn
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logs
    access_log /var/log/nginx/mozsolidaria_access.log;
    error_log /var/log/nginx/mozsolidaria_error.log;
}
NGINXCONF

# Substituir placeholder com MEDIA_ROOT real
sed -i "s|MEDIA_ROOT_PLACEHOLDER|$MEDIA_ROOT|g" /etc/nginx/sites-available/mozsolidaria

echo -e "${GREEN}✅ Configuração criada${NC}"
echo ""

# Habilitar site
ln -sf /etc/nginx/sites-available/mozsolidaria /etc/nginx/sites-enabled/mozsolidaria

# Testar configuração
echo -e "${BLUE}🧪 Testando configuração...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Configuração válida!${NC}"
    echo ""
    echo -e "${BLUE}🔄 Recarregando Nginx...${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recarregado!${NC}"
else
    echo -e "${RED}❌ Erro na configuração. Restaurando backup...${NC}"
    if [ -f "/root/backups/nginx/mozsolidaria_$TIMESTAMP" ]; then
        cp "/root/backups/nginx/mozsolidaria_$TIMESTAMP" /etc/nginx/sites-available/mozsolidaria
    fi
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}✅ CORREÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}📋 Verificações:${NC}"
echo "  1. Site: curl -I https://mozsolidaria.org"
echo "  2. Media: curl -I https://mozsolidaria.org/media/blog_images/"
echo "  3. Logs: tail -f /var/log/nginx/mozsolidaria_error.log"
echo ""
echo -e "${YELLOW}🔍 Para ver logs em tempo real:${NC}"
echo "  tail -f /var/log/nginx/mozsolidaria_error.log"
echo ""
'@

# Salvar script temporário localmente
$SCRIPT | Out-File -FilePath "temp_fix_nginx.sh" -Encoding UTF8 -NoNewline

Write-Host "📤 Fazendo upload do script de diagnóstico..." -ForegroundColor Yellow
scp temp_fix_nginx.sh "${SERVER}:/root/"

Write-Host "🔧 Executando diagnóstico e correção no servidor..." -ForegroundColor Yellow
Write-Host ""

# Executar script no servidor de forma interativa
ssh -t $SERVER "chmod +x /root/temp_fix_nginx.sh && /root/temp_fix_nginx.sh"

# Limpar arquivo temporário
Remove-Item temp_fix_nginx.sh -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Script executado!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Teste o site agora: https://mozsolidaria.org" -ForegroundColor Cyan
Write-Host "🔍 Para monitorar logs: ssh $SERVER 'tail -f /var/log/nginx/mozsolidaria_error.log'" -ForegroundColor Yellow
