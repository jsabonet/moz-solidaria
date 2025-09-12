#!/bin/bash

# Script de Deploy Simples - Para executar no diretório do projeto
# Uso: ./scripts/deploy-simple.sh

set -e

echo "🚀 Deploy simples com cache busting..."
echo "📁 Diretório atual: $(pwd)"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
    echo "❌ Execute este script no diretório raiz do projeto (onde está package.json)"
    exit 1
fi

# Verificar se dist existe e tem arquivos
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Build encontrado em dist/"
    
    # Mostrar informações do build atual
    if [ -f "dist/build-info.json" ]; then
        echo "📊 Informações do build atual:"
        grep -E '"(version|buildId|buildTime)"' dist/build-info.json || echo "Build info disponível"
    fi
    
    # Verificar arquivos com hash
    HASHED_FILES=$(find dist -name "*-[a-f0-9]*.js" -o -name "*-[a-f0-9]*.css" | wc -l)
    echo "📦 Arquivos com hash encontrados: $HASHED_FILES"
    
else
    echo "❌ Diretório dist não encontrado ou vazio"
    echo "Execute primeiro: npm run build:production"
    exit 1
fi

# Atualizar nginx.conf se existir
if [ -f "nginx.conf" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/mozsolidaria"
    
    if [ -f "$NGINX_CONFIG" ]; then
        if ! sudo diff -q "nginx.conf" "$NGINX_CONFIG" > /dev/null 2>&1; then
            echo "📝 Atualizando configuração do Nginx..."
            sudo cp "nginx.conf" "$NGINX_CONFIG"
            
            # Testar configuração
            echo "🧪 Testando configuração do Nginx..."
            if sudo nginx -t; then
                echo "♻️  Recarregando Nginx..."
                sudo systemctl reload nginx
                echo "✅ Nginx atualizado e recarregado"
            else
                echo "❌ Erro na configuração do Nginx - não recarregado"
                exit 1
            fi
        else
            echo "✅ Configuração do Nginx já está atualizada"
        fi
    else
        echo "📝 Criando nova configuração do Nginx..."
        sudo cp "nginx.conf" "$NGINX_CONFIG"
        sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/" 2>/dev/null || true
        
        if sudo nginx -t; then
            sudo systemctl reload nginx
            echo "✅ Nova configuração do Nginx criada"
        else
            echo "❌ Erro na nova configuração do Nginx"
            exit 1
        fi
    fi
fi

# Verificar se gunicorn está rodando (backend)
if [ -d "backend" ]; then
    echo "🔍 Verificando backend..."
    
    if pgrep -f "gunicorn.*moz_solidaria_api" > /dev/null; then
        echo "✅ Gunicorn está rodando"
        
        # Teste simples da API
        if curl -f -s "http://127.0.0.1:8000/api/v1/health/" > /dev/null 2>&1; then
            echo "✅ API está respondendo"
        else
            echo "⚠️  API não está respondendo - pode precisar reiniciar"
        fi
    else
        echo "⚠️  Gunicorn não está rodando"
        echo "Para iniciar: cd backend && nohup gunicorn moz_solidaria_api.wsgi:application --bind 127.0.0.1:8000 --workers 3 > ../logs/gunicorn.log 2>&1 &"
    fi
fi

# Limpar cache do Redis se disponível
if command -v redis-cli &> /dev/null; then
    echo "🗑️  Limpando cache do Redis..."
    redis-cli FLUSHDB > /dev/null 2>&1 && echo "✅ Cache Redis limpo" || echo "⚠️  Redis não disponível"
fi

# Mostrar URLs de verificação
echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "🔍 Verificações recomendadas:"
echo "   🌐 Frontend: https://mozsolidaria.org"
echo "   📊 Build Info: https://mozsolidaria.org/build-info.json"
echo "   🔧 API Health: https://mozsolidaria.org/api/v1/health/"
echo ""
echo "💡 Para forçar atualização nos usuários:"
echo "   - Usuários receberão notificação automática em até 5 minutos"
echo "   - Ou podem usar Ctrl+F5 / Cmd+Shift+R para atualização manual"
echo ""

# Verificar tamanho total do dist
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "📦 Tamanho total do dist: $DIST_SIZE"
fi

echo "✅ Deploy finalizado com sucesso!"
