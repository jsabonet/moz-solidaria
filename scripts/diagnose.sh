#!/bin/bash

# Script de Diagnóstico - Identificar problemas com cache busting
echo "🔍 DIAGNÓSTICO COMPLETO - Cache Busting"
echo "======================================"

# 1. Verificar estrutura de arquivos
echo "📁 1. ESTRUTURA DE ARQUIVOS:"
echo "Diretório atual: $(pwd)"
echo "Arquivos dist:"
if [ -d "dist" ]; then
    ls -la dist/ | head -10
    echo "Build info existe: $([ -f "dist/build-info.json" ] && echo "✅ SIM" || echo "❌ NÃO")"
    if [ -f "dist/build-info.json" ]; then
        echo "Conteúdo build-info.json:"
        cat dist/build-info.json
    fi
else
    echo "❌ Diretório dist não encontrado!"
fi

echo ""
echo "📝 2. CONFIGURAÇÃO NGINX:"
NGINX_CONFIG="/etc/nginx/sites-available/mozsolidaria"
if [ -f "$NGINX_CONFIG" ]; then
    echo "✅ Config nginx encontrada: $NGINX_CONFIG"
    echo "Root configurado:"
    grep -n "root " "$NGINX_CONFIG" || echo "Root não encontrado"
    echo "Server name:"
    grep -n "server_name" "$NGINX_CONFIG" || echo "Server name não encontrado"
else
    echo "❌ Config nginx não encontrada em $NGINX_CONFIG"
    echo "Sites disponíveis:"
    ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "Diretório não acessível"
fi

echo ""
echo "🔗 3. SITES HABILITADOS:"
if [ -d "/etc/nginx/sites-enabled" ]; then
    ls -la /etc/nginx/sites-enabled/
else
    echo "❌ Diretório sites-enabled não encontrado"
fi

echo ""
echo "🌐 4. TESTE DE CONECTIVIDADE:"
echo "Testando localhost:"
curl -s -I http://localhost/ | head -3 || echo "❌ Localhost não responde"

echo "Testando 127.0.0.1:"
curl -s -I http://127.0.0.1/ | head -3 || echo "❌ 127.0.0.1 não responde"

echo "Testando API:"
curl -s -I http://127.0.0.1:8000/api/v1/health/ | head -3 || echo "❌ API não responde"

echo ""
echo "🔧 5. PROCESSOS:"
echo "Nginx:"
pgrep -l nginx || echo "❌ Nginx não encontrado"

echo "Gunicorn:"
pgrep -l -f gunicorn || echo "❌ Gunicorn não encontrado"

echo ""
echo "📋 6. LOGS RECENTES:"
echo "Nginx error log (últimas 5 linhas):"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Log não acessível"

echo "Nginx access log (últimas 3 linhas):"
sudo tail -3 /var/log/nginx/access.log 2>/dev/null || echo "Log não acessível"

echo ""
echo "🎯 7. POSSÍVEIS PROBLEMAS IDENTIFICADOS:"

# Verificar se dist está no lugar certo
if [ ! -f "/var/www/html/build-info.json" ] && [ ! -f "/var/www/mozsolidaria/build-info.json" ]; then
    echo "❌ build-info.json não está no diretório web"
fi

# Verificar se nginx config aponta para o lugar certo
if [ -f "$NGINX_CONFIG" ]; then
    WEB_ROOT=$(grep "root " "$NGINX_CONFIG" | head -1 | awk '{print $2}' | sed 's/;//')
    if [ -n "$WEB_ROOT" ] && [ ! -f "$WEB_ROOT/build-info.json" ]; then
        echo "❌ build-info.json não está em $WEB_ROOT"
        echo "💡 Você precisa copiar dist/ para $WEB_ROOT"
    fi
fi

echo ""
echo "✅ DIAGNÓSTICO CONCLUÍDO"
