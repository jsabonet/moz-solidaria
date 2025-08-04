#!/usr/bin/env python
# test_statistics_endpoint.py - Teste específico do endpoint de estatísticas

import requests
import json

# Configurações
API_BASE = 'http://localhost:8000/api/v1'

def main():
    print("🔍 Testando Endpoint de Estatísticas...")
    
    # Login
    login_response = requests.post(f'{API_BASE}/auth/token/', json={
        'username': 'admin', 
        'password': 'admin123'
    })
    
    if login_response.status_code != 200:
        print("❌ Falha no login")
        return
    
    token = login_response.json()['access']
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("✅ Login realizado com sucesso")
    
    # Testar endpoint de estatísticas
    print("\n=== Testando /api/v1/donations/statistics/ ===")
    
    response = requests.get(f'{API_BASE}/donations/statistics/', headers=headers)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        stats = response.json()
        print("✅ Estatísticas obtidas com sucesso!")
        print(f"📊 Dados completos:")
        print(json.dumps(stats, indent=2, ensure_ascii=False))
        
        # Verificar se contém dados de nível do doador
        if 'donor_level' in stats:
            print(f"\n🏆 Nível do Doador: {stats['donor_level']}")
        
        if 'total_donated' in stats:
            print(f"💰 Total Doado: {stats['total_donated']}")
            
        if 'approved_donations' in stats:
            print(f"✅ Doações Aprovadas: {stats['approved_donations']}")
            
    else:
        print(f"❌ Erro: {response.text}")
    
    # Testar endpoint da client-area
    print("\n=== Testando /api/v1/client-area/donor-stats/ ===")
    
    response2 = requests.get(f'{API_BASE}/client-area/donor-stats/', headers=headers)
    
    print(f"Status: {response2.status_code}")
    
    if response2.status_code == 200:
        stats2 = response2.json()
        print("✅ Estatísticas client-area obtidas!")
        print(f"📊 Dados:")
        print(json.dumps(stats2, indent=2, ensure_ascii=False))
    else:
        print(f"❌ Erro: {response2.text}")

if __name__ == '__main__':
    main()
