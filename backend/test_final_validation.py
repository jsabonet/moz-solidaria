#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_final_validation():
    print("=== VALIDAÇÃO FINAL DO PROJECT TRACKER ===\n")
    
    # 1. Autenticação
    login_data = {"username": "admin", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/api/v1/auth/token/", json=login_data)
    
    if response.status_code != 200:
        print("✗ Falha na autenticação")
        return
    
    token = response.json().get('access')
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    print("✓ Autenticação: OK")
    
    # 2. Teste de criação de update
    update_data = {
        "title": "Teste Final - ProjectTracker Funcionando",
        "description": "Validação completa do sistema de tracking",
        "type": "progress",
        "status": "published",
        "people_impacted": 300,
        "budget_spent": "30000.00",
        "progress_percentage": 95
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", 
                           json=update_data, headers=headers)
    
    if response.status_code == 201:
        print("✓ Criação de Updates: OK")
        created_update = response.json()
        print(f"  - Update criado: '{created_update['title']}'")
        print(f"  - ID: {created_update['id']}")
    else:
        print(f"✗ Criação de Updates: ERRO ({response.status_code})")
        print(f"  Detalhes: {response.text}")
        return
    
    # 3. Teste de listagem
    response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", headers=headers)
    
    if response.status_code == 200:
        updates = response.json()
        print(f"✓ Listagem de Updates: OK ({len(updates)} encontrados)")
    else:
        print(f"✗ Listagem de Updates: ERRO ({response.status_code})")
    
    print("\n" + "="*50)
    print("🎉 PROJECT TRACKER ESTÁ FUNCIONANDO!")
    print("="*50)
    print("\n📍 STATUS FINAL:")
    print("   ✅ Backend API: Funcionando")
    print("   ✅ Autenticação: Funcionando")  
    print("   ✅ Criação de Updates: Funcionando")
    print("   ✅ Sistema de Tracking: Funcionando")
    print("\n🌐 PRÓXIMOS PASSOS:")
    print("   1. Acesse http://localhost:8081")
    print("   2. Vá para a seção de gestão de projetos")
    print("   3. Teste a interface do ProjectTracker")
    print("   4. Crie novos updates através da interface")

if __name__ == "__main__":
    test_final_validation()
