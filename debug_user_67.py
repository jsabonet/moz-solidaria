#!/usr/bin/env python
"""
Verificar o que aconteceu com o usuário ID 67 que foi promovido
"""
import requests

# URLs da API
base_url = "http://localhost:8000"
login_url = f"{base_url}/api/v1/auth/token/"
users_url = f"{base_url}/api/v1/auth/users/"

print("🔍 INVESTIGANDO O USUÁRIO ID 67 QUE FOI PROMOVIDO")
print("="*60)

try:
    # Login
    print("🔐 Fazendo login...")
    login_response = requests.post(login_url, {
        'username': 'admin',
        'password': 'admin123'
    })
    
    if login_response.status_code != 200:
        print(f"❌ Erro no login: {login_response.status_code}")
        exit(1)
        
    token_data = login_response.json()
    access_token = token_data['access']
    headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
    
    # Verificar usuário específico ID 67
    print("🔍 Verificando usuário ID 67...")
    user_response = requests.get(f"{users_url}67/", headers=headers)
    
    if user_response.status_code == 200:
        user_data = user_response.json()
        print(f"👤 Usuário: {user_data['username']}")
        print(f"📧 Email: {user_data['email']}")
        print(f"🏷️ is_staff: {user_data['is_staff']}")
        print(f"👑 is_superuser: {user_data['is_superuser']}")
        print(f"✅ is_active: {user_data['is_active']}")
        print(f"👥 groups: {user_data.get('groups', [])}")
        print(f"🔑 permissions: {user_data.get('permissions', [])}")
        
        # Verificar se o usuário tem acesso ao dashboard
        print(f"\n🔐 ANÁLISE DE ACESSO:")
        
        if user_data['is_staff'] or user_data['is_superuser']:
            print("✅ Usuário TEM acesso ao dashboard (is_staff=True ou is_superuser=True)")
        else:
            print("❌ Usuário NÃO tem acesso ao dashboard (is_staff=False e is_superuser=False)")
            
        if user_data.get('groups'):
            print(f"✅ Usuário pertence aos grupos: {user_data['groups']}")
        else:
            print("❌ Usuário não pertence a nenhum grupo")
            
        if user_data.get('permissions'):
            print(f"✅ Usuário tem permissões: {user_data['permissions']}")
        else:
            print("❌ Usuário não tem permissões específicas")
            
    else:
        print(f"❌ Erro ao buscar usuário: {user_response.status_code}")
        
    # Verificar todos os grupos disponíveis
    print(f"\n📋 VERIFICANDO TODOS OS GRUPOS DISPONÍVEIS:")
    
    # Buscar todos os usuários para ver quais grupos existem
    all_users_response = requests.get(users_url, headers=headers)
    if all_users_response.status_code == 200:
        all_users_data = all_users_response.json()
        unique_groups = set()
        
        for user in all_users_data['results']:
            if user.get('groups'):
                for group in user['groups']:
                    unique_groups.add(group)
                    
        if unique_groups:
            print(f"🏷️ Grupos encontrados no sistema: {list(unique_groups)}")
        else:
            print("❌ Nenhum grupo encontrado no sistema")
            
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*60)
print("🎯 DIAGNÓSTICO:")
print("Se is_staff=False, o usuário não pode acessar /dashboard/")
print("Se groups=[], a promoção não foi aplicada corretamente")
print("Se permissions=[], o usuário não tem permissões específicas")
print("="*60)
