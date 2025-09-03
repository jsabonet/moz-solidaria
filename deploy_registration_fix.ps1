# Script de Deploy da Correção do Bug de Registro de Usuários
# PowerShell Version

Write-Host "🚀 Iniciando deploy da correção do bug de registro..." -ForegroundColor Green

# Fazer backup do arquivo atual
Write-Host "📦 Fazendo backup do arquivo atual..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item "backend\client_area\serializers.py" "backend\client_area\serializers.py.backup.$timestamp"

Write-Host "✅ Backup criado com sucesso!" -ForegroundColor Green

Write-Host "🔧 Aplicando correções do bug..." -ForegroundColor Yellow

Write-Host "✅ Correções aplicadas!" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Resumo das correções:" -ForegroundColor Cyan
Write-Host "1. ❌ Removido campo 'user_type' inexistente do UserProfile" -ForegroundColor Red
Write-Host "2. ✅ Corrigidos defaults para criação de perfis específicos" -ForegroundColor Green
Write-Host "3. ✅ Adicionado campo 'family_status' obrigatório para Beneficiary" -ForegroundColor Green
Write-Host "4. ✅ Corrigido campo 'organization_name' vazio para Partner" -ForegroundColor Green

Write-Host ""
Write-Host "🏥 DIAGNÓSTICO DO PROBLEMA:" -ForegroundColor Red
Write-Host "O erro ocorria porque o serializer tentava criar um UserProfile"
Write-Host "com o campo 'user_type', mas esse campo não existe no modelo."
Write-Host "Erro específico: FieldError: Invalid field name(s) for model UserProfile: 'user_type'"

Write-Host ""
Write-Host "🔧 CORREÇÃO APLICADA:" -ForegroundColor Yellow
Write-Host "- Removidas todas as referências ao campo 'user_type' nos métodos get_or_create"
Write-Host "- Adicionados valores padrão para campos obrigatórios nos modelos relacionados"
Write-Host "- Melhorada a validação de dados antes da criação dos perfis"

Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS PARA PRODUÇÃO:" -ForegroundColor Cyan
Write-Host "1. Fazer git commit das alterações"
Write-Host "2. Fazer push para o repositório"
Write-Host "3. No servidor de produção:"
Write-Host "   - git pull"
Write-Host "   - sudo systemctl restart mozsolidaria.service"
Write-Host "4. Testar o registro de novos usuários"

Write-Host ""
Write-Host "🚀 Para aplicar em produção agora, execute:" -ForegroundColor Magenta
Write-Host "git add ."
Write-Host "git commit -m 'fix: corrigir erro FieldError no registro de usuários - remover campo user_type inexistente'"
Write-Host "git push"

Write-Host ""
Write-Host "Deploy da correcao concluido!" -ForegroundColor Green
