#!/usr/bin/env python3
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def debug_updates_issue():
    print("=== DEBUG: INVESTIGANDO PROBLEMA DAS ATUALIZAÇÕES ===\n")
    
    # 1. Obter token
    print("1. Obtendo token...")
    login_data = {"username": "admin", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/api/v1/auth/token/", json=login_data)
    
    if response.status_code != 200:
        print(f"   ✗ Erro no login: {response.text}")
        return
    
    token = response.json().get('access')
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("   ✓ Token obtido")
    
    # 2. Listar updates ANTES da criação
    print("\n2. Listando updates ANTES da criação...")
    response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", headers=headers)
    if response.status_code == 200:
        updates_before = response.json()
        print(f"   Updates antes: {len(updates_before)}")
        if isinstance(updates_before, list) and len(updates_before) > 0:
            for update in updates_before[-3:]:  # Últimos 3
                print(f"     - ID: {update.get('id')}, Título: {update.get('title')}")
        else:
            print(f"   Tipo de resposta: {type(updates_before)}")
            print(f"   Conteúdo: {updates_before}")
    else:
        print(f"   Erro ao listar: {response.status_code} - {response.text}")
        updates_before = []
    
    # 3. Criar novo update
    print("\n3. Criando novo update...")
    timestamp = datetime.now().strftime('%H:%M:%S')
    update_data = {
        "title": f"Teste Debug {timestamp}",
        "description": "Este é um teste para investigar o problema",
        "type": "progress",
        "status": "published",
        "people_impacted": 999,
        "budget_spent": "99999.00",
        "progress_percentage": 88
    }
    
    print(f"   Dados enviados: {json.dumps(update_data, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", 
                           json=update_data, headers=headers)
    
    print(f"   Status da criação: {response.status_code}")
    
    if response.status_code == 201:
        created_update = response.json()
        print(f"   ✓ Update criado!")
        print(f"   Resposta completa: {json.dumps(created_update, indent=2)}")
        
        created_id = created_update.get('id')
        
        # 4. Listar updates DEPOIS da criação
        print("\n4. Listando updates DEPOIS da criação...")
        response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/", headers=headers)
        if response.status_code == 200:
            updates_after = response.json()
            print(f"   Updates depois: {len(updates_after)}")
            
            if isinstance(updates_after, list):
                # Procurar o update recém-criado
                found = False
                for update in updates_after:
                    if update.get('id') == created_id:
                        found = True
                        print(f"   ✓ Update encontrado na lista: ID {created_id}")
                        break
                
                if not found:
                    print(f"   ✗ Update NÃO encontrado na lista! ID procurado: {created_id}")
                    
                print("   Últimos 3 updates:")
                for update in updates_after[-3:]:
                    print(f"     - ID: {update.get('id')}, Título: {update.get('title')}")
            else:
                print(f"   Tipo inesperado: {type(updates_after)}")
                print(f"   Conteúdo: {updates_after}")
        else:
            print(f"   Erro ao listar depois: {response.status_code} - {response.text}")
    
        # 5. Tentar buscar diretamente pelo ID
        if created_id:
            print(f"\n5. Tentando buscar update específico ID {created_id}...")
            response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/{created_id}/", headers=headers)
            print(f"   Status busca direta: {response.status_code}")
            if response.status_code == 200:
                print("   ✓ Update encontrado na busca direta")
            else:
                print(f"   ✗ Update NÃO encontrado na busca direta: {response.text}")
    
    else:
        print(f"   ✗ Erro na criação: {response.text}")
    
    # 6. Verificar endpoint de tracking geral
    print("\n6. Verificando endpoint de tracking geral...")
    response = requests.get(f"{BASE_URL}/api/v1/tracking/project-tracking/Joel/", headers=headers)
    if response.status_code == 200:
        tracking_data = response.json()
        updates_in_tracking = tracking_data.get('updates', [])
        print(f"   Updates no tracking geral: {len(updates_in_tracking)}")
        
        if created_id:
            found_in_tracking = any(u.get('id') == created_id for u in updates_in_tracking)
            print(f"   Update {created_id} encontrado no tracking: {found_in_tracking}")

if __name__ == "__main__":
    debug_updates_issue()
