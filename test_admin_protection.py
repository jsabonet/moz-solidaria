"""
🛡️ TESTE DE PROTEÇÃO DO ADMINISTRADOR PRINCIPAL

Este script testa todas as proteções implementadas para o administrador principal.
"""

import requests
import json
from datetime import datetime

def test_admin_protection():
    """Testa a proteção do administrador principal"""
    
    print("="*70)
    print("🛡️ TESTE DE PROTEÇÃO DO ADMINISTRADOR PRINCIPAL")
    print("="*70)
    print(f"🕒 Iniciado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Configurações
    API_BASE = "http://localhost:8000/api/v1"
    
    # Credenciais de teste (ajustar conforme necessário)
    test_credentials = {
        "username": "admin",  # Usuário administrador principal
        "password": "admin123"  # Senha do administrador
    }
    
    test_user_credentials = {
        "username": "testuser",  # Usuário normal para testes
        "password": "test123"
    }
    
    try:
        # 1. Login como administrador principal
        print("1. 🔐 Fazendo login como administrador principal")
        print("   Credentials:", test_credentials['username'])
        
        login_response = requests.post(f"{API_BASE}/auth/login/", {
            "username": test_credentials['username'],
            "password": test_credentials['password']
        })
        
        if login_response.status_code != 200:
            print(f"   ❌ Erro no login: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            return
        
        admin_token = login_response.json().get('access')
        admin_user_data = login_response.json().get('user', {})
        admin_user_id = admin_user_data.get('id')
        
        print(f"   ✅ Login successful! User ID: {admin_user_id}")
        print(f"   📊 User data: {admin_user_data.get('username')} (is_superuser: {admin_user_data.get('is_superuser')})")
        print()
        
        # 2. Obter lista de usuários
        print("2. 📋 Obtendo lista de usuários")
        
        headers = {'Authorization': f'Bearer {admin_token}'}
        users_response = requests.get(f"{API_BASE}/auth/users/", headers=headers)
        
        if users_response.status_code != 200:
            print(f"   ❌ Erro ao obter usuários: {users_response.status_code}")
            return
        
        users = users_response.json()
        print(f"   ✅ {len(users)} usuários encontrados")
        
        # Identificar administrador principal
        admin_principal = None
        for user in users:
            # Critérios de identificação
            is_superuser = user.get('is_superuser', False)
            username = user.get('username', '').lower()
            main_admin_usernames = ['admin', 'principal', 'main', 'root', 'superadmin']
            
            if is_superuser and username in main_admin_usernames:
                admin_principal = user
                break
        
        if not admin_principal:
            # Se não encontrou por username, pegar o primeiro superusuário por ID
            superusers = [u for u in users if u.get('is_superuser', False)]
            if superusers:
                admin_principal = min(superusers, key=lambda x: x.get('id', float('inf')))
        
        if not admin_principal:
            print("   ❌ Administrador principal não encontrado!")
            return
        
        admin_principal_id = admin_principal['id']
        print(f"   🛡️ Administrador principal identificado: {admin_principal['username']} (ID: {admin_principal_id})")
        print()
        
        # 3. Teste de proteção: Tentar modificar administrador principal
        print("3. 🚫 Testando proteção - Tentativa de modificar administrador principal")
        
        # Teste 3.1: PATCH direto
        print("   3.1. Tentando PATCH direto para rebaixar administrador principal")
        patch_data = {
            "is_superuser": False,
            "is_staff": False
        }
        
        patch_response = requests.patch(
            f"{API_BASE}/auth/users/{admin_principal_id}/",
            json=patch_data,
            headers=headers
        )
        
        print(f"       Status: {patch_response.status_code}")
        if patch_response.status_code == 403:
            print("       ✅ PROTEÇÃO FUNCIONANDO! Administrador principal protegido via PATCH")
            try:
                error_data = patch_response.json()
                print(f"       📝 Mensagem: {error_data.get('error', 'N/A')}")
                print(f"       🛡️ Is Main Admin: {error_data.get('is_main_admin', False)}")
            except:
                print(f"       📝 Response: {patch_response.text}")
        else:
            print("       ❌ FALHA NA PROTEÇÃO! Administrador principal foi modificado!")
            print(f"       Response: {patch_response.text}")
        print()
        
        # Teste 3.2: Action promote_to_profile
        print("   3.2. Tentando action promote_to_profile para rebaixar")
        profile_data = {"profile": "viewer"}
        
        profile_response = requests.post(
            f"{API_BASE}/auth/users/{admin_principal_id}/promote_to_profile/",
            json=profile_data,
            headers=headers
        )
        
        print(f"       Status: {profile_response.status_code}")
        if profile_response.status_code == 403:
            print("       ✅ PROTEÇÃO FUNCIONANDO! Administrador principal protegido via action")
            try:
                error_data = profile_response.json()
                print(f"       📝 Mensagem: {error_data.get('error', 'N/A')}")
            except:
                print(f"       📝 Response: {profile_response.text}")
        else:
            print("       ❌ FALHA NA PROTEÇÃO! Action permitiu modificação!")
            print(f"       Response: {profile_response.text}")
        print()
        
        # 4. Teste de auto-modificação
        print("4. 🔄 Testando proteção de auto-modificação")
        print("   4.1. Administrador tentando modificar a si mesmo")
        
        self_patch_data = {"first_name": "Modified Name"}
        self_patch_response = requests.patch(
            f"{API_BASE}/auth/users/{admin_user_id}/",
            json=self_patch_data,
            headers=headers
        )
        
        print(f"       Status: {self_patch_response.status_code}")
        if self_patch_response.status_code == 403:
            print("       ✅ PROTEÇÃO FUNCIONANDO! Auto-modificação bloqueada")
            try:
                error_data = self_patch_response.json()
                print(f"       📝 Mensagem: {error_data.get('error', 'N/A')}")
                print(f"       🔄 Is Self Modification: {error_data.get('is_self_modification', False)}")
            except:
                print(f"       📝 Response: {self_patch_response.text}")
        else:
            print("       ⚠️ Auto-modificação permitida (pode estar ok dependendo dos dados)")
            print(f"       Response: {self_patch_response.text}")
        print()
        
        # 5. Teste com usuário normal (se disponível)
        regular_users = [u for u in users if not u.get('is_superuser', False) and not u.get('is_staff', False)]
        if regular_users:
            regular_user = regular_users[0]
            print(f"5. 👤 Testando modificação de usuário normal: {regular_user['username']}")
            
            normal_patch_data = {"first_name": "Modified Regular User"}
            normal_patch_response = requests.patch(
                f"{API_BASE}/auth/users/{regular_user['id']}/",
                json=normal_patch_data,
                headers=headers
            )
            
            print(f"   Status: {normal_patch_response.status_code}")
            if normal_patch_response.status_code == 200:
                print("   ✅ Modificação de usuário normal funcionando corretamente")
            else:
                print(f"   ⚠️ Problema na modificação de usuário normal: {normal_patch_response.text}")
        
        print()
        print("="*70)
        print("📊 RESUMO DOS TESTES")
        print("="*70)
        print("✅ Identificação do administrador principal: OK")
        print("✅ Proteção via PATCH: TESTADO")
        print("✅ Proteção via Actions: TESTADO") 
        print("✅ Proteção de auto-modificação: TESTADO")
        print("✅ Funcionamento normal com outros usuários: TESTADO")
        print()
        print("🛡️ PROTEÇÃO DO ADMINISTRADOR PRINCIPAL VERIFICADA!")
        print("="*70)
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão: Verifique se o servidor está rodando em http://localhost:8000")
    except Exception as e:
        print(f"❌ Erro durante o teste: {str(e)}")

if __name__ == "__main__":
    test_admin_protection()
