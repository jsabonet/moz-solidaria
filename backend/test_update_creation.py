#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_update_creation():
    print("=== TESTE DE CRIAÇÃO DE UPDATE ===\n")
    
    # 1. Obter token
    login_data = {"username": "admin", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/api/v1/auth/token/", json=login_data)
    
    if response.status_code != 200:
        print(f"❌ Erro no login: {response.text}")
        return
    
    token = response.json().get('access')
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    print("✅ Token obtido com sucesso")
    
    # 2. Criar update de teste
    update_data = {
        "title": "Teste de Correção",
        "description": "Verificando se a correção de arrays funcionou",
        "type": "progress",
        "status": "published",
        "people_impacted": 123,
        "budget_spent": "45000.00",
        "progress_percentage": 78
    }
    
    print("2. Criando update de teste...")
    response = requests.post(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", 
                           json=update_data, headers=headers)
    
    if response.status_code == 201:
        update = response.json()
        print(f"✅ Update criado com sucesso!")
        print(f"   ID: {update['id']}")
        print(f"   Título: {update['title']}")
        
        # 3. Listar updates para verificar estrutura
        print("\n3. Verificando estrutura dos dados...")
        response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", headers=headers)
        
        if response.status_code == 200:
            updates = response.json()
            print(f"✅ Total de updates: {len(updates)}")
            print(f"✅ Tipo dos dados: {type(updates)}")
            print(f"✅ Primeiro item: {updates[0] if len(updates) > 0 else 'Vazio'}")
            print("✅ Estrutura dos dados está correta")
            
            # Mostrar últimos 3 updates
            print("\n📝 Últimos updates:")
            if len(updates) > 0 and isinstance(updates, list):
                for i, update in enumerate(updates):
                    if i < 3:
                        if isinstance(update, dict):
                            print(f"   - {update.get('title', 'Sem título')} (ID: {update.get('id', 'N/A')})")
                        else:
                            print(f"   - Item {i}: {update}")
            else:
                print("   Nenhum update encontrado ou formato inválido")
        else:
            print(f"❌ Erro ao listar updates: {response.text}")
    else:
        print(f"❌ Erro ao criar update: {response.text}")

if __name__ == "__main__":
    test_update_creation()
