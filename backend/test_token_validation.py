#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_token_validation():
    print("=== TESTE DE VALIDAÇÃO DE TOKEN ===\n")
    
    # 1. Fazer login e obter token válido
    print("1. Fazendo login para obter token válido...")
    login_data = {"username": "admin", "password": "admin123"}
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/token/", json=login_data)
        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens.get('access')
            refresh_token = tokens.get('refresh')
            print(f"   ✓ Token obtido: {access_token[:50]}...")
            
            # 2. Testar validação do token
            print("\n2. Testando validação do token...")
            headers = {"Authorization": f"Bearer {access_token}"}
            
            # Testar endpoint de usuário
            user_response = requests.get(f"{BASE_URL}/api/v1/auth/user/", headers=headers)
            print(f"   Status endpoint user: {user_response.status_code}")
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"   ✓ Usuário: {user_data.get('username')}")
                
                # 3. Testar endpoint de tracking
                print("\n3. Testando endpoint de tracking...")
                tracking_response = requests.get(
                    f"{BASE_URL}/api/v1/tracking/project-tracking/Joel/",
                    headers=headers
                )
                print(f"   Status tracking: {tracking_response.status_code}")
                
                if tracking_response.status_code == 200:
                    print("   ✓ Endpoint de tracking funcionando")
                else:
                    print(f"   ✗ Erro no tracking: {tracking_response.text}")
                
                # 4. Mostrar token válido para o frontend
                print(f"\n4. TOKEN VÁLIDO PARA O FRONTEND:")
                print(f"   access_token: {access_token}")
                print(f"   refresh_token: {refresh_token}")
                print("\n📝 INSTRUÇÕES:")
                print("   1. Abra o DevTools do navegador (F12)")
                print("   2. Vá para Console")
                print("   3. Execute: localStorage.setItem('authToken', '" + access_token + "')")
                print("   4. Execute: localStorage.setItem('refreshToken', '" + refresh_token + "')")
                print("   5. Recarregue a página")
                
            else:
                print(f"   ✗ Erro na validação: {user_response.text}")
        else:
            print(f"   ✗ Erro no login: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Erro de conexão: {e}")

if __name__ == "__main__":
    test_token_validation()
