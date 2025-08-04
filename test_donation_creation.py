#!/usr/bin/env python
# test_donation_creation.py - Script para testar criação de doações

import requests
import json
import sys
import os

# Configurações
API_BASE = 'http://localhost:8000/api/v1'

def login_as_admin():
    """Fazer login como admin"""
    # Primeiro, vamos criar um superuser se não existir
    login_data = {
        'username': 'admin',
        'password': 'admin123'
    }
    
    response = requests.post(f'{API_BASE}/auth/token/', json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        return data.get('access')
    else:
        print(f"Erro no login: {response.status_code} - {response.text}")
        return None

def test_donation_methods(token):
    """Testar endpoint de métodos de doação"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("=== Testando Métodos de Doação ===")
    
    response = requests.get(f'{API_BASE}/donations/methods/', headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        methods = data if isinstance(data, list) else data.get('results', [])
        print(f"Métodos encontrados: {len(methods)}")
        for method in methods:
            if isinstance(method, dict):
                print(f"  - {method.get('name', 'N/A')} (ID: {method.get('id', 'N/A')})")
            else:
                print(f"  - Método: {method}")
        return methods
    else:
        print(f"Erro: {response.text}")
        return []

def test_create_donation(token, donation_method_id=None):
    """Testar criação de doação"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("\n=== Testando Criação de Doação ===")
    
    donation_data = {
        'amount': 1000.00,
        'donation_method': donation_method_id,
        'donor_message': 'Doação de teste para verificar funcionamento',
        'purpose': 'Teste de sistema'
    }
    
    print(f"Dados da doação: {json.dumps(donation_data, indent=2)}")
    
    response = requests.post(f'{API_BASE}/donations/', json=donation_data, headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        donation = response.json()
        print(f"✅ Doação criada com sucesso!")
        print(f"Resposta completa: {json.dumps(donation, indent=2, ensure_ascii=False)}")
        return donation
    else:
        print(f"❌ Erro ao criar doação: {response.text}")
        return None

def test_donation_statistics(token):
    """Testar estatísticas de doações"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("\n=== Testando Estatísticas de Doações ===")
    
    response = requests.get(f'{API_BASE}/donations/statistics/', headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        stats = response.json()
        print(f"Estatísticas: {json.dumps(stats, indent=2, ensure_ascii=False)}")
        return stats
    else:
        print(f"Erro: {response.text}")
        return None

def main():
    print("🔍 Testando Sistema de Doações...")
    
    # Login
    token = login_as_admin()
    if not token:
        print("❌ Falha no login")
        sys.exit(1)
    
    print(f"✅ Login realizado com sucesso.")
    
    # Testar métodos de doação
    methods = test_donation_methods(token)
    
    if methods:
        # Usar o primeiro método disponível
        first_method = methods[0] if isinstance(methods[0], dict) else {'id': 1, 'name': 'Padrão'}
        print(f"Usando método: {first_method.get('name', 'N/A')}")
        
        # Testar criação de doação
        donation = test_create_donation(token, first_method.get('id'))
        
        if donation:
            print("✅ Teste de criação bem-sucedido")
        else:
            print("❌ Falha na criação de doação")
    
    # Testar estatísticas
    stats = test_donation_statistics(token)
    
    if stats:
        print("✅ Estatísticas funcionando")
    else:
        print("❌ Falha nas estatísticas")

if __name__ == '__main__':
    main()
