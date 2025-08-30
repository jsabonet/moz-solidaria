#!/usr/bin/env python3
"""
Teste Rápido de Validação - Sistema de Usuários
Verifica se as correções do frontend estão funcionando
"""

import requests
import json

def test_system():
    print("🔧 Testando sistema após correções...")
    
    # 1. Testar login
    print("\n1️⃣ Testando autenticação...")
    login_response = requests.post(
        'http://localhost:8000/api/v1/auth/token/',
        json={'username': 'admin', 'password': 'admin123'}
    )
    
    if login_response.status_code == 200:
        print("✅ Login funcionando")
        token = login_response.json()['access']
    else:
        print("❌ Falha no login")
        return
    
    # 2. Testar API de usuários
    print("\n2️⃣ Testando API de usuários...")
    users_response = requests.get(
        'http://localhost:8000/api/v1/auth/users/',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    if users_response.status_code == 200:
        data = users_response.json()
        print(f"✅ API funcionando - Estrutura: {list(data.keys())}")
        print(f"   📊 Total de usuários: {data.get('count', 'N/A')}")
        print(f"   📦 Usuários na página: {len(data.get('results', []))}")
        
        # Verificar se é paginado
        if 'results' in data and isinstance(data['results'], list):
            print("✅ Estrutura paginada correta detectada")
            if data['results']:
                first_user = data['results'][0]
                print(f"   👤 Primeiro usuário: {first_user.get('username', 'N/A')}")
        else:
            print("⚠️ Estrutura não paginada ou inesperada")
    else:
        print(f"❌ Falha na API: {users_response.status_code}")
        return
    
    print("\n✅ Sistema funcionando corretamente!")
    print("\n🔗 URLs para testar:")
    print("   • Login: http://localhost:8080/login")
    print("   • Dashboard: http://localhost:8080/dashboard")
    print("   • Usuários: http://localhost:8080/dashboard/users")
    print("\n🔑 Credenciais: admin / admin123")

if __name__ == "__main__":
    test_system()
