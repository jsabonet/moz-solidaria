#!/usr/bin/env python3
"""
Script para testar criação de projetos via API
"""
import requests
import json

BASE_URL = 'http://localhost:8000'

def get_auth_token():
    """Obtém token de autenticação"""
    try:
        login_data = {
            'username': 'admin',
            'password': 'admin123'
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/token/", data=login_data)
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print(f"❌ Erro no login: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ Exceção no login: {e}")
        return None

def test_create_project():
    print("🧪 Testando criação de projeto via API\n")
    
    # Obter token
    token = get_auth_token()
    if not token:
        print("❌ Não foi possível obter token de autenticação")
        return
    
    print("✅ Token obtido com sucesso")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Testar criação de projeto
    project_data = {
        'name': 'Projeto Teste API',
        'short_description': 'Projeto criado via API para testar as correções',
        'description': 'Este é um projeto de teste criado para verificar se as correções no CreateProject.tsx estão funcionando corretamente.',
        'goal_amount': '50000.00',
        'start_date': '2025-08-10',
        'end_date': '2025-12-31',
        'status': 'active',
        'program_id': 1,  # Assumindo que existe um programa com ID 1
        'location': 'Maputo, Moçambique'
    }
    
    print("📝 Criando projeto...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/projects/admin/projects/",
            headers=headers,
            data=json.dumps(project_data)
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"   ✅ Projeto criado: {data.get('name', 'N/A')}")
            print(f"   📊 ID: {data.get('id', 'N/A')}")
            print(f"   🔗 Slug: {data.get('slug', 'N/A')}")
            print(f"   📅 Data início: {data.get('start_date', 'N/A')}")
            print(f"   📅 Data fim: {data.get('end_date', 'N/A')}")
            return data.get('id')
        else:
            print(f"   ❌ Erro: {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Exceção: {e}")
        return None

if __name__ == "__main__":
    test_create_project()
