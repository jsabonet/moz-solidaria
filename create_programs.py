#!/usr/bin/env python3
"""
Script para criar programas de exemplo no banco de dados
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Program

def create_programs():
    """Cria programas de exemplo"""
    programs_data = [
        {
            'name': 'Apoio Alimentar',
            'slug': 'apoio-alimentar',
            'description': 'Programas de assistência alimentar para comunidades vulneráveis',
            'short_description': 'Combate à fome e insegurança alimentar',
            'icon': 'utensils',
            'color': '#e74c3c',
            'order': 1,
            'is_active': True
        },
        {
            'name': 'Reconstrução',
            'slug': 'reconstrucao',
            'description': 'Programas de reconstrução de infraestruturas e habitações',
            'short_description': 'Reconstrução de casas e infraestruturas',
            'icon': 'hammer',
            'color': '#f39c12',
            'order': 2,
            'is_active': True
        },
        {
            'name': 'Educação',
            'slug': 'educacao',
            'description': 'Programas educacionais e de capacitação profissional',
            'short_description': 'Educação e formação profissional',
            'icon': 'graduation-cap',
            'color': '#3498db',
            'order': 3,
            'is_active': True
        },
        {
            'name': 'Saúde',
            'slug': 'saude',
            'description': 'Programas de assistência médica e promoção da saúde',
            'short_description': 'Cuidados de saúde e medicina preventiva',
            'icon': 'heartbeat',
            'color': '#2ecc71',
            'order': 4,
            'is_active': True
        },
        {
            'name': 'Proteção',
            'slug': 'protecao',
            'description': 'Programas de proteção infantil e direitos humanos',
            'short_description': 'Proteção de crianças e direitos humanos',
            'icon': 'shield-alt',
            'color': '#9b59b6',
            'order': 5,
            'is_active': True
        },
        {
            'name': 'Apoio Psicossocial',
            'slug': 'apoio-psicossocial',
            'description': 'Programas de apoio psicológico e reintegração social',
            'short_description': 'Suporte psicológico e social',
            'icon': 'hands-helping',
            'color': '#1abc9c',
            'order': 6,
            'is_active': True
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    print("🚀 Criando programas de exemplo...")
    
    for program_data in programs_data:
        program, created = Program.objects.get_or_create(
            slug=program_data['slug'],
            defaults=program_data
        )
        
        if created:
            created_count += 1
            print(f"✅ Criado: {program.name}")
        else:
            # Atualizar dados se o programa já existe
            for key, value in program_data.items():
                setattr(program, key, value)
            program.save()
            updated_count += 1
            print(f"🔄 Atualizado: {program.name}")
    
    print(f"\n📊 Resumo:")
    print(f"  🆕 Programas criados: {created_count}")
    print(f"  🔄 Programas atualizados: {updated_count}")
    print(f"  📦 Total de programas: {Program.objects.count()}")
    
    # Listar todos os programas
    print(f"\n📋 Lista de programas:")
    for program in Program.objects.all().order_by('order'):
        print(f"  {program.order}. {program.name} ({program.slug}) - {program.color}")

if __name__ == "__main__":
    create_programs()
