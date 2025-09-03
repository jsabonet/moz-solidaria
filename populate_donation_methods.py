#!/usr/bin/env python
"""
Script para popular métodos de doação
"""
import os
import sys
import django

# Configurar Django
os.chdir('backend')
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

try:
    from donations.models import DonationMethod
    
    print("🔍 Verificando métodos de doação...")
    count = DonationMethod.objects.count()
    print(f"📊 Métodos existentes: {count}")
    
    if count == 0:
        print("⚠️  Criando métodos de doação padrão...")
        
        methods_data = [
            {
                'name': 'Transferência Bancária',
                'description': 'Transferência direta via sistema bancário',
                'account_details': {
                    'banco': 'BCI - Banco Comercial e de Investimentos',
                    'conta': '0003.4567.8901.2345.6',
                    'titular': 'MOZ SOLIDÁRIA - Organização Humanitária',
                    'iban': 'MZ59 0003 4567 8901 2345 6789',
                    'swift': 'BCIMZMZM'
                }
            },
            {
                'name': 'M-Pesa',
                'description': 'Pagamento via M-Pesa da Vodacom',
                'account_details': {
                    'operadora': 'Vodacom M-Pesa',
                    'numero': '+258 84 204 0330',
                    'nome': 'MOZ SOLIDÁRIA',
                    'referencia': 'DOACAO-HUMANITARIA'
                }
            },
            {
                'name': 'E-Mola',
                'description': 'Pagamento via E-Mola da Movitel',
                'account_details': {
                    'operadora': 'Movitel E-Mola',
                    'numero': '+258 86 204 0330',
                    'nome': 'MOZ SOLIDÁRIA',
                    'referencia': 'DOACAO-HUMANITARIA'
                }
            },
            {
                'name': 'Dinheiro',
                'description': 'Entrega de dinheiro em espécie',
                'account_details': {
                    'tipo': 'dinheiro',
                    'local': 'Escritório Moz Solidária',
                    'endereco': 'Rua da Solidariedade, Nº 123, Pemba',
                    'horario': 'Segunda a Sexta, 8h às 17h'
                }
            },
            {
                'name': 'Outros Bancos',
                'description': 'Transferência via outros bancos nacionais',
                'account_details': {
                    'bancos': ['Standard Bank', 'BIM', 'Millennium BIM', 'FNB', 'Banco Terra'],
                    'conta_principal': '0003.4567.8901.2345.6',
                    'titular': 'MOZ SOLIDÁRIA'
                }
            }
        ]
        
        created_count = 0
        for method_data in methods_data:
            method, created = DonationMethod.objects.get_or_create(
                name=method_data['name'],
                defaults={
                    'description': method_data['description'],
                    'account_details': method_data['account_details'],
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                print(f"  ✅ Criado: {method_data['name']}")
            else:
                print(f"  ⚠️  Já existe: {method_data['name']}")
        
        print(f"🎉 {created_count} métodos criados!")
    
    else:
        print("✅ Métodos encontrados:")
        for method in DonationMethod.objects.all():
            print(f"  • {method.name} ({'Ativo' if method.is_active else 'Inativo'})")

except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
