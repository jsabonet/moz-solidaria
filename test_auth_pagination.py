#!/usr/bin/env python
"""
Teste completo com autenticação para verificar se a API de paginação está funcionando
"""
import requests

# URLs da API
base_url = "http://localhost:8000"
login_url = f"{base_url}/api/v1/auth/token/"
users_url = f"{base_url}/api/v1/auth/users/"

print("🔐 Fazendo login para obter token...")

# 1. Fazer login
try:
    login_response = requests.post(login_url, {
        'username': 'admin',
        'password': 'admin123'
    })
    
    if login_response.status_code != 200:
        print(f"❌ Erro no login: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        exit(1)
        
    token_data = login_response.json()
    access_token = token_data['access']
    print("✅ Login realizado com sucesso!")
    
    # 2. Testar API de paginação com token
    headers = {'Authorization': f'Bearer {access_token}'}
    page = 1
    all_users_from_api = []

    print("\n📡 Testando carregamento paginado da API:")

    while True:
        response = requests.get(f"{users_url}?page={page}", headers=headers)
        if response.status_code != 200:
            print(f"❌ Erro na página {page}: {response.status_code}")
            print(f"Response: {response.text}")
            break
            
        data = response.json()
        users_in_page = len(data['results'])
        all_users_from_api.extend(data['results'])
        
        print(f"   📄 Página {page}: {users_in_page} usuários carregados")
        
        if not data['next']:
            break
            
        page += 1

    print(f"\n✅ Total de usuários carregados via API: {len(all_users_from_api)}")
    print(f"📊 Total de páginas processadas: {page}")
    
    # Mostrar alguns usuários específicos importantes
    print("\n👥 Usuários importantes encontrados na API:")
    important_users = ['admin', 'joellasmim']
    
    for user_data in all_users_from_api:
        if user_data['username'] in important_users:
            print(f"   ✓ {user_data['username']} encontrado (Profile: {user_data.get('profile', 'Nenhum')})")
            
    # Mostrar primeiros e últimos usuários para verificar distribuição
    if all_users_from_api:
        print(f"\n🔍 Primeiro usuário: {all_users_from_api[0]['username']}")
        print(f"🔍 Último usuário: {all_users_from_api[-1]['username']}")
        
    # Verificar se temos mais de 20 usuários (indicando que a paginação funcionou)
    if len(all_users_from_api) > 20:
        print("\n🎉 SUCESSO! A paginação está funcionando - mais de 20 usuários carregados!")
    else:
        print(f"\n⚠️ ATENÇÃO: Apenas {len(all_users_from_api)} usuários carregados - pode ser problema de paginação")
        
except requests.exceptions.ConnectionError:
    print("❌ Erro: Não foi possível conectar ao servidor backend")
    print("   Verifique se o servidor Django está rodando em http://localhost:8000")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")

print("\n" + "="*60)
print("📊 RESUMO DO TESTE:")
print(f"   • Usuários via API: {len(all_users_from_api) if 'all_users_from_api' in locals() else 'N/A'}")
print(f"   • Páginas processadas: {page if 'page' in locals() else 'N/A'}")
if 'all_users_from_api' in locals() and len(all_users_from_api) > 20:
    print("   • Status da paginação: ✅ Funcionando")
else:
    print("   • Status da paginação: ❌ Problema")
print("="*60)
