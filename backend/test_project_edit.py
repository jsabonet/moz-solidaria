#!/usr/bin/env python
"""
Teste para verificar funcionalidade de busca de projeto por ID
para edição no frontend.
"""
import os
import sys
import django
from django.test import Client

# Configurar Django
sys.path.append('/d/Projectos/moz-solidaria-hub-main/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project, Program
from django.contrib.auth.models import User

def test_project_api():
    print("🔍 Testando API de projetos para edição...")
    
    # Verificar se existe algum projeto
    projects = Project.objects.all()
    print(f"📊 Total de projetos na base de dados: {projects.count()}")
    
    if projects.exists():
        # Pegar o primeiro projeto
        project = projects.first()
        print(f"✅ Projeto encontrado: {project.name} (ID: {project.id})")
        
        # Simular requisição GET para buscar projeto por ID
        client = Client()
        
        # Teste endpoint público (se existir)
        try:
            response = client.get(f'/api/v1/projects/public/projects/{project.id}/')
            print(f"🌐 Endpoint público - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ Endpoint público falhou: {e}")
        
        # Teste endpoint admin (requer autenticação)
        try:
            response = client.get(f'/api/v1/projects/admin/projects/{project.id}/')
            print(f"🔐 Endpoint admin - Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"📝 Projeto carregado: {data.get('name', 'Sem nome')}")
            elif response.status_code == 401:
                print("🔑 Endpoint admin requer autenticação (esperado)")
        except Exception as e:
            print(f"❌ Endpoint admin falhou: {e}")
            
        # Mostrar campos importantes para edição
        print(f"\n📋 Campos do projeto {project.name}:")
        print(f"   - Slug: {project.slug}")
        print(f"   - Descrição: {project.short_description[:50]}...")
        print(f"   - Status: {project.status}")
        print(f"   - Localização: {project.location}")
        print(f"   - Programa: {project.program.name if project.program else 'Sem programa'}")
        
    else:
        print("❌ Nenhum projeto encontrado na base de dados")
        print("💡 Criando projeto de exemplo...")
        
        # Criar programa se não existir
        program, created = Program.objects.get_or_create(
            name="Programa de Teste",
            defaults={
                'description': 'Programa criado para testes',
                'color': '#3B82F6'
            }
        )
        
        # Criar projeto de exemplo
        project = Project.objects.create(
            name="Projeto de Teste para Edição",
            slug="projeto-teste-edicao",
            short_description="Projeto criado para testar funcionalidade de edição",
            description="Descrição completa do projeto de teste",
            content="<p>Conteúdo do projeto de teste</p>",
            program=program,
            status="planning",
            priority="medium",
            location="Pemba",
            district="Pemba",
            province="Cabo Delgado",
            target_beneficiaries=100,
            current_beneficiaries=0,
            target_budget=50000,
            current_spending=0,
            progress_percentage=0,
            is_featured=False,
            is_public=True
        )
        
        print(f"✅ Projeto criado: {project.name} (ID: {project.id})")
        print(f"🔗 URL de edição: /dashboard/projects/edit/{project.id}")

if __name__ == '__main__':
    test_project_api()
