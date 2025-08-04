#!/usr/bin/env python
# test_donation_rejection.py - Script para testar rejeição de doações

import requests
import json
import sys

# Configurações
API_BASE = 'http://localhost:8000/api/v1'

def login_as_admin():
    """Fazer login como admin"""
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

def test_reject_donation(token, donation_id):
    """Testar rejeição de doação"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print(f"\n=== Testando Rejeição da Doação {donation_id} ===")
    
    rejection_data = {
        'status': 'rejected',
        'admin_comment': 'Teste de rejeição',
        'rejection_reason': 'Documentação insuficiente para teste'
    }
    
    print(f"Dados da rejeição: {json.dumps(rejection_data, indent=2)}")
    
    response = requests.patch(f'{API_BASE}/donations/{donation_id}/', json=rejection_data, headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        donation = response.json()
        print(f"✅ Doação rejeitada com sucesso!")
        print(f"Status atual: {donation.get('status', 'N/A')}")
        return True
    else:
        print(f"❌ Erro ao rejeitar doação: {response.text}")
        return False

def test_approve_donation(token, donation_id):
    """Testar aprovação de doação"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print(f"\n=== Testando Aprovação da Doação {donation_id} ===")
    
    approval_data = {
        'status': 'approved',
        'admin_comment': 'Aprovada após revisão'
    }
    
    print(f"Dados da aprovação: {json.dumps(approval_data, indent=2)}")
    
    response = requests.patch(f'{API_BASE}/donations/{donation_id}/', json=approval_data, headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        donation = response.json()
        print(f"✅ Doação aprovada com sucesso!")
        print(f"Status atual: {donation.get('status', 'N/A')}")
        return True
    else:
        print(f"❌ Erro ao aprovar doação: {response.text}")
        return False

def get_pending_donations(token):
    """Buscar doações pendentes"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f'{API_BASE}/donations/?status=pending', headers=headers)
    
    if response.status_code == 200:
        donations = response.json()
        results = donations if isinstance(donations, list) else donations.get('results', [])
        print(f"Doações pendentes encontradas: {len(results)}")
        return results
    else:
        print(f"Erro ao buscar doações: {response.text}")
        return []

def main():
    print("🔍 Testando Sistema de Aprovação/Rejeição...")
    
    # Login
    token = login_as_admin()
    if not token:
        print("❌ Falha no login")
        sys.exit(1)
    
    print(f"✅ Login realizado com sucesso.")
    
    # Buscar doações pendentes
    pending_donations = get_pending_donations(token)
    
    if pending_donations:
        donation_id = pending_donations[0].get('id') if isinstance(pending_donations[0], dict) else None
        
        if donation_id:
            print(f"Usando doação ID: {donation_id}")
            
            # Testar rejeição
            if test_reject_donation(token, donation_id):
                print("✅ Teste de rejeição bem-sucedido")
                
                # Testar aprovação (mudando de volta)
                if test_approve_donation(token, donation_id):
                    print("✅ Teste de aprovação bem-sucedido")
                else:
                    print("❌ Falha na aprovação")
            else:
                print("❌ Falha na rejeição")
        else:
            print("❌ Nenhuma doação válida encontrada")
    else:
        print("ℹ️ Nenhuma doação pendente encontrada")

if __name__ == '__main__':
    main()
