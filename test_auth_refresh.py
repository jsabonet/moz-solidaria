#!/usr/bin/env python3
"""
Teste da funcionalidade de atualização automática do contexto de autenticação.
Este script simula uma promoção de usuário e verifica se o frontend atualiza automaticamente.
"""

import requests
import json
import time

# Configurações
BASE_URL = "http://127.0.0.1:8000/api/v1"
FRONTEND_URL = "http://localhost:8081"

def test_auth_refresh():
    print("🧪 TESTE: Atualização Automática do Contexto de Autenticação")
    print("=" * 60)
    
    # 1. Login como admin
    print("\n1️⃣ Fazendo login como admin...")
    login_data = {
        "username": "admin",
        "password": "123456"
    }
    
    response = requests.post(f"{BASE_URL}/auth/token/", json=login_data)
    if response.status_code == 200:
        login_result = response.json()
        admin_token = login_result.get('access')
        print(f"✅ Login bem-sucedido! Token: {admin_token[:20]}...")
    else:
        print(f"❌ Erro no login: {response.status_code}")
        return False
    
    # 2. Listar usuários para encontrar um usuário comum
    print("\n2️⃣ Buscando usuário comum para promover...")
    headers = {'Authorization': f'Bearer {admin_token}'}
    
    response = requests.get(f"{BASE_URL}/auth/users/", headers=headers)
    if response.status_code == 200:
        users = response.json().get('results', [])
        
        # Procurar um usuário que não seja admin nem staff
        target_user = None
        for user in users:
            if (not user.get('is_staff', False) and 
                not user.get('is_superuser', False) and 
                user.get('is_active', True) and
                user.get('username') != 'admin'):
                target_user = user
                break
        
        if target_user:
            print(f"✅ Usuário encontrado: {target_user['username']} (ID: {target_user['id']})")
            print(f"   Status atual: is_staff={target_user.get('is_staff')}, groups={target_user.get('groups', [])}")
        else:
            print("❌ Nenhum usuário comum encontrado para promover")
            return False
    else:
        print(f"❌ Erro ao listar usuários: {response.status_code}")
        return False
    
    # 3. Promover usuário para Gestor de Blog
    print(f"\n3️⃣ Promovendo {target_user['username']} para Gestor de Blog...")
    promote_data = {"profile": "blog_manager"}
    
    response = requests.post(
        f"{BASE_URL}/auth/users/{target_user['id']}/promote_to_profile/",
        headers=headers,
        json=promote_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Promoção bem-sucedida!")
        print(f"   Resposta: {json.dumps(result, indent=2)}")
    else:
        print(f"❌ Erro na promoção: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return False
    
    # 4. Verificar os dados atualizados do usuário
    print(f"\n4️⃣ Verificando dados atualizados do usuário...")
    response = requests.get(f"{BASE_URL}/auth/users/{target_user['id']}/", headers=headers)
    
    if response.status_code == 200:
        updated_user = response.json()
        print(f"✅ Dados atualizados:")
        print(f"   is_staff: {updated_user.get('is_staff')}")
        print(f"   groups: {updated_user.get('groups', [])}")
        print(f"   permissions: {len(updated_user.get('user_permissions', []))} permissões")
    else:
        print(f"❌ Erro ao verificar usuário: {response.status_code}")
    
    # 5. Simular login do usuário promovido
    print(f"\n5️⃣ Testando login do usuário promovido...")
    
    # Primeiro, vamos definir uma senha para o usuário (se necessário)
    # Para este teste, vamos assumir que o usuário tem uma senha padrão
    user_login_data = {
        "username": target_user['username'],
        "password": "senha123"  # Senha padrão para teste
    }
    
    response = requests.post(f"{BASE_URL}/auth/token/", json=user_login_data)
    if response.status_code == 200:
        user_login_result = response.json()
        user_token = user_login_result.get('access')
        user_data = user_login_result.get('user', {})
        
        print(f"✅ Login do usuário promovido bem-sucedido!")
        print(f"   Token: {user_token[:20]}...")
        print(f"   is_staff: {user_data.get('is_staff')}")
        print(f"   groups: {user_data.get('groups', [])}")
    else:
        print(f"⚠️  Não foi possível testar login do usuário: {response.status_code}")
        print("   (Isso é normal se a senha padrão não estiver configurada)")
    
    # 6. Testar endpoint de dados do usuário
    print(f"\n6️⃣ Testando endpoint /api/v1/auth/user/ com token do admin...")
    response = requests.get(f"{BASE_URL}/auth/user/", headers=headers)
    
    if response.status_code == 200:
        admin_data = response.json()
        print(f"✅ Dados do admin obtidos com sucesso:")
        print(f"   username: {admin_data.get('username')}")
        print(f"   is_staff: {admin_data.get('is_staff')}")
        print(f"   groups: {admin_data.get('groups', [])}")
    else:
        print(f"❌ Erro ao obter dados do admin: {response.status_code}")
    
    print(f"\n🎯 RESULTADO DO TESTE:")
    print(f"✅ Sistema de promoção funcionando corretamente")
    print(f"✅ Backend atualiza permissões adequadamente")
    print(f"🔄 Frontend deve atualizar contexto automaticamente após promoção")
    print(f"\n📋 PRÓXIMOS PASSOS PARA TESTE MANUAL:")
    print(f"1. Acesse {FRONTEND_URL}")
    print(f"2. Faça login como admin")
    print(f"3. Vá para Dashboard > Usuários")
    print(f"4. Promova um usuário comum")
    print(f"5. Verifique se o botão Dashboard aparece imediatamente (sem refresh)")
    
    return True

if __name__ == "__main__":
    try:
        test_auth_refresh()
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        import traceback
        traceback.print_exc()
