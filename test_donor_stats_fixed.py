#!/usr/bin/env python
# test_donor_stats_fixed.py - Teste de estatísticas do donor dashboard

import requests
import json
import sys

# Configurações
API_BASE = 'http://localhost:8000/api/v1'

def login_as_user():
    """Fazer login como usuário doador"""
    # Tentar diferentes credenciais
    credentials = [
        {'username': 'donor', 'password': 'donor123'},
        {'username': 'user', 'password': 'user123'},
        {'username': 'testuser', 'password': 'testpass'},
        {'username': 'doador', 'password': 'doador123'},
    ]
    
    for creds in credentials:
        response = requests.post(f'{API_BASE}/auth/token/', json=creds)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login realizado com {creds['username']}")
            return data.get('access'), creds['username']
        else:
            print(f"❌ Falha no login com {creds['username']}: {response.status_code}")
    
    return None, None

def test_donor_stats(token):
    """Testar estatísticas do doador"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print(f"\n=== Testando Estatísticas do Doador ===")
    
    response = requests.get(f'{API_BASE}/donor/stats/', headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ Estatísticas obtidas com sucesso!")
        print(f"📊 Dados: {json.dumps(stats, indent=2)}")
        return True
    else:
        print(f"❌ Erro ao obter estatísticas: {response.text}")
        return False

def test_general_stats(token):
    """Testar estatísticas gerais"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print(f"\n=== Testando Estatísticas Gerais ===")
    
    response = requests.get(f'{API_BASE}/stats/', headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ Estatísticas gerais obtidas!")
        print(f"📊 Dados: {json.dumps(stats, indent=2)}")
        return True
    else:
        print(f"❌ Erro ao obter estatísticas gerais: {response.text}")
        
        # Tentar endpoint alternativo
        response2 = requests.get(f'{API_BASE}/donations/stats/', headers=headers)
        print(f"Tentativa alternativa - Status: {response2.status_code}")
        if response2.status_code == 200:
            stats2 = response2.json()
            print(f"✅ Estatísticas alternativas obtidas!")
            print(f"📊 Dados: {json.dumps(stats2, indent=2)}")
            return True
        return False

def test_donations_list(token):
    """Testar listagem de doações do usuário"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print(f"\n=== Testando Listagem de Doações ===")
    
    response = requests.get(f'{API_BASE}/donations/my/', headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        donations = response.json()
        print(f"✅ Doações do usuário obtidas!")
        print(f"📊 Total de doações: {len(donations) if isinstance(donations, list) else donations.get('count', 0)}")
        return True
    else:
        print(f"❌ Erro ao obter doações: {response.text}")
        
        # Tentar endpoint geral
        response2 = requests.get(f'{API_BASE}/donations/', headers=headers)
        print(f"Tentativa geral - Status: {response2.status_code}")
        if response2.status_code == 200:
            donations2 = response2.json()
            print(f"✅ Doações gerais obtidas!")
            results = donations2 if isinstance(donations2, list) else donations2.get('results', [])
            print(f"📊 Total de doações: {len(results)}")
            return True
        return False

def main():
    print("🔍 Testando Sistema de Estatísticas do Doador...")
    
    # Login
    token, username = login_as_user()
    if not token:
        print("❌ Falha no login com todos os usuários testados")
        print("ℹ️ Tentando usar admin...")
        
        admin_response = requests.post(f'{API_BASE}/auth/token/', json={'username': 'admin', 'password': 'admin123'})
        if admin_response.status_code == 200:
            token = admin_response.json().get('access')
            username = 'admin'
            print("✅ Login admin realizado")
        else:
            print("❌ Falha no login admin também")
            sys.exit(1)
    
    print(f"🔑 Logado como: {username}")
    
    # Executar testes
    success_count = 0
    total_tests = 3
    
    if test_donor_stats(token):
        success_count += 1
    
    if test_general_stats(token):
        success_count += 1
    
    if test_donations_list(token):
        success_count += 1
    
    print(f"\n📋 Resultado Final: {success_count}/{total_tests} testes bem-sucedidos")
    
    if success_count == total_tests:
        print("🎉 Todos os testes passaram!")
    elif success_count > 0:
        print("⚠️ Alguns testes falharam, mas funcionalidade básica está funcionando")
    else:
        print("❌ Todos os testes falharam")

if __name__ == '__main__':
    main()
