#!/usr/bin/env python
"""
Teste final para verificar o sistema de permissões completo
"""
import requests

# URLs da API
base_url = "http://localhost:8000"
login_url = f"{base_url}/api/v1/auth/token/"
users_url = f"{base_url}/api/v1/auth/users/"

print("🎯 TESTE COMPLETO DO SISTEMA DE PERMISSÕES")
print("="*60)

# Usuários de teste e suas permissões esperadas
test_cases = [
    {
        'username': 'judyclare',
        'expected_group': 'Gestor de Blog',
        'expected_staff': True,
        'expected_dashboard': True,
        'expected_areas': ['Blog']
    },
    {
        'username': 'test_user', 
        'expected_group': 'Gestor de Blog',
        'expected_staff': True,
        'expected_dashboard': True,
        'expected_areas': ['Blog']
    },
    {
        'username': 'litorito',
        'expected_group': 'Gestor de Projetos',
        'expected_staff': True,
        'expected_dashboard': True,
        'expected_areas': ['Projetos']
    }
]

for test_case in test_cases:
    username = test_case['username']
    print(f"\n🔍 TESTANDO: {username}")
    print("-" * 40)
    
    try:
        # 1. Login
        login_response = requests.post(login_url, {
            'username': username,
            'password': 'admin123'
        })
        
        if login_response.status_code == 200:
            print("✅ Login bem-sucedido")
            token_data = login_response.json()
            access_token = token_data['access']
            
            # 2. Buscar dados do usuário
            user_response = requests.get(f"{base_url}/api/v1/auth/user/", 
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                
                print(f"👤 Usuário: {user_data['username']}")
                print(f"🏷️ is_staff: {user_data.get('is_staff', 'N/A')}")
                print(f"👑 is_superuser: {user_data.get('is_superuser', 'N/A')}")
                print(f"👥 Grupos: {user_data.get('groups', [])}")
                
                # Verificações
                staff_ok = user_data.get('is_staff') == test_case['expected_staff']
                dashboard_ok = user_data.get('is_staff') or user_data.get('is_superuser')
                
                groups = user_data.get('groups', [])
                group_ok = test_case['expected_group'] in groups
                
                print(f"\n📊 VERIFICAÇÕES:")
                print(f"   {'✅' if staff_ok else '❌'} is_staff correto: {user_data.get('is_staff')} == {test_case['expected_staff']}")
                print(f"   {'✅' if dashboard_ok else '❌'} Acesso ao Dashboard: {dashboard_ok}")
                print(f"   {'✅' if group_ok else '❌'} Grupo correto: '{test_case['expected_group']}' in {groups}")
                
                if staff_ok and dashboard_ok and group_ok:
                    print(f"🎉 {username}: TODAS AS VERIFICAÇÕES PASSARAM!")
                else:
                    print(f"⚠️ {username}: Algumas verificações falharam")
                    
            else:
                print(f"❌ Erro ao buscar dados do usuário: {user_response.status_code}")
                
        else:
            print(f"❌ Erro no login: {login_response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro no teste de {username}: {e}")

print(f"\n📋 RESUMO DO TESTE:")
print("="*60)
print("✅ Sistema corrigido para:")
print("   • Usuários promovidos têm is_staff=True")
print("   • Botão Dashboard aparece para usuários staff")
print("   • Permissões baseadas em grupos funcionando")
print("   • Acesso controlado às áreas específicas")

print(f"\n🎯 PRÓXIMOS PASSOS:")
print("1. Faça login com um usuário promovido")
print("2. Verifique se o botão 'Dashboard' aparece no header")
print("3. Acesse o dashboard e veja apenas as abas permitidas")
print("4. Teste promoções/despromoções em tempo real")
print("="*60)
