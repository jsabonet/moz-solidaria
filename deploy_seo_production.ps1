# 🚀 DEPLOY SEO COMPLETO PARA PRODUÇÃO (PowerShell)
# Script para implementar todas as configurações SEO no servidor Windows

Write-Host "🚀 INICIANDO DEPLOY SEO PARA PRODUÇÃO..." -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

function Write-Step {
    param($Message)
    Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar se está no diretório correto
if (-not (Test-Path "manage.py")) {
    Write-Error "Execute este script no diretório raiz do projeto (onde está o manage.py)"
    exit 1
}

# ETAPA 1: BACKEND - Configurações Django
Write-Step "1. Configurando Backend Django..."

# 1.1 Verificar se sitemaps.py foi criado
if (-not (Test-Path "backend/core/sitemaps.py")) {
    Write-Error "Arquivo backend/core/sitemaps.py não encontrado!"
    exit 1
}

# 1.2 Aplicar migrações
Write-Step "1.1 Aplicando migrações Django..."
Set-Location backend
python manage.py makemigrations
python manage.py migrate
Write-Success "Migrações aplicadas"

# 1.3 Coletar arquivos estáticos
Write-Step "1.2 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput
Write-Success "Arquivos estáticos coletados"

Set-Location ..

# ETAPA 2: FRONTEND - Build e Deploy
Write-Step "2. Preparando Frontend..."

# 2.1 Instalar dependências
Write-Step "2.1 Instalando dependências npm..."
npm install
Write-Success "Dependências instaladas"

# 2.2 Build do frontend
Write-Step "2.2 Fazendo build do frontend..."
npm run build
Write-Success "Build do frontend concluído"

# ETAPA 3: Verificações de SEO
Write-Step "3. Executando verificações SEO..."

# 3.1 Verificar robots.txt
Write-Step "3.1 Verificando robots.txt..."
if (Test-Path "public/robots.txt") {
    Write-Host "Conteúdo do robots.txt:"
    Get-Content "public/robots.txt" | Select-Object -First 10
    Write-Success "robots.txt encontrado"
} else {
    Write-Error "robots.txt não encontrado em public/"
}

# 3.2 Verificar estrutura de sitemaps
Write-Step "3.2 Verificando estrutura de sitemaps..."
if ((Test-Path "backend/core/templates/sitemap_index.xml") -and (Test-Path "backend/core/templates/sitemap.xml")) {
    Write-Success "Templates de sitemap encontrados"
} else {
    Write-Error "Templates de sitemap não encontrados"
}

# 3.3 Verificar configuração SEO
Write-Step "3.3 Verificando configuração SEO..."
if (Test-Path "src/config/seo.ts") {
    Write-Success "Configuração SEO encontrada"
} else {
    Write-Error "Arquivo src/config/seo.ts não encontrado"
}

# ETAPA 4: Comandos para o servidor
Write-Step "4. Gerando comandos para servidor..."

$commands = @"

📋 COMANDOS PARA EXECUTAR NO SERVIDOR DE PRODUÇÃO:
=================================================

1️⃣ LINUX/UBUNTU - FAZER PULL DO CÓDIGO:
   cd /var/www/mozsolidaria
   git pull origin main
   
2️⃣ LINUX - ATUALIZAR BACKEND:
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput

3️⃣ LINUX - ATUALIZAR FRONTEND:
   cd /var/www/mozsolidaria
   npm install
   npm run build

4️⃣ LINUX - REINICIAR SERVIÇOS:
   sudo systemctl restart mozsolidaria
   sudo systemctl restart nginx

5️⃣ WINDOWS IIS - COMANDOS:
   # No diretório do projeto:
   git pull origin main
   pip install -r backend/requirements.txt
   python backend/manage.py migrate
   python backend/manage.py collectstatic --noinput
   npm install
   npm run build
   
   # Reiniciar site no IIS Manager ou:
   iisreset

6️⃣ VERIFICAR SITEMAPS (qualquer OS):
   # Teste manual no navegador:
   https://mozsolidaria.org/sitemap-index.xml
   https://mozsolidaria.org/sitemap-static.xml
   https://mozsolidaria.org/robots.txt

"@

Write-Host $commands -ForegroundColor White

# ETAPA 5: Checklist pós-deploy
$checklist = @"

✅ CHECKLIST PÓS-DEPLOY SEO:
============================

🔍 VERIFICAÇÕES IMEDIATAS:
□ Site carregando: https://mozsolidaria.org
□ Robots.txt: https://mozsolidaria.org/robots.txt
□ Sitemap index: https://mozsolidaria.org/sitemap-index.xml
□ Sitemap estático: https://mozsolidaria.org/sitemap-static.xml
□ Sitemap blog: https://mozsolidaria.org/sitemap-blog.xml
□ Sitemap programas: https://mozsolidaria.org/sitemap-programas.xml

📊 VERIFICAR META TAGS (F12 no navegador):
□ <title> único em cada página
□ <meta name="description"> presente
□ <meta name="keywords"> configurado
□ Open Graph <meta property="og:..."> 
□ <link rel="canonical"> correto

🎯 FERRAMENTAS DE TESTE:
□ Google Search Console (adicionar propriedade)
□ Bing Webmaster Tools (verificar site)
□ Google PageSpeed Insights
□ Lighthouse audit (F12 > Lighthouse)

📱 TESTES MOBILE:
□ Responsividade (F12 > Device Toggle)
□ Velocidade mobile no PageSpeed
□ Core Web Vitals

🚀 CONFIGURAÇÕES AVANÇADAS:
□ Google Analytics 4
□ Google Tag Manager
□ Schema.org markup
□ Social media meta tags

"@

Write-Host $checklist -ForegroundColor Green

Write-Success "Deploy SEO preparado! Execute os comandos acima no servidor."
Write-Host "==================================================" -ForegroundColor Blue
Write-Host "🎉 SCRIPT CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "📖 Consulte GUIA_SEO_COMPLETO.md para instruções detalhadas" -ForegroundColor Yellow

# Pausa para leitura
Write-Host "`nPressione qualquer tecla para continuar..." -ForegroundColor Cyan
Read-Host "Pressione Enter para finalizar"
