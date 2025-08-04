#!/usr/bin/env python
"""Script para criar causas de exemplo"""

import os
import django

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from client_area.models import Cause

# Criar causas básicas
causes = [
    {
        'name': 'Educação',
        'description': 'Apoio à educação e formação',
        'is_active': True
    },
    {
        'name': 'Saúde',
        'description': 'Apoio à saúde e bem-estar',
        'is_active': True
    },
    {
        'name': 'Ambiente',
        'description': 'Proteção ambiental e sustentabilidade',
        'is_active': True
    },
    {
        'name': 'Combate à Pobreza',
        'description': 'Redução da pobreza e desigualdade',
        'is_active': True
    },
    {
        'name': 'Direitos Humanos',
        'description': 'Promoção e defesa dos direitos humanos',
        'is_active': True
    }
]

print("Criando causas...")
for cause_data in causes:
    cause, created = Cause.objects.get_or_create(
        name=cause_data['name'],
        defaults=cause_data
    )
    if created:
        print(f"✓ Criado: {cause.name}")
    else:
        print(f"- Já existe: {cause.name}")

print(f"\nTotal de causas ativas: {Cause.objects.filter(is_active=True).count()}")
