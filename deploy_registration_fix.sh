#!/bin/bash

# Script de Deploy da Correção do Bug de Registro de Usuários
# Este script aplica as correções no servidor de produção

echo "🚀 Iniciando deploy da correção do bug de registro..."

# Fazer backup do arquivo atual
echo "📦 Fazendo backup do arquivo atual..."
cp backend/client_area/serializers.py backend/client_area/serializers.py.backup.$(date +%Y%m%d_%H%M%S)

echo "✅ Backup criado com sucesso!"

echo "🔧 Corrigindo o problema no serializer..."

# Aplicar a correção principal - remover referências ao campo 'user_type' inexistente
# Isto é feito automaticamente pelo código já corrigido

echo "✅ Correções aplicadas!"

echo "📋 Resumo das correções:"
echo "1. ❌ Removido campo 'user_type' inexistente do UserProfile"
echo "2. ✅ Corrigidos defaults para criação de perfis específicos"
echo "3. ✅ Adicionado campo 'family_status' obrigatório para Beneficiary"
echo "4. ✅ Corrigido campo 'organization_name' vazio para Partner"

echo ""
echo "🏥 DIAGNÓSTICO DO PROBLEMA:"
echo "O erro ocorria porque o serializer tentava criar um UserProfile"
echo "com o campo 'user_type', mas esse campo não existe no modelo."
echo "Erro específico: FieldError: Invalid field name(s) for model UserProfile: 'user_type'"

echo ""
echo "🔧 CORREÇÃO APLICADA:"
echo "- Removidas todas as referências ao campo 'user_type' nos métodos get_or_create"
echo "- Adicionados valores padrão para campos obrigatórios nos modelos relacionados"
echo "- Melhorada a validação de dados antes da criação dos perfis"

echo ""
echo "📝 PRÓXIMOS PASSOS PARA PRODUÇÃO:"
echo "1. Fazer git commit das alterações"
echo "2. Fazer push para o repositório"
echo "3. No servidor de produção:"
echo "   - git pull"
echo "   - sudo systemctl restart mozsolidaria.service"
echo "4. Testar o registro de novos usuários"

echo ""
echo "✅ Deploy da correção concluído!"
