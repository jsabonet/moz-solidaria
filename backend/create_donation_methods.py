#!/usr/bin/env python
"""Script para criar métodos de doação"""

import os
import django

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from donations.models import DonationMethod

# Criar métodos de doação básicos
methods = [
    {
        'name': 'M-Pesa',
        'description': 'Pagamento via M-Pesa',
        'is_active': True
    },
    {
        'name': 'Banco BIM',
        'description': 'Transferência bancária - BIM',
        'is_active': True
    },
    {
        'name': 'Millennium BIM',
        'description': 'Transferência bancária - Millennium BIM',
        'is_active': True
    },
    {
        'name': 'Standard Bank',
        'description': 'Transferência bancária - Standard Bank',
        'is_active': True
    },
    {
        'name': 'Dinheiro',
        'description': 'Pagamento em dinheiro',
        'is_active': True
    }
]

print("Criando métodos de doação...")
for method_data in methods:
    method, created = DonationMethod.objects.get_or_create(
        name=method_data['name'],
        defaults=method_data
    )
    if created:
        print(f"✓ Criado: {method.name}")
    else:
        print(f"- Já existe: {method.name}")

print(f"\nTotal de métodos ativos: {DonationMethod.objects.filter(is_active=True).count()}")
