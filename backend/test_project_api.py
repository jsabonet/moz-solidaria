#!/usr/bin/env python
# test_project_api.py - Testar endpoint de projetos

import os
import sys
import django
import requests

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.test import Client
from django.urls import reverse
from core.models import Project
import json

def test_project_endpoints():
    """Testar endpoints de projetos"""
    
    print("🚀 Testando endpoints de projetos...")
    
    # Testar se existem projetos no banco
    projects = Project.objects.filter(is_public=True)
    print(f"📊 Projetos públicos no banco: {projects.count()}")
    
    for project in projects:
        print(f"   • {project.name} (slug: {project.slug})")
    
    # Usar client Django para testar
    client = Client()
    
    print("\n🔍 Testando endpoints...")
    
    # Testar lista de projetos
    try:
        response = client.get('/api/v1/projects/public/projects/')
        print(f"GET /api/v1/projects/public/projects/ - Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   • Projetos retornados: {len(data.get('results', data))}")
            
            # Mostrar primeiro projeto se existir
            results = data.get('results', data)
            if results and len(results) > 0:
                first_project = results[0]
                print(f"   • Primeiro projeto: {first_project.get('name')} (slug: {first_project.get('slug')})")
        else:
            print(f"   • Erro: {response.content.decode()}")
    except Exception as e:
        print(f"   • Erro na requisição: {e}")
    
    # Testar busca por slug específico
    if projects.exists():
        test_slug = projects.first().slug
        try:
            response = client.get(f'/api/v1/projects/public/projects/?slug={test_slug}')
            print(f"GET /api/v1/projects/public/projects/?slug={test_slug} - Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', data)
                if results and len(results) > 0:
                    project = results[0]
                    print(f"   • Projeto encontrado: {project.get('name')}")
                else:
                    print("   • Nenhum projeto encontrado")
            else:
                print(f"   • Erro: {response.content.decode()}")
        except Exception as e:
            print(f"   • Erro na requisição: {e}")

if __name__ == '__main__':
    test_project_endpoints()
