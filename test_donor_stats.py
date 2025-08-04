#!/usr/bin/env python
# test_donor_stats.py - Script para testar as estatísticas de doadores

import requests
import json
import sys

# Configurações
API_BASE = 'http://localhost:8000/api/v1'
USERNAME = 'admin'  # Substitua pelo seu usuário de teste
PASSWORD = 'admin'  # Substitua pela sua senha de teste

def login():
    """Fazer login e obter token"""
    login_data = {
        'username': USERNAME,
        'password': PASSWORD
    }
    
    # Primeiro tentar o endpoint do client-area
    response = requests.post(f'{API_BASE}/client-area/login/', json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        return data.get('token')
    else:
        print(f"Erro no login client-area: {response.status_code}")
        
        # Tentar endpoint JWT
        response = requests.post(f'{API_BASE}/auth/token/', json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print(f"Erro no login JWT: {response.status_code} - {response.text}")
            return None

def test_donation_stats(token):
    """Testar a API de estatísticas de doações"""
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    print("=== Testando API de Estatísticas de Doações ===")
    
    # Testar endpoint de estatísticas de doações
    response = requests.get(f'{API_BASE}/donations/statistics/', headers=headers)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    return response.status_code == 200

def test_dashboard_stats(token):
    """Testar a API de estatísticas do dashboard"""
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    print("\n=== Testando API de Estatísticas do Dashboard ===")
    
    # Testar endpoint de estatísticas do dashboard
    response = requests.get(f'{API_BASE}/client-area/dashboard/stats/', headers=headers)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    return response.status_code == 200

def main():
    print("🔍 Testando APIs de Estatísticas...")
    
    # Fazer login
    token = login()
    if not token:
        print("❌ Falha no login")
        sys.exit(1)
    
    print(f"✅ Login realizado com sucesso. Token: {token[:20]}...")
    
    # Testar estatísticas de doações
    if test_donation_stats(token):
        print("✅ API de estatísticas de doações funcionando")
    else:
        print("❌ Falha na API de estatísticas de doações")
    
    # Testar estatísticas do dashboard
    if test_dashboard_stats(token):
        print("✅ API de estatísticas do dashboard funcionando")
    else:
        print("❌ Falha na API de estatísticas do dashboard")

if __name__ == '__main__':
    main()
