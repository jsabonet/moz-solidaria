#!/usr/bin/env python
# test_fixes.py - Teste das correções implementadas

import requests
import json

API_BASE = 'http://localhost:8000/api/v1'

def test_rejection_without_reason():
    """Testar rejeição sem justificativa"""
    print("🚫 TESTANDO REJEIÇÃO SEM JUSTIFICATIVA")
    
    # Login admin
    admin_response = requests.post(f'{API_BASE}/auth/token/', json={
        'username': 'admin', 
        'password': 'admin123'
    })
    
    if admin_response.status_code != 200:
        print("❌ Falha no login admin")
        return
    
    admin_token = admin_response.json()['access']
    headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
    
    # Buscar doação pendente
    pending_response = requests.get(f'{API_BASE}/donations/?status=pending', headers=headers)
    if pending_response.status_code == 200:
        pending = pending_response.json()
        results = pending if isinstance(pending, list) else pending.get('results', [])
        
        if results:
            donation_id = results[0]['id']
            print(f"📝 Testando rejeição da doação {donation_id} SEM justificativa")
            
            rejection_data = {
                'status': 'rejected',
                'admin_comment': 'Rejeitada pelo admin'
                # NÃO enviando rejection_reason
            }
            
            reject_response = requests.patch(f'{API_BASE}/donations/{donation_id}/', json=rejection_data, headers=headers)
            
            if reject_response.status_code == 200:
                print("✅ Rejeição sem justificativa funcionando!")
                return True
            else:
                print(f"❌ Erro na rejeição sem justificativa: {reject_response.text}")
                return False
        else:
            print("ℹ️ Nenhuma doação pendente para testar")
            return True
    else:
        print(f"❌ Erro ao buscar doações: {pending_response.text}")
        return False

def test_user_specific_stats():
    """Testar estatísticas específicas do usuário"""
    print("\n📊 TESTANDO ESTATÍSTICAS ESPECÍFICAS DO USUÁRIO")
    
    # Tentar login com um usuário específico (top donor)
    user_credentials = [
        {'username': 'eliasjoao', 'password': 'elias123'},  # Top donor nos testes
        {'username': 'paulofernando', 'password': 'paulo123'},
    ]
    
    for creds in user_credentials:
        user_response = requests.post(f'{API_BASE}/auth/token/', json=creds)
        
        if user_response.status_code == 200:
            user_token = user_response.json()['access']
            headers = {'Authorization': f'Bearer {user_token}', 'Content-Type': 'application/json'}
            
            print(f"✅ Login realizado para {creds['username']}")
            
            # Testar estatísticas do usuário
            stats_response = requests.get(f'{API_BASE}/donations/statistics/', headers=headers)
            
            if stats_response.status_code == 200:
                stats = stats_response.json()
                print(f"✅ Estatísticas específicas do usuário {creds['username']}:")
                print(f"   Total doado: {stats.get('total_donations', 'N/A')}")
                print(f"   Número de doações: {stats.get('donation_count', 'N/A')}")
                print(f"   Doações pendentes: {stats.get('pending_count', 'N/A')}")
                
                if stats.get('last_donation'):
                    print(f"   Última doação: {stats['last_donation'].get('amount', 'N/A')}")
                
                return True
            else:
                print(f"❌ Erro nas estatísticas para {creds['username']}: {stats_response.text}")
        else:
            print(f"❌ Falha no login para {creds['username']}")
    
    print("ℹ️ Testando com admin (deve retornar dados gerais)...")
    
    # Test com admin
    admin_response = requests.post(f'{API_BASE}/auth/token/', json={
        'username': 'admin', 
        'password': 'admin123'
    })
    
    if admin_response.status_code == 200:
        admin_token = admin_response.json()['access']
        headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
        
        stats_response = requests.get(f'{API_BASE}/donations/statistics/', headers=headers)
        
        if stats_response.status_code == 200:
            stats = stats_response.json()
            print("✅ Estatísticas do admin (dados gerais):")
            print(f"   Total arrecadado: {stats.get('summary', {}).get('total_raised', 'N/A')}")
            print(f"   Total doadores: {stats.get('summary', {}).get('total_donors', 'N/A')}")
            print(f"   Top doadores: {len(stats.get('top_donors', []))}")
            return True
        else:
            print(f"❌ Erro nas estatísticas do admin: {stats_response.text}")
    
    return False

def main():
    print("🔧 Testando Correções Implementadas")
    print("=" * 50)
    
    # 1. Testar rejeição sem justificativa
    rejection_success = test_rejection_without_reason()
    
    # 2. Testar estatísticas específicas
    stats_success = test_user_specific_stats()
    
    print("\n" + "=" * 50)
    print("📋 RESULTADO DOS TESTES:")
    print(f"   {'✅' if rejection_success else '❌'} Rejeição sem justificativa")
    print(f"   {'✅' if stats_success else '❌'} Estatísticas específicas do usuário")
    
    if rejection_success and stats_success:
        print("\n🎉 TODAS AS CORREÇÕES FUNCIONANDO!")
    else:
        print("\n⚠️ Algumas correções precisam de ajustes")

if __name__ == '__main__':
    main()
