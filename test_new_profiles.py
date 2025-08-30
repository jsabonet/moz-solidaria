#!/usr/bin/env python3
"""
Teste dos Novos Perfis de Usuário
Verifica se o sistema de promoção para perfis específicos está funcionando
"""

import requests
import json

def test_new_profiles():
    print("🔧 Testando sistema de perfis específicos...")
    
    # 1. Fazer login
    print("\n1️⃣ Fazendo login...")
    login_response = requests.post(
        'http://localhost:8000/api/v1/auth/token/',
        json={'username': 'admin', 'password': 'admin123'}
    )
    
    if login_response.status_code != 200:
        print("❌ Falha no login")
        return
    
    token = login_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Login realizado com sucesso")
    
    # 2. Testar endpoint de perfis disponíveis
    print("\n2️⃣ Testando endpoint de perfis disponíveis...")
    profiles_response = requests.get(
        'http://localhost:8000/api/v1/auth/users/available_profiles/',
        headers=headers
    )
    
    if profiles_response.status_code == 200:
        profiles_data = profiles_response.json()
        print(f"✅ Perfis disponíveis: {profiles_data['total']}")
        for profile in profiles_data['profiles']:
            print(f"   📌 {profile['name']}: {profile['description']}")
    else:
        print(f"❌ Erro ao obter perfis: {profiles_response.status_code}")
    
    # 3. Listar usuários e encontrar um para teste
    print("\n3️⃣ Buscando usuário para teste...")
    users_response = requests.get(
        'http://localhost:8000/api/v1/auth/users/',
        headers=headers
    )
    
    if users_response.status_code != 200:
        print("❌ Erro ao listar usuários")
        return
    
    users_data = users_response.json()
    test_users = [u for u in users_data['results'] if u['username'] != 'admin' and not u['is_superuser']]
    
    if not test_users:
        print("⚠️ Nenhum usuário disponível para teste")
        return
    
    test_user = test_users[0]
    print(f"✅ Usuário selecionado para teste: {test_user['username']}")
    
    # 4. Testar promoção para Gestor de Blog
    print(f"\n4️⃣ Promovendo {test_user['username']} para Gestor de Blog...")
    promote_response = requests.post(
        f'http://localhost:8000/api/v1/auth/users/{test_user["id"]}/promote_to_profile/',
        headers=headers,
        json={'profile': 'blog_manager'}
    )
    
    if promote_response.status_code == 200:
        result = promote_response.json()
        print(f"✅ Promoção bem-sucedida: {result['message']}")
        print(f"   📊 Novo perfil: {result['profile']}")
    else:
        print(f"❌ Erro na promoção: {promote_response.status_code}")
        if promote_response.status_code < 500:
            error_data = promote_response.json()
            print(f"   Erro: {error_data}")
    
    # 5. Verificar se a promoção funcionou
    print(f"\n5️⃣ Verificando dados atualizados do usuário...")
    user_detail_response = requests.get(
        f'http://localhost:8000/api/v1/auth/users/{test_user["id"]}/',
        headers=headers
    )
    
    if user_detail_response.status_code == 200:
        updated_user = user_detail_response.json()
        print(f"✅ Dados atualizados:")
        print(f"   👤 Username: {updated_user['username']}")
        print(f"   🛡️ Is Staff: {updated_user['is_staff']}")
        print(f"   👑 Is Superuser: {updated_user['is_superuser']}")
        print(f"   👥 Grupos: {updated_user['groups']}")
        print(f"   🔐 Permissões: {len(updated_user['permissions'])} permissões")
    else:
        print(f"❌ Erro ao verificar usuário: {user_detail_response.status_code}")
    
    # 6. Testar outros perfis
    test_profiles = [
        ('project_manager', 'Gestor de Projetos'),
        ('community_manager', 'Gestor de Comunidade'),
        ('viewer', 'Visualizador')
    ]
    
    print(f"\n6️⃣ Testando outros perfis...")
    for profile_code, profile_name in test_profiles:
        print(f"   🔄 Testando {profile_name}...")
        test_promote_response = requests.post(
            f'http://localhost:8000/api/v1/auth/users/{test_user["id"]}/promote_to_profile/',
            headers=headers,
            json={'profile': profile_code}
        )
        
        if test_promote_response.status_code == 200:
            print(f"   ✅ {profile_name} - OK")
        else:
            print(f"   ❌ {profile_name} - Erro {test_promote_response.status_code}")
    
    print(f"\n✅ Teste concluído!")
    print("\n🔗 URLs para testar no frontend:")
    print("   • Dashboard: http://localhost:8080/dashboard/users")
    print("   • Login: http://localhost:8080/login")

if __name__ == "__main__":
    test_new_profiles()
