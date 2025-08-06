#!/usr/bin/env python
# create_sample_projects.py - Criar projetos de exemplo

import os
import sys
import django

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project, Program, ProjectCategory
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from datetime import datetime, timedelta

User = get_user_model()

def create_sample_projects():
    """Criar projetos de exemplo"""
    
    # Buscar programa e categoria
    try:
        programa_educacao = Program.objects.get(slug='educacao')
        categoria_escola = ProjectCategory.objects.filter(program=programa_educacao).first()
        
        projects_data = [
            {
                'name': 'Escola Primária Joel Malamba',
                'slug': 'joel',
                'short_description': 'Construção de escola primária na comunidade rural',
                'description': 'Este projeto visa construir uma escola primária completa na comunidade rural de Joel Malamba, beneficiando mais de 200 crianças.',
                'content': 'Projeto de construção de escola primária moderna e equipada.',
                'location': 'Joel Malamba',
                'status': 'active',
                'priority': 'high',
                'target_beneficiaries': 200,
                'start_date': datetime.now().date(),
                'program': programa_educacao,
                'is_public': True,
                'is_featured': True,
            },
            {
                'name': 'Centro de Formação Técnica',
                'slug': 'centro-formacao-tecnica',
                'short_description': 'Centro de formação técnica para jovens',
                'description': 'Estabelecimento de um centro de formação técnica para capacitar jovens.',
                'content': 'Centro de formação técnica especializada.',
                'location': 'Viana',
                'status': 'planning',
                'priority': 'medium',
                'target_beneficiaries': 150,
                'start_date': datetime.now().date(),
                'program': programa_educacao,
                'is_public': True,
                'is_featured': False,
            }
        ]
        
        print("🚀 Criando projetos de exemplo...")
        
        for project_data in projects_data:
            if categoria_escola:
                project_data['category'] = categoria_escola
            
            project, created = Project.objects.get_or_create(
                slug=project_data['slug'],
                defaults=project_data
            )
            
            if created:
                print(f"✅ Projeto criado: {project.name}")
            else:
                print(f"ℹ️  Projeto já existe: {project.name}")
        
        print(f"\n📊 Total de projetos públicos: {Project.objects.filter(is_public=True).count()}")
        
    except Program.DoesNotExist:
        print("❌ Programa 'Educação' não encontrado. Execute create_programs.py primeiro.")
    except Exception as e:
        print(f"❌ Erro ao criar projetos: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_sample_projects()
