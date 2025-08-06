#!/usr/bin/env python
import os
import sys
import django
import json
import requests
from datetime import datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.contrib.auth.models import User
from django.test.client import Client
from django.urls import reverse
from rest_framework.authtoken.models import Token
from core.models import Project
from project_tracking.models import ProjectUpdate

def test_full_system():
    """Teste completo do sistema de updates"""
    print("🔍 TESTE FINAL DO SISTEMA DE UPDATES")
    print("=" * 50)
    
    # 1. Verificar se o projeto Joel existe
    try:
        project = Project.objects.get(slug='Joel')
        print(f"✅ Projeto encontrado: {project.name}")
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado")
        return
    
    # 2. Verificar updates diretas no banco
    updates_db = project.tracking_updates.all()
    print(f"📊 Updates no banco (tracking_updates): {updates_db.count()}")
    
    if updates_db.exists():
        latest = updates_db.first()
        print(f"📝 Última update: {latest.title} (ID: {latest.id})")
        print(f"📅 Criada em: {latest.created_at}")
        print(f"👤 Autor: {latest.author.username}")
    
    # 3. Testar API diretamente
    client = Client()
    
    # Login
    user = User.objects.filter(is_superuser=True).first()
    if user:
        token, created = Token.objects.get_or_create(user=user)
        print(f"🔑 Token: {token.key[:10]}...")
        
        # Teste GET
        response = client.get(
            f'/api/v1/tracking/projects/Joel/updates/',
            HTTP_AUTHORIZATION=f'Token {token.key}'
        )
        
        print(f"🌐 API GET Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"📊 API Response Count: {data.get('count', 0)}")
            print(f"📄 Results Length: {len(data.get('results', []))}")
            
            if data.get('results'):
                for i, update in enumerate(data['results'][:3]):
                    print(f"  {i+1}. {update['title']} (ID: {update['id']})")
        
        # Teste POST de nova update
        print("\n📤 Testando criação de nova update...")
        post_data = {
            'title': f'Update de Teste {datetime.now().strftime("%H:%M:%S")}',
            'description': 'Descrição de teste para verificar se está funcionando',
            'type': 'progress',
            'status': 'published',
            'people_impacted': 50,
            'budget_spent': 1000.00,
            'progress_percentage': 75
        }
        
        post_response = client.post(
            f'/api/v1/tracking/projects/Joel/updates/',
            data=json.dumps(post_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Token {token.key}'
        )
        
        print(f"📤 POST Status: {post_response.status_code}")
        if post_response.status_code == 201:
            new_update = post_response.json()
            print(f"✅ Update criada: {new_update['title']} (ID: {new_update['id']})")
            
            # Verificar se aparece imediatamente
            immediate_check = client.get(
                f'/api/v1/tracking/projects/Joel/updates/',
                HTTP_AUTHORIZATION=f'Token {token.key}'
            )
            
            if immediate_check.status_code == 200:
                immediate_data = immediate_check.json()
                print(f"🔄 Verificação imediata - Count: {immediate_data.get('count', 0)}")
                
                # Procurar a update recém-criada
                found = False
                for update in immediate_data.get('results', []):
                    if update['id'] == new_update['id']:
                        found = True
                        print(f"✅ Update encontrada na listagem!")
                        break
                
                if not found:
                    print(f"❌ Update não encontrada na listagem!")
                    
                    # Debug adicional
                    print("\n🔍 DEBUG ADICIONAL:")
                    all_updates = ProjectUpdate.objects.filter(project=project)
                    print(f"Total updates no banco: {all_updates.count()}")
                    
                    latest_update = ProjectUpdate.objects.filter(id=new_update['id']).first()
                    if latest_update:
                        print(f"Update {new_update['id']} existe no banco: {latest_update.title}")
                        print(f"Projeto da update: {latest_update.project.slug}")
                        print(f"Related name funcionando: {project.tracking_updates.filter(id=new_update['id']).exists()}")
        else:
            print(f"❌ Erro na criação: {post_response.content.decode()}")
    
    print("\n" + "=" * 50)
    print("TESTE CONCLUÍDO")

if __name__ == '__main__':
    test_full_system()
