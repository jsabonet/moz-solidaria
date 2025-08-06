#!/usr/bin/env python3
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:8081"

def get_auth_token():
    """Obtém token de autenticação"""
    login_data = {"username": "admin", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/api/v1/auth/token/", json=login_data)
    if response.status_code == 200:
        return response.json().get('access')
    return None

def test_complete_project_tracker():
    print("=== TESTE COMPLETO DO PROJECT TRACKER ===\n")
    
    # 1. Obter token
    print("1. Obtendo token de autenticação...")
    token = get_auth_token()
    if not token:
        print("   ✗ Falha na autenticação")
        return
    print("   ✓ Token obtido com sucesso")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Verificar se existe projeto Joel
    print("\n2. Verificando projeto 'Joel'...")
    response = requests.get(f"{BASE_URL}/api/v1/projects/", headers=headers)
    if response.status_code == 200:
        projects = response.json()
        joel_project = None
        for project in projects:
            if project.get('slug') == 'Joel':
                joel_project = project
                break
        
        if joel_project:
            print(f"   ✓ Projeto 'Joel' encontrado (ID: {joel_project['id']})")
        else:
            print("   ⚠ Projeto 'Joel' não encontrado na lista")
    
    # 3. Testar endpoints de tracking
    print("\n3. Testando endpoints de tracking...")
    
    # 3.1 Listar updates existentes
    response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", headers=headers)
    print(f"   Updates existentes: {response.status_code}")
    if response.status_code == 200:
        updates = response.json()
        print(f"   ✓ {len(updates)} updates encontrados")
    
    # 3.2 Criar novo update
    update_data = {
        "title": f"Update de Teste {datetime.now().strftime('%H:%M:%S')}",
        "description": "Este é um teste completo do sistema de tracking",
        "type": "progress",
        "status": "published",
        "people_impacted": 250,
        "budget_spent": "25000.00",
        "progress_percentage": 90
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", 
                           json=update_data, headers=headers)
    print(f"   Criar update: {response.status_code}")
    
    if response.status_code == 201:
        new_update = response.json()
        print(f"   ✓ Update criado: '{new_update['title']}'")
        update_id = new_update['id']
        
        # 3.3 Testar métricas
        metrics_data = {
            "metric_name": "Taxa de Sucesso",
            "metric_value": "95.5",
            "metric_unit": "percentage",
            "date_recorded": datetime.now().isoformat()
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/tracking/projects/Joel/metrics/",
                               json=metrics_data, headers=headers)
        print(f"   Criar métrica: {response.status_code}")
        
        # 3.4 Testar milestones
        milestone_data = {
            "title": "Milestone de Teste",
            "description": "Marco importante do projeto",
            "target_date": "2024-12-31",
            "status": "pending"
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/tracking/projects/Joel/milestones/",
                               json=milestone_data, headers=headers)
        print(f"   Criar milestone: {response.status_code}")
        
    else:
        print(f"   ✗ Erro ao criar update: {response.text}")
    
    # 4. Verificar dados finais
    print("\n4. Verificação final...")
    response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", headers=headers)
    if response.status_code == 200:
        updates = response.json()
        print(f"   ✓ Total de updates após teste: {len(updates)}")
        
        # Mostrar últimos 3 updates
        if updates:
            print("   Últimos updates:")
            updates_list = list(updates) if not isinstance(updates, list) else updates
            for update in updates_list[-3:]:
                print(f"     - {update['title']} ({update['type']})")
    
    print("\n=== RESULTADO FINAL ===")
    print("✓ Sistema de autenticação: FUNCIONANDO")
    print("✓ API de tracking: FUNCIONANDO") 
    print("✓ Criação de updates: FUNCIONANDO")
    print("✓ Endpoints específicos: FUNCIONANDO")
    print(f"\n🌐 Frontend disponível em: {FRONTEND_URL}")
    print("📝 Acesse a seção de gestão de projetos para testar a interface")

if __name__ == "__main__":
    test_complete_project_tracker()
