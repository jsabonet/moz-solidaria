#!/usr/bin/env python
import os
import sys
import django

# Configure Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project, Program, ProjectCategory

def update_project_data():
    try:
        # Buscar o projeto
        proj = Project.objects.get(slug='futuro-sustentavel')
        print(f"Projeto encontrado: {proj.name}")
        print(f"Status atual: {proj.status} ({proj.get_status_display()})")
        print(f"Priority atual: {proj.priority} ({proj.get_priority_display()})")
        print(f"Program atual: {proj.program}")
        print(f"Category atual: {proj.category}")
        
        # Verificar se há programas
        programs = Program.objects.all()
        print(f"\nProgramas disponíveis: {programs.count()}")
        for program in programs[:3]:
            print(f"  - {program.name}")
        
        # Verificar se há categorias
        categories = ProjectCategory.objects.all()
        print(f"\nCategorias disponíveis: {categories.count()}")
        for category in categories[:3]:
            print(f"  - {category.name}")
        
        # Atualizar status e prioridade se necessário
        if not proj.status:
            proj.status = 'active'
            print("✅ Status atualizado para 'active'")
        
        if not proj.priority:
            proj.priority = 'high'
            print("✅ Prioridade atualizada para 'high'")
        
        # Associar programa se não tiver
        if not proj.program and programs.exists():
            proj.program = programs.first()
            print(f"✅ Programa associado: {proj.program.name}")
        
        # Associar categoria se não tiver e existir
        if not proj.category and categories.exists():
            proj.category = categories.first()
            print(f"✅ Categoria associada: {proj.category.name}")
        
        proj.save()
        print(f"\n✅ Projeto atualizado com sucesso!")
        
        # Verificar resultado final
        proj.refresh_from_db()
        print(f"\nStatus final: {proj.status} ({proj.get_status_display()})")
        print(f"Priority final: {proj.priority} ({proj.get_priority_display()})")
        print(f"Program final: {proj.program}")
        print(f"Category final: {proj.category}")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'futuro-sustentavel' não encontrado")
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == '__main__':
    update_project_data()
