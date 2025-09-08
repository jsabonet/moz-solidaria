#!/bin/bash

# 🚀 DEPLOY SEO COMPLETO PARA PRODUÇÃO
# Script para implementar todas as configurações SEO no servidor

echo "🚀 INICIANDO DEPLOY SEO PARA PRODUÇÃO..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está no diretório correto
if [[ ! -f "manage.py" ]]; then
    log_error "Execute este script no diretório raiz do projeto (onde está o manage.py)"
    exit 1
fi

# ETAPA 1: BACKEND - Configurações Django
log_step "1. Configurando Backend Django..."

# 1.1 Verificar se sitemaps.py foi criado
if [[ ! -f "backend/core/sitemaps.py" ]]; then
    log_error "Arquivo backend/core/sitemaps.py não encontrado!"
    exit 1
fi

# 1.2 Aplicar migrações (se necessário)
log_step "1.1 Aplicando migrações Django..."
cd backend
python manage.py makemigrations
python manage.py migrate
log_success "Migrações aplicadas"

# 1.3 Coletar arquivos estáticos
log_step "1.2 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput
log_success "Arquivos estáticos coletados"

# 1.4 Testar URLs dos sitemaps
log_step "1.3 Testando configurações de sitemap..."
python manage.py shell << EOF
from django.urls import reverse
from django.test import Client
from django.conf import settings

client = Client()
print("Testando URLs de sitemap:")

# Testar sitemap index
try:
    response = client.get('/sitemap-index.xml')
    print(f"Sitemap Index: Status {response.status_code}")
    if response.status_code == 200:
        print("✅ Sitemap Index OK")
    else:
        print("❌ Erro no Sitemap Index")
except Exception as e:
    print(f"❌ Erro: {e}")

# Testar sitemaps específicos
sitemaps = ['static', 'blog', 'programas']
for sitemap in sitemaps:
    try:
        response = client.get(f'/sitemap-{sitemap}.xml')
        print(f"Sitemap {sitemap}: Status {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Sitemap {sitemap} OK")
        else:
            print(f"❌ Erro no Sitemap {sitemap}")
    except Exception as e:
        print(f"❌ Erro {sitemap}: {e}")
EOF

cd ..
log_success "Configurações Django testadas"

# ETAPA 2: FRONTEND - Build e Deploy
log_step "2. Preparando Frontend..."

# 2.1 Instalar dependências
log_step "2.1 Instalando dependências npm..."
npm install
log_success "Dependências instaladas"

# 2.2 Build do frontend
log_step "2.2 Fazendo build do frontend..."
npm run build
log_success "Build do frontend concluído"

# ETAPA 3: NGINX - Configurações de servidor
log_step "3. Configurando Nginx..."

# 3.1 Criar configuração SEO para Nginx
cat > nginx_seo.conf << 'EOL'
# Configurações SEO para Nginx

# Gzip compression para melhor performance
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json
    image/svg+xml;

# Headers de segurança e SEO
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";

# Cache para arquivos estáticos
location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
}

# Robots.txt
location = /robots.txt {
    alias /var/www/mozsolidaria/public/robots.txt;
    add_header Content-Type text/plain;
}

# Sitemaps XML
location ~ ^/sitemap.*\.xml$ {
    proxy_pass http://localhost:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    add_header Content-Type application/xml;
}

# Redirecionamento HTTPS
if ($scheme != "https") {
    return 301 https://$host$request_uri;
}
EOL

log_success "Configuração Nginx criada: nginx_seo.conf"

# ETAPA 4: Verificações de SEO
log_step "4. Executando verificações SEO..."

# 4.1 Verificar robots.txt
log_step "4.1 Verificando robots.txt..."
if [[ -f "public/robots.txt" ]]; then
    echo "Conteúdo do robots.txt:"
    head -10 public/robots.txt
    log_success "robots.txt encontrado"
else
    log_error "robots.txt não encontrado em public/"
fi

