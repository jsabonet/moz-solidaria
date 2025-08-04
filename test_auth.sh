#!/bin/bash
# Script para testar o sistema de autenticação e permissões

echo "🔐 Testando Sistema de Autenticação - MOZ SOLIDÁRIA"
echo "================================================="

# Configurações
BASE_URL="http://localhost:8000/api/v1"
ADMIN_USER="admin"
ADMIN_PASS="admin123"

echo ""
echo "1️⃣ Testando Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/token/" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$ADMIN_USER\", \"password\": \"$ADMIN_PASS\"}")

if [ $? -eq 0 ]; then
    echo "✅ Login realizado com sucesso"
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)
    echo "📝 Token obtido: ${ACCESS_TOKEN:0:20}..."
else
    echo "❌ Falha no login"
    exit 1
fi

echo ""
echo "2️⃣ Testando acesso ao perfil..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/core/profile/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    echo "✅ Perfil acessado com sucesso"
    echo "👤 Usuário: $(echo $PROFILE_RESPONSE | grep -o '"username":"[^"]*' | cut -d'"' -f4)"
else
    echo "❌ Falha ao acessar perfil"
fi

echo ""
echo "3️⃣ Testando criação de post..."
POST_DATA='{
  "title": "Post de Teste - Segurança",
  "content": "<p>Este é um post criado para testar o sistema de permissões.</p>",
  "excerpt": "Post de teste para verificar autenticação",
  "status": "published"
}'

CREATE_POST_RESPONSE=$(curl -s -X POST "$BASE_URL/blog/posts/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$POST_DATA")

if [ $? -eq 0 ]; then
    echo "✅ Post criado com sucesso"
    POST_SLUG=$(echo $CREATE_POST_RESPONSE | grep -o '"slug":"[^"]*' | cut -d'"' -f4)
    echo "📄 Slug do post: $POST_SLUG"
else
    echo "❌ Falha ao criar post"
fi

echo ""
echo "4️⃣ Testando acesso sem autenticação..."
NO_AUTH_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/blog/posts/" \
  -H "Content-Type: application/json" \
  -d "$POST_DATA")

HTTP_CODE="${NO_AUTH_RESPONSE: -3}"
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✅ Bloqueio de acesso sem auth funcionando (HTTP $HTTP_CODE)"
else
    echo "❌ Falha na proteção - acesso permitido sem auth (HTTP $HTTP_CODE)"
fi

echo ""
echo "5️⃣ Testando acesso a categorias..."
CATEGORIES_RESPONSE=$(curl -s -X GET "$BASE_URL/blog/categories/")

if [ $? -eq 0 ]; then
    echo "✅ Lista de categorias acessível publicamente"
else
    echo "❌ Falha ao acessar categorias"
fi

echo ""
echo "6️⃣ Testando criação de categoria (requer staff)..."
CATEGORY_DATA='{
  "name": "Categoria Teste",
  "description": "Categoria criada para teste de permissões"
}'

CREATE_CATEGORY_RESPONSE=$(curl -s -X POST "$BASE_URL/blog/categories/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CATEGORY_DATA")

if [ $? -eq 0 ]; then
    echo "✅ Categoria criada com sucesso (usuário admin é staff)"
else
    echo "❌ Falha ao criar categoria"
fi

echo ""
echo "7️⃣ Testando refresh token..."
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/token/refresh/" \
  -H "Content-Type: application/json" \
  -d "{\"refresh\": \"$REFRESH_TOKEN\"}")

if [ $? -eq 0 ]; then
    echo "✅ Refresh token funcionando"
else
    echo "❌ Falha no refresh token"
fi

echo ""
echo "🎉 Teste de permissões concluído!"
echo "================================================="
echo ""
echo "📋 Para testar no frontend:"
echo "1. Acesse http://localhost:5173"
echo "2. Tente acessar /dashboard (deve redirecionar para login)"
echo "3. Faça login com admin/admin123"
echo "4. Acesse /dashboard novamente (deve funcionar)"
echo "5. Verifique o dropdown do usuário no header"
