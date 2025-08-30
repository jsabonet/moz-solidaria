#!/usr/bin/env python
"""
Teste final para verificar que todos os usuários estão sendo processados corretamente
"""
import os
import sys
import django
import requests

# Configurar Django
sys.path.append('D:\\Projectos\\moz-solidaria-hub-main\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

# 1. Verificar total de usuários no banco
total_users = User.objects.count()
print(f"🔍 Total de usuários no banco de dados: {total_users}")

# 2. Testar API de paginação - simular o que o frontend faz
base_url = "http://localhost:8000/api/auth/user-management/"
page = 1
all_users_from_api = []

print("\n📡 Testando carregamento paginado (como o frontend faz):")

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
    
    if len(all_users_from_api) == total_users:
        print("🎉 SUCESSO! Todos os usuários estão sendo carregados pela API paginada")
    else:
        print(f"⚠️ DISCREPÂNCIA: Banco tem {total_users}, API retornou {len(all_users_from_api)}")
        
    # 3. Mostrar alguns usuários específicos importantes
    print("\n👥 Usuários importantes encontrados na API:")
    important_users = ['admin', 'joellasmim']
    
    for user_data in all_users_from_api:
        if user_data['username'] in important_users:
            print(f"   ✓ {user_data['username']} encontrado (Profile: {user_data.get('profile', 'Nenhum')})")
            
except requests.exceptions.ConnectionError:
    print("❌ Erro: Não foi possível conectar ao servidor backend")
    print("   Verifique se o servidor Django está rodando em http://localhost:8000")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")

print("\n" + "="*60)
print("📊 RESUMO DO TESTE:")
print(f"   • Usuários no banco: {total_users}")
print(f"   • Usuários via API: {len(all_users_from_api) if 'all_users_from_api' in locals() else 'N/A'}")
print(f"   • Páginas processadas: {page if 'page' in locals() else 'N/A'}")
print("="*60)
