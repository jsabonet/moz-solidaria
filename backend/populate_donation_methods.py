#!/usr/bin/env python
"""
Script para popular métodos de doação iniciais
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from donations.models import DonationMethod

def populate_donation_methods():
    methods = [
        {'name': 'M-Pesa', 'is_active': True},
        {'name': 'Transferência Bancária', 'is_active': True},
        {'name': 'Cartão de Crédito/Débito', 'is_active': True},
        {'name': 'PayPal', 'is_active': True},
        {'name': 'Dinheiro', 'is_active': True},
        {'name': 'Cheque', 'is_active': True}
    ]
    
    created_count = 0
    existing_count = 0
    
    for method_data in methods:
        method, created = DonationMethod.objects.get_or_create(
            name=method_data['name'],
            defaults={'is_active': method_data['is_active']}
        )
        if created:
            print(f'✓ Método {method.name} criado com sucesso')
            created_count += 1
        else:
            print(f'• Método {method.name} já existe')
            existing_count += 1
    
    print(f'\n--- Resumo ---')
    print(f'Métodos criados: {created_count}')
    print(f'Métodos existentes: {existing_count}')
    print(f'Total de métodos: {DonationMethod.objects.count()}')
    print('População de métodos de doação concluída!')

if __name__ == '__main__':
    populate_donation_methods()
