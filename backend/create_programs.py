#!/usr/bin/env python
# create_programs.py - Criar programas básicos

import os
import sys
import django

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Program
from django.utils.text import slugify

def create_basic_programs():
    """Criar programas básicos se não existirem"""
    
    programs_data = [
        {
            'name': 'Educação',
            'slug': 'educacao',
            'description': 'Programas educacionais para transformar vidas através do conhecimento',
            'short_description': 'Educação transformadora para todas as idades',
            'icon': 'BookOpen',
            'color': 'blue',
            'beneficiaries_count': 500,
            'communities_reached': 15,
            'order': 1
        },
        {
            'name': 'Apoio Humanitário',
            'slug': 'apoio-humanitario',
            'description': 'Assistência emergencial e apoio humanitário para comunidades vulneráveis',
            'short_description': 'Apoio humanitário em situações de emergência',
            'icon': 'Heart',
            'color': 'red',
            'beneficiaries_count': 1200,
            'communities_reached': 25,
            'order': 2
        },
        {
            'name': 'Saúde Pública',
            'slug': 'saude-publica',
            'description': 'Promoção da saúde e bem-estar das comunidades',
            'short_description': 'Saúde e bem-estar para todos',
            'icon': 'Stethoscope',
            'color': 'green',
            'beneficiaries_count': 800,
            'communities_reached': 20,
            'order': 3
        },
        {
            'name': 'Infraestrutura',
            'slug': 'infraestrutura',
            'description': 'Desenvolvimento de infraestrutura básica para comunidades',
            'short_description': 'Infraestrutura para o desenvolvimento',
            'icon': 'Building',
            'color': 'yellow',
            'beneficiaries_count': 2000,
            'communities_reached': 30,
            'order': 4
        },
        {
            'name': 'Formação Juvenil',
            'slug': 'formacao-juvenil',
            'description': 'Programas de formação e capacitação para jovens',
            'short_description': 'Preparando jovens para o futuro',
            'icon': 'Users',
            'color': 'purple',
            'beneficiaries_count': 350,
            'communities_reached': 12,
            'order': 5
        }
    ]
    
    print("🚀 Criando programas básicos...")
    
    for program_data in programs_data:
        program, created = Program.objects.get_or_create(
            slug=program_data['slug'],
            defaults=program_data
        )
        
        if created:
            print(f"✅ Programa criado: {program.name}")
        else:
            print(f"ℹ️  Programa já existe: {program.name}")
    
    print(f"\n📊 Total de programas ativos: {Program.objects.filter(is_active=True).count()}")

if __name__ == '__main__':
    create_basic_programs()
