#!/usr/bin/env python
"""
Script simples para verificar e popular habilidades de voluntários
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
    from volunteers.models import VolunteerSkill
    
    print("🔍 Verificando habilidades...")
    count = VolunteerSkill.objects.count()
    print(f"📊 Habilidades existentes: {count}")
    
    if count == 0:
        print("⚠️  Criando habilidades padrão...")
        
        skills = [
            'Programação', 'Design Gráfico', 'Fotografia', 'Primeiros Socorros',
            'Ensino de Português', 'Ensino de Matemática', 'Construção Civil',
            'Contabilidade', 'Trabalho Social', 'Condução', 'Cozinha', 'Jardinagem'
        ]
        
        for skill_name in skills:
            VolunteerSkill.objects.create(
                name=skill_name,
                description=f'Habilidade em {skill_name}',
                category='other'
            )
            print(f"  ✅ Criada: {skill_name}")
        
        print(f"🎉 {len(skills)} habilidades criadas!")
    
    else:
        print("✅ Habilidades encontradas:")
        for skill in VolunteerSkill.objects.all():
            print(f"  • {skill.name}")

except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