# 4.2 Verificar estrutura de sitemaps
log_step "4.2 Verificando estrutura de sitemaps..."
if [[ -f "backend/core/templates/sitemap_index.xml" ]] && [[ -f "backend/core/templates/sitemap.xml" ]]; then
    log_success "Templates de sitemap encontrados"
else
    log_error "Templates de sitemap não encontrados"
fi

# 4.3 Verificar configuração SEO
log_step "4.3 Verificando configuração SEO..."
if [[ -f "src/config/seo.ts" ]]; then
    log_success "Configuração SEO encontrada"
else
    log_error "Arquivo src/config/seo.ts não encontrado"
fi

# ETAPA 5: Testes de Performance
log_step "5. Executando testes básicos..."

# 5.1 Verificar tamanho do build
BUILD_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1 || echo "N/A")
log_step "5.1 Tamanho do build: $BUILD_SIZE"

# 5.2 Verificar se há arquivos grandes
log_step "5.2 Verificando arquivos grandes no build..."
find dist/ -size +1M -type f 2>/dev/null | head -5 || echo "Nenhum arquivo grande encontrado"

# ETAPA 6: Comandos para o servidor de produção
log_step "6. Comandos para servidor de produção..."

cat << 'EOL'

📋 COMANDOS PARA EXECUTAR NO SERVIDOR DE PRODUÇÃO:
=================================================

1️⃣ FAZER PULL DO CÓDIGO ATUALIZADO:
   cd /var/www/mozsolidaria
   git pull origin main

2️⃣ ATUALIZAR BACKEND:
   cd backend
   source venv/bin/activate  # ou conda activate mozsolidaria
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput

3️⃣ ATUALIZAR FRONTEND:
   cd /var/www/mozsolidaria
   npm install
   npm run build

4️⃣ REINICIAR SERVIÇOS:
   sudo systemctl restart mozsolidaria
   sudo systemctl restart nginx

5️⃣ VERIFICAR SITEMAPS (após reiniciar):
   curl -I https://mozsolidaria.org/sitemap-index.xml
   curl -I https://mozsolidaria.org/sitemap-static.xml
   curl -I https://mozsolidaria.org/robots.txt

6️⃣ APLICAR CONFIGURAÇÃO NGINX SEO:
   sudo cp nginx_seo.conf /etc/nginx/sites-available/mozsolidaria-seo
   sudo nginx -t
   sudo systemctl reload nginx

EOL

# ETAPA 7: Checklist pós-deploy
cat << 'EOL'

✅ CHECKLIST PÓS-DEPLOY:
========================

🔍 VERIFICAÇÕES IMEDIATAS:
□ Site carregando normalmente: https://mozsolidaria.org
□ Robots.txt acessível: https://mozsolidaria.org/robots.txt
□ Sitemap index: https://mozsolidaria.org/sitemap-index.xml
□ Sitemap estático: https://mozsolidaria.org/sitemap-static.xml
□ Sitemap blog: https://mozsolidaria.org/sitemap-blog.xml
□ Sitemap programas: https://mozsolidaria.org/sitemap-programas.xml

📊 META TAGS (verificar no navegador):
□ Página inicial tem meta description
□ Páginas têm titles únicos
□ Open Graph tags presentes
□ Meta robots configurado

🚀 PRÓXIMOS PASSOS:
□ Configurar Google Search Console
□ Submeter sitemaps ao Google
□ Configurar Bing Webmaster Tools
□ Instalar Google Analytics 4
□ Configurar monitoramento de performance

📱 TESTES RECOMENDADOS:
□ Teste mobile responsiveness
□ Lighthouse audit
□ PageSpeed Insights
□ Verificação de Core Web Vitals

EOL

log_success "Deploy SEO preparado! Execute os comandos acima no servidor."
echo "=================================================="
echo "🎉 SCRIPT CONCLUÍDO COM SUCESSO!"
echo "📖 Consulte GUIA_SEO_COMPLETO.md para instruções detalhadas"
