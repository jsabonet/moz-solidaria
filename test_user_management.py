#!/usr/bin/env python3
"""
Teste do sistema de gerenciamento de usuários
"""

import requests
import json

API_BASE = "http://localhost:8000/api/v1"

def test_user_management():
    """Testar endpoints de gerenciamento de usuários"""
    print("🔍 TESTANDO SISTEMA DE GERENCIAMENTO DE USUÁRIOS")
    print("=" * 60)
    
    # 1. Login para obter token
    print("🔑 Fazendo login...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/token/", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data['access']
            print("✅ Login realizado com sucesso!")
        else:
            print(f"❌ Erro no login: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        return
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # 2. Testar listagem de usuários
    print("\n👥 Testando listagem de usuários...")
    try:
        response = requests.get(f"{API_BASE}/auth/users/", headers=headers)
        if response.status_code == 200:
            users = response.json()
            print(f"✅ {len(users['results'] if 'results' in users else users)} usuários encontrados")
            
            # Mostrar alguns usuários
            user_list = users['results'] if 'results' in users else users
            for i, user in enumerate(user_list[:3]):
                print(f"   {i+1}. {user['username']} ({user['email']}) - Staff: {user['is_staff']}")
        else:
            print(f"❌ Erro ao listar usuários: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Erro na listagem: {e}")
    
    # 3. Testar estatísticas
    print("\n📊 Testando estatísticas de usuários...")
    try:
        response = requests.get(f"{API_BASE}/auth/users/stats/", headers=headers)
        if response.status_code == 200:
            stats = response.json()
            print("✅ Estatísticas obtidas:")
            print(f"   Total: {stats.get('total', 0)}")
            print(f"   Ativos: {stats.get('active', 0)}")
            print(f"   Staff: {stats.get('staff', 0)}")
            print(f"   Superusuários: {stats.get('superuser', 0)}")
        else:
            print(f"❌ Erro ao obter estatísticas: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Erro nas estatísticas: {e}")
    
    # 4. Testar permissões disponíveis
    print("\n🔒 Testando permissões disponíveis...")
    try:
        response = requests.get(f"{API_BASE}/auth/users/available_permissions/", headers=headers)
        if response.status_code == 200:
            permissions = response.json()
            print(f"✅ {len(permissions)} permissões disponíveis")
            
            # Mostrar algumas permissões
            for i, perm in enumerate(permissions[:5]):
                print(f"   {i+1}. {perm['codename']} - {perm['name']}")
        else:
            print(f"❌ Erro ao obter permissões: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Erro nas permissões: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 TESTE CONCLUÍDO!")

if __name__ == "__main__":
    test_user_management()
