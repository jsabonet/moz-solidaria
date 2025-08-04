#!/usr/bin/env python
# debug_auth.py - Debug de autenticação

import requests
import json

API_BASE = 'http://localhost:8000/api/v1'

def debug_auth():
    print("🔍 DEBUG DE AUTENTICAÇÃO")
    print("=" * 40)
    
    # 1. Fazer login
    print("\n1. Fazendo login...")
    login_response = requests.post(f'{API_BASE}/auth/token/', json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        token = token_data['access']
        print(f"✅ Login bem-sucedido")
        print(f"Token (primeiros 50 chars): {token[:50]}...")
        
        # 2. Testar diferentes headers
        headers_variants = [
            # JWT Bearer
            {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
            # DRF Token style
            {'Authorization': f'Token {token}', 'Content-Type': 'application/json'},
            # Sem Content-Type
            {'Authorization': f'Bearer {token}'},
        ]
        
        for i, headers in enumerate(headers_variants, 1):
            print(f"\n{i}. Testando headers: {headers}")
            
            # Testar profile
            profile_response = requests.get(f'{API_BASE}/client-area/profile/', headers=headers)
            print(f"   Profile: {profile_response.status_code}")
            if profile_response.status_code != 200:
                print(f"   Erro: {profile_response.text[:100]}...")
            
            # Testar dashboard stats
            stats_response = requests.get(f'{API_BASE}/client-area/dashboard/stats/', headers=headers)
            print(f"   Stats: {stats_response.status_code}")
            if stats_response.status_code != 200:
                print(f"   Erro: {stats_response.text[:100]}...")
                
            if profile_response.status_code == 200 and stats_response.status_code == 200:
                print("   ✅ Headers funcionando!")
                break
        
        # 3. Testar outros endpoints para comparação
        print(f"\n3. Testando outros endpoints para comparação...")
        working_headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        
        # Teste endpoints que funcionam
        test_endpoints = [
            '/donations/statistics/',
            '/notifications/stats/',  # Este funciona segundo o log
            '/auth/user/',
        ]
        
        for endpoint in test_endpoints:
            try:
                response = requests.get(f'{API_BASE}{endpoint}', headers=working_headers)
                print(f"   {endpoint}: {response.status_code}")
            except Exception as e:
                print(f"   {endpoint}: Erro - {e}")
                
    else:
        print(f"❌ Falha no login: {login_response.text}")

def debug_token_validation():
    print("\n4. Debug do token...")
    
    # Login
    login_response = requests.post(f'{API_BASE}/auth/token/', json={
        'username': 'admin',
        'password': 'admin123'
    })
    
    if login_response.status_code == 200:
        token = login_response.json()['access']
        
        # Decodificar JWT para ver conteúdo
        try:
            import base64
            header, payload, signature = token.split('.')
            
            # Adicionar padding se necessário
            payload += '=' * (4 - len(payload) % 4)
            decoded_payload = base64.b64decode(payload)
            payload_data = json.loads(decoded_payload)
            
            print(f"   Token payload: {json.dumps(payload_data, indent=2)}")
            print(f"   User ID: {payload_data.get('user_id')}")
            print(f"   Username: {payload_data.get('username', 'N/A')}")
            print(f"   Exp: {payload_data.get('exp')}")
            
            # Verificar se token ainda é válido
            import time
            current_time = time.time()
            exp_time = payload_data.get('exp', 0)
            
            if current_time < exp_time:
                print(f"   ✅ Token ainda válido (expira em {exp_time - current_time:.0f}s)")
            else:
                print(f"   ❌ Token expirado!")
                
        except Exception as e:
            print(f"   Erro ao decodificar token: {e}")

if __name__ == '__main__':
    debug_auth()
    debug_token_validation()
