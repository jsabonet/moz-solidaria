#!/usr/bin/env python3
"""
Script para testar criação de updates via API com autenticação
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
            print(f"❌ Erro no login: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exceção no login: {e}")
        return None

def test_create_update():
    print("🧪 Testando criação de update via API\n")
    
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
    
    # Testar criação para o projeto "futuro-sustentavel"
    update_data = {
        'title': 'Update de teste via API corrigida',
        'description': 'Este é um teste para verificar se a correção dos endpoints funcionou corretamente.',
        'type': 'progress',
        'status': 'published',
        'people_impacted': 25,
        'budget_spent': '5000.00'
    }
    
    print("📝 Criando update para futuro-sustentavel...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/tracking/projects/futuro-sustentavel/updates/",
            headers=headers,
            data=json.dumps(update_data)
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"   ✅ Update criado: {data.get('title', 'N/A')}")
            print(f"   📊 ID: {data.get('id', 'N/A')}")
            return data.get('id')
        else:
            print(f"   ❌ Erro: {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Exceção: {e}")
        return None

def test_list_updates_after_creation():
    print("\n📋 Verificando lista de updates após criação...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/futuro-sustentavel/updates/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if 'results' in data:
                updates = data['results']
                print(f"   ✅ {len(updates)} updates encontrados")
                for update in updates[:3]:
                    print(f"      - {update.get('title', 'N/A')} (ID: {update.get('id', 'N/A')})")
            else:
                print(f"   📊 Resposta: {type(data)}")
        else:
            print(f"   ❌ Erro: {response.text}")
    except Exception as e:
        print(f"   ❌ Exceção: {e}")

if __name__ == "__main__":
    created_id = test_create_update()
    if created_id:
        test_list_updates_after_creation()
