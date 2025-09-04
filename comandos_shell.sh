# COMANDOS PARA EXECUTAR NO SERVIDOR DIGITALOCEAN

# 1. Conectar ao servidor
ssh root@your-digitalocean-ip

# 2. Ir para o diretório do projeto  
cd /home/ubuntu/moz-solidaria

# 3. Ativar ambiente virtual
source venv/bin/activate

# 4. Fazer git pull das mudanças
git pull origin main

# 5. Popular métodos de doação via Django shell
python manage.py shell << 'EOF'
from donations.models import DonationMethod

if not DonationMethod.objects.exists():
    methods = [
        {'name': 'Transferência Bancária', 'code': 'bank_transfer', 'is_active': True},
        {'name': 'M-Pesa', 'code': 'mpesa', 'is_active': True},
        {'name': 'E-Mola', 'code': 'emola', 'is_active': True},
        {'name': 'Dinheiro', 'code': 'cash', 'is_active': True},
        {'name': 'Outros Bancos', 'code': 'other_banks', 'is_active': True}
    ]
    
    for method_data in methods:
        DonationMethod.objects.create(**method_data)
    
    print('✅ 5 métodos de doação criados com sucesso!')
else:
    print('ℹ️ Métodos de doação já existem')
    
print(f'Total de métodos: {DonationMethod.objects.count()}')
EOF

# 6. Reiniciar serviços
sudo systemctl restart mozsolidaria.service
sudo systemctl restart nginx

# 7. Verificar se API retorna métodos
curl -X GET https://mozsolidaria.org/api/v1/donations/methods/

# 8. TESTE FINAL:
# - Acessar https://mozsolidaria.org
# - Ir para página de Doação  
# - Verificar se métodos aparecem no dropdown
# - Testar criação de nova doação
