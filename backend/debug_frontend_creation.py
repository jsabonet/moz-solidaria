#!/usr/bin/env python3
"""
Debug avançado para investigar problema de criação via frontend
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.models import ProjectUpdate
from core.models import Project
from django.contrib.auth.models import User
import requests
from datetime import datetime

def debug_frontend_creation():
    """Debug para investigar criações via frontend"""
    print("=== DEBUG: INVESTIGAÇÃO CRIAÇÃO VIA FRONTEND ===")
    
    # 1. Verificar estado atual do banco
    print("1. Estado atual do banco de dados:")
    total_updates = ProjectUpdate.objects.count()
    project_updates = ProjectUpdate.objects.filter(project__slug='Joel').count()
    print(f"   Total de updates no banco: {total_updates}")
    print(f"   Updates do projeto Joel: {project_updates}")
    
    # 2. Listar últimos 5 updates
    print("\n2. Últimos 5 updates no banco:")
    last_updates = ProjectUpdate.objects.select_related('project', 'author').order_by('-created_at')[:5]
    for update in last_updates:
        print(f"   ID: {update.id} | Projeto: {update.project.slug} | Título: {update.title} | Criado: {update.created_at}")
    
    # 3. Verificar se há updates órfãos
    print("\n3. Verificando updates órfãos:")
    orphan_updates = ProjectUpdate.objects.filter(project__isnull=True).count()
    print(f"   Updates sem projeto: {orphan_updates}")
    
    # 4. Verificar relacionamento reverso
    print("\n4. Verificando relacionamento reverso:")
    try:
        project = Project.objects.get(slug='Joel')
        via_reverse = project.tracking_updates.count()
        print(f"   Via project.tracking_updates.count(): {via_reverse}")
        
        # Listar via relacionamento reverso
        print("   Updates via relacionamento reverso:")
        for update in project.tracking_updates.all()[:5]:
            print(f"     ID: {update.id} | {update.title} | {update.created_at}")
            
    except Project.DoesNotExist:
        print("   ❌ Projeto 'Joel' não encontrado!")
    
    # 5. Testar criação direta no banco
    print("\n5. Testando criação direta no banco:")
    try:
        project = Project.objects.get(slug='Joel')
        admin_user = User.objects.get(username='admin')
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        new_update = ProjectUpdate.objects.create(
            project=project,
            author=admin_user,
            title=f"Teste Direto DB {timestamp}",
            description="Criado diretamente no banco para teste",
            type='progress',
            status='published',
            people_impacted=100,
            budget_spent=1000.00,
            progress_percentage=50
        )
        print(f"   ✅ Update criado diretamente: ID {new_update.id}")
        
        # Verificar se aparece via relacionamento
        fresh_count = project.tracking_updates.count()
        print(f"   ✅ Count após criação direta: {fresh_count}")
        
    except Exception as e:
        print(f"   ❌ Erro na criação direta: {e}")
    
    # 6. Simular requisição HTTP como o frontend
    print("\n6. Simulando requisição HTTP:")
    try:
        # Obter token
        auth_response = requests.post('http://localhost:8000/api/v1/auth/token/', {
            'username': 'admin',
            'password': 'admin123'
        })
        
        if auth_response.status_code == 200:
            token = auth_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Contar antes
            list_response = requests.get('http://localhost:8000/api/v1/tracking/projects/Joel/updates/', headers=headers)
            count_before = list_response.json()['count'] if list_response.status_code == 200 else 0
            print(f"   Count antes da criação HTTP: {count_before}")
            
            # Criar via HTTP
            timestamp = datetime.now().strftime("%H:%M:%S")
            new_update_data = {
                "title": f"Teste HTTP {timestamp}",
                "description": "Criado via HTTP para teste",
                "type": "progress",
                "status": "published",
                "people_impacted": 200,
                "budget_spent": "2000.00",
                "progress_percentage": 75
            }
            
            create_response = requests.post(
                'http://localhost:8000/api/v1/tracking/projects/Joel/updates/',
                json=new_update_data,
                headers=headers
            )
            
            if create_response.status_code == 201:
                created_data = create_response.json()
                print(f"   ✅ Update criado via HTTP: ID {created_data['id']}")
                
                # Contar depois
                list_response = requests.get('http://localhost:8000/api/v1/tracking/projects/Joel/updates/', headers=headers)
                count_after = list_response.json()['count'] if list_response.status_code == 200 else 0
                print(f"   Count após criação HTTP: {count_after}")
                
                # Verificar no banco diretamente
                db_count = ProjectUpdate.objects.filter(project__slug='Joel').count()
                print(f"   Count direto no banco: {db_count}")
                
                # Tentar buscar o update criado
                try:
                    created_update = ProjectUpdate.objects.get(id=created_data['id'])
                    print(f"   ✅ Update encontrado no banco: {created_update.title}")
                except ProjectUpdate.DoesNotExist:
                    print(f"   ❌ Update ID {created_data['id']} NÃO encontrado no banco!")
                
            else:
                print(f"   ❌ Erro na criação HTTP: {create_response.status_code}")
                print(f"   Resposta: {create_response.text}")
        else:
            print(f"   ❌ Erro na autenticação: {auth_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erro na simulação HTTP: {e}")
    
    print("\n=== FIM DO DEBUG ===")

if __name__ == "__main__":
    debug_frontend_creation()
