# Script PowerShell para deployment dos métodos de doação

Write-Host "🔧 Deploying donation methods fix..." -ForegroundColor Green

Write-Host "`n📋 PROBLEMA DIAGNOSTICADO:" -ForegroundColor Yellow
Write-Host "Os métodos de pagamento não aparecem nos componentes de doação"
Write-Host "porque a tabela 'donations_donationmethod' está vazia."

Write-Host "`n✅ CORREÇÕES APLICADAS:" -ForegroundColor Green
Write-Host "1. ✨ Frontend melhorado com fallback para listas vazias"
Write-Host "2. 🐛 Logs de debug adicionados"
Write-Host "3. 📄 Scripts de população criados"
Write-Host "4. 🎨 UX melhorada com mensagens informativas"

Write-Host "`n🚀 PRÓXIMOS PASSOS PARA PRODUÇÃO:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Execute estes comandos no servidor DigitalOcean:" -ForegroundColor White
Write-Host ""
Write-Host "# 1. Conectar ao servidor"
Write-Host "ssh root@your-server-ip"
Write-Host ""
Write-Host "# 2. Ir para o diretório do projeto"
Write-Host "cd /home/ubuntu/moz-solidaria"
Write-Host ""
Write-Host "# 3. Ativar ambiente virtual"
Write-Host "source venv/bin/activate"
Write-Host ""
Write-Host "# 4. Fazer git pull das mudanças"
Write-Host "git pull origin main"
Write-Host ""
Write-Host "# 5. Popular métodos de doação via Django shell"
Write-Host "python manage.py shell -c \`""
Write-Host "from donations.models import DonationMethod"
Write-Host "if not DonationMethod.objects.exists():"
Write-Host "    methods = ["
Write-Host "        {'name': 'Transferência Bancária', 'code': 'bank_transfer', 'is_active': True},"
Write-Host "        {'name': 'M-Pesa', 'code': 'mpesa', 'is_active': True},"
Write-Host "        {'name': 'E-Mola', 'code': 'emola', 'is_active': True},"
Write-Host "        {'name': 'Dinheiro', 'code': 'cash', 'is_active': True},"
Write-Host "        {'name': 'Outros Bancos', 'code': 'other_banks', 'is_active': True}"
Write-Host "    ]"
Write-Host "    for method_data in methods:"
Write-Host "        DonationMethod.objects.create(**method_data)"
Write-Host "    print('✅ 5 métodos de doação criados com sucesso!')"
Write-Host "else:"
Write-Host "    print('ℹ️ Métodos de doação já existem')"
Write-Host "\`""
Write-Host ""
Write-Host "# 6. Reiniciar serviços"
Write-Host "sudo systemctl restart mozsolidaria.service"
Write-Host "sudo systemctl restart nginx"
Write-Host ""
Write-Host "# 7. Verificar funcionamento"
Write-Host "curl -X GET https://mozsolidaria.org/api/v1/donations/methods/"

Write-Host "`n🎯 TESTE FINAL:" -ForegroundColor Magenta
Write-Host "1. Acessar https://mozsolidaria.org"
Write-Host "2. Ir para página de Doação"
Write-Host "3. Verificar se métodos de pagamento aparecem no dropdown"
Write-Host "4. Testar criação de nova doação"

Write-Host "`n✅ Deploy do fix dos métodos de doação está pronto!" -ForegroundColor Green
