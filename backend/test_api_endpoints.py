#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from core.models import Project

def test_api_endpoints():
    print("=== Teste de API Endpoints ===\n")
    
    # Obter projeto
    project = Project.objects.first()
    if not project:
        print("Nenhum projeto encontrado!")
        return
        
    print(f"Testando com projeto: {project.name} (slug: {project.slug})")
    
    # Criar um usuário para autenticação
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(username='testuser', password='testpass')
        print(f"Usuário criado: {user.username}")
    
    # Criar cliente de teste
    client = Client()
    
    # Testar endpoints
    print("\n=== Testando endpoints ===")
    
    # 1. Project tracking detail
    url = f'/api/v1/tracking/project-tracking/{project.slug}/'
    print(f"1. GET {url}")
    response = client.get(url)
    print(f"   Status: {response.status_code}")
    if response.status_code != 200:
        print(f"   Erro: {response.content.decode()}")
    
    # 2. Project updates list
    url = f'/api/v1/tracking/projects/{project.slug}/updates/'
    print(f"2. GET {url}")
    response = client.get(url)
    print(f"   Status: {response.status_code}")
    if response.status_code != 200:
        print(f"   Erro: {response.content.decode()}")
    
    # 3. Create update (authenticated)
    client.login(username='testuser', password='testpass')
    
    update_data = {
        'title': 'Teste de atualização',
        'description': 'Descrição do teste',
        'type': 'progress',
        'status': 'published'
    }
    
    print(f"3. POST {url} (com autenticação)")
    response = client.post(url, update_data, content_type='application/json')
    print(f"   Status: {response.status_code}")
    if response.status_code not in [200, 201]:
        print(f"   Erro: {response.content.decode()}")
    else:
        print("   Sucesso! Atualização criada.")

if __name__ == "__main__":
    test_api_endpoints()
