#!/bin/bash

# Script de Correção Urgente - Cache Busting
echo "🚨 CORREÇÃO URGENTE - Cache Busting"
echo "=================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "dist" ]; then
    echo "❌ Execute no diretório do projeto com dist/ presente"
    exit 1
fi

# 1. Identificar onde o nginx espera os arquivos
NGINX_CONFIG="/etc/nginx/sites-available/mozsolidaria"
if [ -f "$NGINX_CONFIG" ]; then
    WEB_ROOT=$(grep "root " "$NGINX_CONFIG" | head -1 | awk '{print $2}' | sed 's/;//')
    echo "📁 Web root encontrado: $WEB_ROOT"
else
    # Tentar locais padrão
    if [ -d "/var/www/html" ]; then
        WEB_ROOT="/var/www/html"
    elif [ -d "/var/www/mozsolidaria" ]; then
        WEB_ROOT="/var/www/mozsolidaria"
    else
        WEB_ROOT="/var/www/html"
        echo "📁 Usando web root padrão: $WEB_ROOT"
    fi
fi

# 2. Criar diretório se não existir
echo "📦 Preparando diretório web: $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"

# 3. Fazer backup se existir conteúdo anterior
if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT 2>/dev/null)" ]; then
    BACKUP_DIR="/tmp/web_backup_$(date +%Y%m%d_%H%M%S)"
    echo "💾 Fazendo backup em: $BACKUP_DIR"
    sudo cp -r "$WEB_ROOT" "$BACKUP_DIR" 2>/dev/null || true
fi

# 4. Copiar arquivos dist para web root
echo "📋 Copiando arquivos dist/ para $WEB_ROOT..."
sudo cp -r dist/* "$WEB_ROOT/" 2>/dev/null || {
    echo "❌ Erro ao copiar arquivos. Tentando com rsync..."
    sudo rsync -av dist/ "$WEB_ROOT/" || {
        echo "❌ Falha ao copiar arquivos"
        exit 1
    }
}

# 5. Definir permissões corretas
echo "🔒 Definindo permissões..."
sudo chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || sudo chown -R nginx:nginx "$WEB_ROOT" 2>/dev/null || true
sudo chmod -R 755 "$WEB_ROOT"

# 6. Verificar se build-info.json está acessível
if [ -f "$WEB_ROOT/build-info.json" ]; then
    echo "✅ build-info.json copiado com sucesso"
    echo "📊 Conteúdo:"
    cat "$WEB_ROOT/build-info.json"
else
    echo "❌ build-info.json não foi copiado corretamente"
    exit 1
fi

# 7. Testar acesso local
echo "🧪 Testando acesso local..."
if curl -s http://localhost/build-info.json > /dev/null; then
    echo "✅ build-info.json acessível via localhost"
else
    echo "❌ build-info.json NÃO acessível via localhost"
    
    # Tentar diagnosticar o problema
    echo "🔍 Diagnosticando nginx..."
    sudo nginx -t
    
    # Verificar se o site está habilitado
    if [ ! -L "/etc/nginx/sites-enabled/mozsolidaria" ]; then
        echo "🔗 Habilitando site..."
        sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/mozsolidaria" 2>/dev/null || true
    fi
    
    # Recarregar nginx
    echo "♻️  Recarregando nginx..."
    sudo systemctl reload nginx
    
    # Testar novamente
    sleep 2
    if curl -s http://localhost/build-info.json > /dev/null; then
        echo "✅ build-info.json agora está acessível"
    else
        echo "❌ Ainda há problemas com nginx"
    fi
fi

# 8. Verificar arquivos com hash
echo "🔍 Verificando arquivos com hash:"
find "$WEB_ROOT" -name "*-[a-f0-9]*.js" -o -name "*-[a-f0-9]*.css" | wc -l | xargs echo "Arquivos com hash:"

# 9. Restart gunicorn se necessário
if ! curl -s http://127.0.0.1:8000/api/v1/health/ > /dev/null; then
    echo "🔄 Reiniciando API..."
    
    # Parar gunicorn existente
    sudo pkill -f "gunicorn.*moz_solidaria_api" 2>/dev/null || true
    sleep 2
    
    # Iniciar novo gunicorn
    if [ -d "backend" ]; then
        cd backend
        nohup gunicorn moz_solidaria_api.wsgi:application --bind 127.0.0.1:8000 --workers 3 > ../logs/gunicorn.log 2>&1 &
        cd ..
        sleep 3
        
        if curl -s http://127.0.0.1:8000/api/v1/health/ > /dev/null; then
            echo "✅ API reiniciada com sucesso"
        else
            echo "❌ Problema ao reiniciar API"
        fi
    fi
fi

# 10. Limpar cache do navegador (force headers)
echo "🧹 Forçando limpeza de cache..."
# Adicionar cabeçalho especial ao index.html para forçar reload
if [ -f "$WEB_ROOT/index.html" ]; then
    TIMESTAMP=$(date +%s)
    sudo sed -i "1i<!-- FORCE-RELOAD: $TIMESTAMP -->" "$WEB_ROOT/index.html"
    echo "✅ Cabeçalho de força-reload adicionado"
fi

echo ""
echo "🎉 CORREÇÃO APLICADA!"
echo ""
echo "🔍 TESTES FINAIS:"
echo "Build info: curl http://localhost/build-info.json"
echo "Site: https://mozsolidaria.org"
echo "API: https://mozsolidaria.org/api/v1/health/"
echo ""
echo "💡 Os usuários devem ver a nova versão em poucos minutos"
echo "   ou usar Ctrl+F5 para forçar atualização"
