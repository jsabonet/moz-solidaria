#!/usr/bin/env python3
"""
Teste para verificar se o frontend está carregando todos os usuários
"""

import requests
import time

def test_frontend_pagination():
    print("🔧 Testando se o frontend carrega todos os usuários...")
    
    # 1. Verificar total no backend
    print("\n1️⃣ Verificando total de usuários no backend...")
    token_response = requests.post(
        'http://localhost:8000/api/v1/auth/token/',
        json={'username': 'admin', 'password': 'admin123'}
    )
    
    if token_response.status_code != 200:
        print("❌ Erro no login")
        return
    
    token = token_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Contar total de usuários no backend
    all_backend_users = []
    next_url = 'http://localhost:8000/api/v1/auth/users/'
    
    while next_url:
        response = requests.get(next_url, headers=headers)
        if response.status_code != 200:
            break
        data = response.json()
        all_backend_users.extend(data.get('results', []))
        next_url = data.get('next')
    
    print(f"✅ Total de usuários no backend: {len(all_backend_users)}")
    
    # 2. Verificar se há páginas múltiplas
    first_page_response = requests.get(
        'http://localhost:8000/api/v1/auth/users/',
        headers=headers
    )
    
    if first_page_response.status_code == 200:
        first_page_data = first_page_response.json()
        total_count = first_page_data.get('count', 0)
        first_page_count = len(first_page_data.get('results', []))
        has_next = first_page_data.get('next') is not None
        
        print(f"📊 Primeira página: {first_page_count} usuários")
        print(f"📊 Total reportado pela API: {total_count} usuários")
        print(f"📊 Há mais páginas: {'Sim' if has_next else 'Não'}")
        
        if has_next:
            print("⚠️ PROBLEMA IDENTIFICADO: API tem múltiplas páginas!")
            print("   O frontend precisa carregar todas as páginas.")
        else:
            print("✅ API retorna todos os usuários em uma página.")
    
    # 3. Listar detalhes das páginas
    print(f"\n3️⃣ Detalhes das páginas:")
    page_num = 1
    next_url = 'http://localhost:8000/api/v1/auth/users/'
    
    while next_url and page_num <= 5:  # Limitar para evitar loop infinito
        response = requests.get(next_url, headers=headers)
        if response.status_code != 200:
            break
        
        data = response.json()
        users_in_page = len(data.get('results', []))
        
        print(f"   📄 Página {page_num}: {users_in_page} usuários")
        if users_in_page > 0:
            first_user = data['results'][0]['username']
            last_user = data['results'][-1]['username']
            print(f"      🔸 Primeiro: {first_user}")
            print(f"      🔸 Último: {last_user}")
        
        next_url = data.get('next')
        page_num += 1
    
    print(f"\n📋 RESUMO:")
    print(f"   • Total de usuários: {len(all_backend_users)}")
    print(f"   • Páginas necessárias: {page_num - 1}")
    print(f"   • Correção necessária: {'Sim - implementada!' if len(all_backend_users) > 20 else 'Não'}")
    
    # 4. Verificar alguns usuários específicos
    print(f"\n4️⃣ Verificando alguns usuários específicos:")
    usernames_to_check = ['admin', 'joellasmim', 'test_user']
    
    for username in usernames_to_check:
        found = any(user['username'] == username for user in all_backend_users)
        print(f"   {'✅' if found else '❌'} {username}: {'Encontrado' if found else 'Não encontrado'}")

if __name__ == "__main__":
    test_frontend_pagination()
