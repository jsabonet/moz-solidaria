#!/usr/bin/env python3
"""
Teste para simular exatamente o que o frontend está fazendo
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

import requests
import json
from datetime import datetime

BASE_URL = 'http://localhost:8000'

def test_frontend_flow():
    """Simula exatamente o fluxo do frontend"""
    print("=== TESTE: SIMULAÇÃO DO FLUXO DO FRONTEND ===")
    
    # 1. Obter token
    print("1. Obtendo token...")
    auth_response = requests.post(f'{BASE_URL}/api/v1/auth/token/', {
        'username': 'admin',
        'password': 'admin123'
    })
    
    if auth_response.status_code != 200:
        print(f"   ❌ Erro na autenticação: {auth_response.status_code}")
        return
    
    token = auth_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    print("   ✅ Token obtido")
    
    # 2. Buscar dados completos do projeto (como o frontend faz)
    print("2. Buscando dados completos do projeto...")
    tracking_response = requests.get(f'{BASE_URL}/api/v1/tracking/project-tracking/Joel/', headers=headers)
    
    if tracking_response.status_code != 200:
        print(f"   ❌ Erro ao buscar dados do projeto: {tracking_response.status_code}")
        print(f"   Resposta: {tracking_response.text}")
        return
    
    project_data = tracking_response.json()
    updates_before = len(project_data.get('updates', []))
    print(f"   ✅ Dados do projeto obtidos")
    print(f"   📊 Updates antes: {updates_before}")
    print(f"   📊 Total updates: {project_data.get('total_updates', 'N/A')}")
    
    # 3. Criar nova atualização (como o frontend faz)
    print("3. Criando nova atualização...")
    timestamp = datetime.now().strftime("%H:%M:%S")
    new_update_data = {
        "title": f"Teste Frontend {timestamp}",
        "description": "Simulando criação via frontend",
        "type": "progress",
        "status": "published",
        "people_impacted": 150,
        "budget_spent": "1500.00",
        "progress_percentage": 80
    }
    
    create_response = requests.post(
        f'{BASE_URL}/api/v1/tracking/projects/Joel/updates/',
        json=new_update_data,
        headers=headers
    )
    
    if create_response.status_code != 201:
        print(f"   ❌ Erro ao criar update: {create_response.status_code}")
        print(f"   Resposta: {create_response.text}")
        return
    
    created_update = create_response.json()
    print(f"   ✅ Update criado: ID {created_update['id']}")
    
    # 4. Buscar dados atualizados do projeto (como o frontend faz após criar)
    print("4. Buscando dados atualizados...")
    updated_tracking_response = requests.get(f'{BASE_URL}/api/v1/tracking/project-tracking/Joel/', headers=headers)
    
    if updated_tracking_response.status_code != 200:
        print(f"   ❌ Erro ao buscar dados atualizados: {updated_tracking_response.status_code}")
        return
    
    updated_project_data = updated_tracking_response.json()
    updates_after = len(updated_project_data.get('updates', []))
    print(f"   ✅ Dados atualizados obtidos")
    print(f"   📊 Updates depois: {updates_after}")
    print(f"   📊 Total updates: {updated_project_data.get('total_updates', 'N/A')}")
    
    # 5. Verificar se o novo update aparece na lista
    print("5. Verificando se o novo update aparece...")
    found_update = None
    for update in updated_project_data.get('updates', []):
        if update['id'] == created_update['id']:
            found_update = update
            break
    
    if found_update:
        print(f"   ✅ Novo update encontrado na lista: '{found_update['title']}'")
    else:
        print(f"   ❌ Novo update NÃO encontrado na lista!")
        print(f"   🔍 IDs na lista: {[u['id'] for u in updated_project_data.get('updates', [])]}")
    
    # 6. Testar endpoint direto de updates
    print("6. Testando endpoint direto de updates...")
    direct_updates_response = requests.get(f'{BASE_URL}/api/v1/tracking/projects/Joel/updates/', headers=headers)
    
    if direct_updates_response.status_code == 200:
        direct_updates = direct_updates_response.json()
        direct_count = direct_updates['count']
        print(f"   ✅ Endpoint direto funcionando: {direct_count} updates")
        
        # Verificar se o novo update está no endpoint direto
        found_in_direct = False
        for update in direct_updates['results']:
            if update['id'] == created_update['id']:
                found_in_direct = True
                break
        
        if found_in_direct:
            print(f"   ✅ Novo update encontrado no endpoint direto")
        else:
            print(f"   ❌ Novo update NÃO encontrado no endpoint direto")
    else:
        print(f"   ❌ Erro no endpoint direto: {direct_updates_response.status_code}")
    
    print("\n=== RESUMO ===")
    print(f"Updates antes da criação: {updates_before}")
    print(f"Updates depois da criação: {updates_after}")
    print(f"Diferença: {updates_after - updates_before}")
    print(f"Update encontrado na lista consolidada: {'✅' if found_update else '❌'}")
    print(f"Update encontrado no endpoint direto: {'✅' if found_in_direct else '❌'}")
    
    if found_update and found_in_direct and updates_after > updates_before:
        print("\n🎉 TUDO FUNCIONANDO CORRETAMENTE!")
    else:
        print("\n⚠️ PROBLEMA IDENTIFICADO - Verificar logs do backend")

if __name__ == "__main__":
    test_frontend_flow()
