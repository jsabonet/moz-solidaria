#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("=== Teste dos Endpoints da API ===\n")
    
    # 1. Testar endpoint de tracking do projeto
    print("1. Testando GET /api/v1/tracking/project-tracking/Joel/")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/tracking/project-tracking/Joel/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Projeto: {data.get('name', 'N/A')}")
            print(f"   Updates: {len(data.get('updates', []))}")
            print(f"   Milestones: {len(data.get('milestones', []))}")
        else:
            print(f"   Erro: {response.text}")
    except Exception as e:
        print(f"   Erro de conexão: {e}")
    
    print()
    
    # 2. Testar endpoint de updates
    print("2. Testando GET /api/v1/tracking/projects/Joel/updates/")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Updates encontrados: {len(data.get('results', data if isinstance(data, list) else []))}")
        else:
            print(f"   Erro: {response.text}")
    except Exception as e:
        print(f"   Erro de conexão: {e}")
    
    print()
    
    # 3. Testar criação de update (sem autenticação - deve falhar)
    print("3. Testando POST /api/v1/tracking/projects/Joel/updates/ (sem auth)")
    try:
        update_data = {
            "title": "Update de teste via API",
            "description": "Este é um teste da API de updates",
            "type": "progress",
            "status": "published"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 401:
            print("   ✓ Autenticação necessária (como esperado)")
        elif response.status_code == 201:
            print("   ✓ Update criado com sucesso")
        else:
            print(f"   Erro: {response.text}")
    except Exception as e:
        print(f"   Erro de conexão: {e}")

if __name__ == "__main__":
    test_api()
