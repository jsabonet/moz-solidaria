#!/usr/bin/env python3
# test_consolidated_auth.py - Testar sistema de autenticação consolidado

import requests
import json

API_BASE = 'http://localhost:8000/api/v1'
USERNAME = 'admin'
PASSWORD = 'admin123'

def test_jwt_login():
    """Testar login JWT"""
    print("🔐 Testando login JWT...")
    
    response = requests.post(f'{API_BASE}/auth/token/', json={
        'username': USERNAME,
        'password': PASSWORD
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login JWT bem-sucedido")
        print(f"   Access token (50 chars): {data['access'][:50]}...")
        print(f"   Refresh token exists: {bool(data.get('refresh'))}")
        return data['access']
    else:
        print(f"❌ Login JWT falhou: {response.status_code} - {response.text}")
        return None

def test_user_endpoint(token):
    """Testar endpoint de usuário"""
    print("\n👤 Testando endpoint /auth/user/...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f'{API_BASE}/auth/user/', headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Dados do usuário obtidos:")
        print(f"   ID: {user_data.get('id')}")
        print(f"   Username: {user_data.get('username')}")
        print(f"   Email: {user_data.get('email')}")
        print(f"   Is Staff: {user_data.get('is_staff')}")
        print(f"   Is Superuser: {user_data.get('is_superuser')}")
        return user_data
    else:
        print(f"❌ Erro ao obter dados do usuário: {response.status_code} - {response.text}")
        return None

def test_protected_endpoints(token):
    """Testar endpoints protegidos"""
    print("\n🔒 Testando endpoints protegidos...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    endpoints = [
        '/blog/posts/',
        '/projects/admin/projects/',
        '/donations/statistics/',
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f'{API_BASE}{endpoint}', headers=headers)
            status = "✅" if response.status_code in [200, 201] else "❌"
            print(f"   {status} {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"   ❌ {endpoint}: Erro - {e}")

def main():
    print("🔍 TESTE DO SISTEMA DE AUTENTICAÇÃO CONSOLIDADO")
    print("=" * 50)
    
    # 1. Testar login JWT
    token = test_jwt_login()
    
    if not token:
        print("❌ Não foi possível obter token, interrompendo testes")
        return
    
    # 2. Testar endpoint de usuário
    user_data = test_user_endpoint(token)
    
    if not user_data:
        print("❌ Não foi possível obter dados do usuário, interrompendo testes")
        return
    
    # 3. Testar endpoints protegidos
    test_protected_endpoints(token)
    
    print("\n🎉 Testes concluídos!")
    print("\nℹ️  Para testar no frontend:")
    print("1. Acesse http://localhost:8083/login")
    print("2. Faça login com admin/admin123")
    print("3. Acesse http://localhost:8083/dashboard")
    print("4. Verifique se todos os dados carregam corretamente")

if __name__ == '__main__':
    main()
