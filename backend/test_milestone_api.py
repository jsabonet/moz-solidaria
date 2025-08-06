#!/usr/bin/env python3
"""
Teste da API REST para marcos
"""
import requests
import json
from datetime import datetime

def test_milestone_api():
    """Testar API REST de marcos"""
    print("=== TESTE: API REST DE MARCOS ===")
    
    base_url = "http://localhost:8000"
    project_slug = "Joel"
    
    try:
        # 1. GET - Listar marcos
        print(f"\n🔍 Testando GET /api/v1/tracking/projects/{project_slug}/milestones/")
        url = f"{base_url}/api/v1/tracking/projects/{project_slug}/milestones/"
        response = requests.get(url)
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Marcos encontrados: {len(data)}")
            
            # Mostrar os últimos 3 marcos
            print(f"\n📋 Últimos marcos:")
            for milestone in data[-3:]:
                print(f"   • {milestone['title']} ({milestone['status']})")
        
        # 2. POST - Criar novo marco
        print(f"\n✨ Testando POST /api/v1/tracking/projects/{project_slug}/milestones/")
        
        new_milestone_data = {
            "title": f"Marco via API {datetime.now().strftime('%H:%M:%S')}",
            "description": "Marco criado via API REST para teste",
            "target_date": "2025-08-20",
            "status": "pending",
            "progress": 0,
            "order": 100
        }
        
        response = requests.post(
            url,
            json=new_milestone_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            created_milestone = response.json()
            print(f"   ✅ Marco criado: {created_milestone['title']}")
            print(f"   ID: {created_milestone['id']}")
        else:
            print(f"   ❌ Erro na criação:")
            print(f"   Response: {response.text}")
        
        print(f"\n✅ Teste da API concluído!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Servidor Django não está rodando!")
        print("   Execute: python manage.py runserver")
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_milestone_api()
