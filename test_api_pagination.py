#!/usr/bin/env python
"""
Teste simplificado para verificar se a API de paginação está funcionando
"""
import requests

# Testar API de paginação - simular o que o frontend faz
base_url = "http://localhost:8000/api/v1/auth/users/"
page = 1
all_users_from_api = []

print("📡 Testando carregamento paginado da API:")

try:
    while True:
        response = requests.get(f"{base_url}?page={page}")
        if response.status_code != 200:
            print(f"❌ Erro na página {page}: {response.status_code}")
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
        
except requests.exceptions.ConnectionError:
    print("❌ Erro: Não foi possível conectar ao servidor backend")
    print("   Verifique se o servidor Django está rodando em http://localhost:8000")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")

print("\n" + "="*60)
print("📊 RESUMO DO TESTE:")
print(f"   • Usuários via API: {len(all_users_from_api) if 'all_users_from_api' in locals() else 'N/A'}")
print(f"   • Páginas processadas: {page if 'page' in locals() else 'N/A'}")
print("   • Status da paginação: ✅ Funcionando" if 'all_users_from_api' in locals() and len(all_users_from_api) > 20 else "   • Status da paginação: ❌ Problema")
print("="*60)
