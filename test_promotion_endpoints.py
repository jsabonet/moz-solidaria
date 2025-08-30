#!/usr/bin/env python
"""
Teste para verificar se os endpoints de promoção estão funcionando
"""
import requests

# URLs da API
base_url = "http://localhost:8000"
login_url = f"{base_url}/api/v1/auth/token/"
users_url = f"{base_url}/api/v1/auth/users/"

print("🔐 Fazendo login...")

try:
    # Login
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
    print("✅ Login realizado com sucesso!")
    
    # Buscar um usuário de teste
    users_response = requests.get(users_url, headers=headers)
    users_data = users_response.json()
    
    # Encontrar um usuário comum (não admin)
    test_user = None
    for user in users_data['results']:
        if not user['is_superuser'] and user['username'] != 'admin':
            test_user = user
            break
    
    if not test_user:
        print("❌ Nenhum usuário de teste encontrado")
        exit(1)
        
    print(f"🔍 Usuário de teste selecionado: {test_user['username']} (ID: {test_user['id']})")
    print(f"   Status atual: is_staff={test_user['is_staff']}, is_superuser={test_user['is_superuser']}")
    
    # Teste 1: Promover para Blog Manager
    print(f"\n📈 Testando promoção para Blog Manager...")
    promote_url = f"{users_url}{test_user['id']}/promote_to_profile/"
    promote_response = requests.post(promote_url, 
        headers=headers,
        json={'profile': 'blog_manager'}
    )
    
    print(f"   Status: {promote_response.status_code}")
    if promote_response.status_code == 200:
        print("   ✅ Promoção bem-sucedida!")
        result = promote_response.json()
        print(f"   Resposta: {result}")
    else:
        print(f"   ❌ Erro na promoção: {promote_response.text}")
        
    # Verificar mudança
    user_check = requests.get(f"{users_url}{test_user['id']}/", headers=headers)
    if user_check.status_code == 200:
        updated_user = user_check.json()
        print(f"   Status atualizado: is_staff={updated_user['is_staff']}, profile={updated_user.get('profile', 'Nenhum')}")
    
    # Teste 2: Rebaixar para usuário comum
    print(f"\n📉 Testando rebaixamento para usuário comum...")
    demote_response = requests.patch(f"{users_url}{test_user['id']}/",
        headers=headers,
        json={'is_staff': False, 'is_superuser': False}
    )
    
    print(f"   Status: {demote_response.status_code}")
    if demote_response.status_code == 200:
        print("   ✅ Rebaixamento bem-sucedido!")
        result = demote_response.json()
        print(f"   Resposta: {result}")
    else:
        print(f"   ❌ Erro no rebaixamento: {demote_response.text}")
        
    # Verificação final
    final_check = requests.get(f"{users_url}{test_user['id']}/", headers=headers)
    if final_check.status_code == 200:
        final_user = final_check.json()
        print(f"   Status final: is_staff={final_user['is_staff']}, profile={final_user.get('profile', 'Nenhum')}")
        
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "="*50)
print("📊 TESTE CONCLUÍDO")
print("="*50)
