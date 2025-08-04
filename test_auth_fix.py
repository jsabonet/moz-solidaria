#!/usr/bin/env python
# test_auth_fix.py - Teste final da correção de autenticação

import requests
import json

API_BASE = 'http://localhost:8000/api/v1'

def main():
    print("🔧 TESTE DA CORREÇÃO DE AUTENTICAÇÃO")
    print("=" * 50)
    
    # Login
    login_response = requests.post(f'{API_BASE}/auth/token/', json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    if login_response.status_code != 200:
        print(f"❌ Falha no login: {login_response.text}")
        return
    
    token = login_response.json()['access']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print("✅ Login realizado com sucesso")
    
    # Endpoints que estavam falhando
    endpoints_to_test = [
        '/client-area/profile/',
        '/client-area/dashboard/stats/',
    ]
    
    print(f"\n📡 TESTANDO ENDPOINTS QUE ESTAVAM FALHANDO...")
    
    all_working = True
    for endpoint in endpoints_to_test:
        print(f"\n🔗 Testando {endpoint}")
        
        response = requests.get(f'{API_BASE}{endpoint}', headers=headers)
        
        if response.status_code == 200:
            print(f"   ✅ Status: {response.status_code} - Funcionando!")
            
            # Mostrar dados relevantes
            data = response.json()
            if 'profile' in endpoint:
                print(f"   📄 Usuário: {data.get('user', {}).get('username', 'N/A')}")
                print(f"   📄 Tipo: {data.get('user_type', 'N/A')}")
            elif 'stats' in endpoint:
                print(f"   📊 Total doações: {data.get('total_donations', 'N/A')}")
                print(f"   📊 Horas voluntariado: {data.get('volunteer_hours', 'N/A')}")
        else:
            print(f"   ❌ Status: {response.status_code}")
            print(f"   ❌ Erro: {response.text[:200]}...")
            all_working = False
    
    # Testar endpoints de comparação (que já funcionavam)
    print(f"\n🔍 TESTANDO ENDPOINTS DE COMPARAÇÃO...")
    
    comparison_endpoints = [
        '/donations/statistics/',
        '/notifications/stats/',
    ]
    
    for endpoint in comparison_endpoints:
        response = requests.get(f'{API_BASE}{endpoint}', headers=headers)
        status_icon = "✅" if response.status_code == 200 else "❌"
        print(f"   {status_icon} {endpoint}: {response.status_code}")
    
    print(f"\n" + "=" * 50)
    
    if all_working:
        print("🎉 PROBLEMA DE AUTENTICAÇÃO RESOLVIDO!")
        print("\n📋 CAUSA DO PROBLEMA:")
        print("   • O relacionamento 'client_profile' falhava quando usuário não tinha perfil")
        print("   • As views agora criam automaticamente o perfil se necessário")
        print("   • Tratamento de exceção UserProfile.DoesNotExist adicionado")
        print("\n✅ SOLUÇÃO IMPLEMENTADA:")
        print("   • UserProfileView com fallback para criação de perfil")
        print("   • DashboardStatsView com tratamento de perfil ausente")
        print("   • Criação automática de perfil tipo 'donor' como padrão")
    else:
        print("⚠️ Alguns endpoints ainda apresentam problemas")

if __name__ == '__main__':
    main()
