#!/usr/bin/env python
"""
Script para criar métodos de doação básicos para o sistema
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from donations.models import DonationMethod

def create_donation_methods():
    """Cria métodos de doação básicos"""
    
    methods = [
        {
            'name': 'Transferência Bancária',
            'description': 'Transferência via BCI ou outros bancos',
            'account_details': {
                'bank': 'BCI - Banco Comercial e de Investimentos',
                'account_name': 'MOZ SOLIDÁRIA - Organização Humanitária',
                'account_number': '0003.4567.8901.2345.6',
                'iban': 'MZ59 0003 4567 8901 2345 6789',
                'swift': 'BCIMZMZM'
            }
        },
        {
            'name': 'M-Pesa',
            'description': 'Pagamento via Vodacom M-Pesa',
            'account_details': {
                'operator': 'Vodacom M-Pesa',
                'number': '+258 84 204 0330',
                'name': 'MOZ SOLIDÁRIA',
                'reference': 'DOACAO-HUMANITARIA'
            }
        },
        {
            'name': 'E-Mola',
            'description': 'Pagamento via Movitel E-Mola',
            'account_details': {
                'operator': 'Movitel E-Mola',
                'number': '+258 86 204 0330',
                'name': 'MOZ SOLIDÁRIA',
                'reference': 'DOACAO-HUMANITARIA'
            }
        }
    ]
    
    created_count = 0
    for method_data in methods:
        method, created = DonationMethod.objects.get_or_create(
            name=method_data['name'],
            defaults={
                'description': method_data['description'],
                'account_details': method_data['account_details'],
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ Criado método: {method.name}")
            created_count += 1
        else:
            print(f"👍 Método já existe: {method.name}")
    
    print(f"\n🎯 {created_count} novos métodos criados")
    print(f"📊 Total de métodos ativos: {DonationMethod.objects.filter(is_active=True).count()}")

if __name__ == "__main__":
    print("🚀 Criando métodos de doação...")
    create_donation_methods()
    print("✅ Concluído!")
