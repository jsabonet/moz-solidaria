#!/usr/bin/env python3
"""
Teste simples da API REST para marcos
"""
import requests
import json
from datetime import datetime

def test_simple_milestone_api():
    """Testar API REST de marcos"""
    print("=== TESTE SIMPLES: API REST DE MARCOS ===")
    
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
            
            # Mostrar alguns marcos
            if data:
                print(f"\n📋 Primeiro marco:")
                first = data[0]
                print(f"   • {first.get('title', 'N/A')} ({first.get('status', 'N/A')})")
        
        # 2. POST - Criar novo marco
        print(f"\n✨ Testando POST /api/v1/tracking/projects/{project_slug}/milestones/")
        
        new_milestone_data = {
            "title": f"Marco API Teste {datetime.now().strftime('%H:%M:%S')}",
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
            print(f"   ✅ Marco criado: {created_milestone.get('title', 'N/A')}")
            print(f"   ID: {created_milestone.get('id', 'N/A')}")
        else:
            print(f"   ❌ Erro na criação:")
            print(f"   Response: {response.text[:200]}")
        
        print(f"\n✅ Teste da API concluído!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Servidor Django não está rodando!")
        print("   Execute: python manage.py runserver")
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_simple_milestone_api()
