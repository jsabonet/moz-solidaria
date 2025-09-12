#!/bin/bash

# Script de Deploy com Cache Busting Completo
# Executa no servidor de produção para garantir que usuários recebam a versão mais recente

set -e

echo "🚀 Iniciando deploy com cache busting..."

# Auto-detectar diretório do projeto
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == *"moz-solidaria"* ]]; then
    PROJECT_DIR="$CURRENT_DIR"
else
    # Fallback para estrutura padrão
    PROJECT_DIR="/var/www/mozsolidaria/frontend"
    if [ ! -d "$PROJECT_DIR" ]; then
        PROJECT_DIR="/home/ubuntu/moz-solidaria"
    fi
fi

FRONTEND_DIR="$PROJECT_DIR"
BACKEND_DIR="$PROJECT_DIR/backend"
NGINX_CONFIG="/etc/nginx/sites-available/mozsolidaria"

echo "📁 Diretório do projeto: $PROJECT_DIR"

# Backup da versão atual
BACKUP_DIR="/var/backups/mozsolidaria/$(date +%Y%m%d_%H%M%S)"
echo "📦 Criando backup em $BACKUP_DIR..."
sudo mkdir -p "$BACKUP_DIR"
sudo cp -r "$FRONTEND_DIR/dist" "$BACKUP_DIR/dist_backup" 2>/dev/null || echo "Nenhum dist anterior encontrado"

# Navegar para o diretório do projeto
cd "$FRONTEND_DIR"

# Verificar se estamos em um repositório git
if [ ! -d ".git" ]; then
    echo "⚠️  Não é um repositório git, pulando atualização de código"
else
    # Garantir que temos a versão mais recente do código
    echo "📥 Atualizando código..."
    git fetch origin
    git reset --hard origin/main
fi

# Instalar/atualizar dependências se necessário
if [ -f "package-lock.json" ]; then
    echo "📦 Verificando dependências..."
    npm ci --silent
fi

# Build com cache busting
echo "🔨 Executando build com cache busting..."
npm run build:production

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Erro: Build falhou ou arquivos não foram gerados"
    exit 1
fi

# Atualizar nginx.conf se necessário
echo "🔧 Verificando configuração do Nginx..."
if [ -f "nginx.conf" ]; then
    # Verificar se nginx config existe
    if [ -f "$NGINX_CONFIG" ]; then
        if ! sudo diff -q "nginx.conf" "$NGINX_CONFIG" > /dev/null 2>&1; then
            echo "📝 Atualizando configuração do Nginx..."
            sudo cp "nginx.conf" "$NGINX_CONFIG"
            sudo nginx -t && sudo systemctl reload nginx
        else
            echo "✅ Configuração do Nginx já está atualizada"
        fi
    else
        echo "📝 Criando configuração do Nginx..."
        sudo cp "nginx.conf" "$NGINX_CONFIG"
        sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/" 2>/dev/null || true
        sudo nginx -t && sudo systemctl reload nginx
    fi
else
    echo "⚠️  Arquivo nginx.conf não encontrado, pulando configuração"
fi

# Limpar cache do Nginx (se configurado)
if sudo nginx -V 2>&1 | grep -q "http_proxy_module"; then
    echo "🧹 Limpando cache do Nginx..."
    sudo find /var/cache/nginx -type f -delete 2>/dev/null || echo "Cache do Nginx não encontrado"
fi

# Restart do backend se necessário
cd "$BACKEND_DIR"
echo "🔄 Verificando backend..."

# Verificar se gunicorn está rodando
if ! pgrep -f "gunicorn.*moz_solidaria_api" > /dev/null; then
    echo "🚀 Iniciando Gunicorn..."
    nohup gunicorn moz_solidaria_api.wsgi:application --bind 127.0.0.1:8000 --workers 3 > ../logs/gunicorn.log 2>&1 &
    sleep 3
fi

# Teste de saúde da API
echo "🏥 Testando saúde da API..."
if curl -f -s "http://127.0.0.1:8000/api/v1/health/" > /dev/null; then
    echo "✅ API está respondendo"
else
    echo "⚠️  API não está respondendo - verificar logs"
fi

# Forçar atualização de cache em navegadores (header de resposta)
cd "$FRONTEND_DIR"
echo "💾 Configurando headers anti-cache..."

# Adicionar timestamp ao index.html como comentário para forçar atualização
if [ -f "dist/index.html" ]; then
    TIMESTAMP=$(date +%s)
    sed -i "1i<!-- Build: $TIMESTAMP -->" "dist/index.html"
fi

# Verificar se build-info.json foi gerado
if [ -f "dist/build-info.json" ]; then
    BUILD_ID=$(grep -o '"buildId":"[^"]*"' "dist/build-info.json" | cut -d'"' -f4)
    echo "✅ Deploy concluído! Build ID: $BUILD_ID"
else
    echo "⚠️  Arquivo build-info.json não encontrado"
fi

# Limpar cache do Redis (se usado para cache da aplicação)
if command -v redis-cli &> /dev/null; then
    echo "🗑️  Limpando cache do Redis..."
    redis-cli FLUSHDB > /dev/null 2>&1 || echo "Redis não está configurado"
fi

echo ""
echo "🎉 Deploy com cache busting concluído com sucesso!"
echo ""
echo "📋 Próximos passos para usuários:"
echo "   1. Usuários podem receber notificação automática de atualização"
echo "   2. Para forçar atualização manual: Ctrl+F5 ou Cmd+Shift+R"
echo "   3. Limpar dados do navegador se necessário"
echo ""
echo "🔍 Verificar deployment:"
echo "   - Frontend: https://mozsolidaria.org"
echo "   - API Health: https://mozsolidaria.org/api/v1/health/"
echo "   - Build Info: https://mozsolidaria.org/build-info.json"
echo ""

# Opcional: Notificar webhook/Slack sobre deploy
# if [ -n "$SLACK_WEBHOOK_URL" ]; then
#     curl -X POST -H 'Content-type: application/json' \
#         --data "{\"text\":\"🚀 Deploy realizado com sucesso! Build ID: $BUILD_ID\"}" \
#         "$SLACK_WEBHOOK_URL"
# fi
