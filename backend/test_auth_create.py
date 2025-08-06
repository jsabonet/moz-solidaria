#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:8000"

def test_auth_and_create():
    print("=== Teste de Autenticação e Criação ===\n")
    
    # 1. Fazer login para obter token
    print("1. Fazendo login...")
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/token/", json=login_data)
        print(f"   Status do login: {response.status_code}")
        
        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens.get('access')
            print(f"   ✓ Token obtido: {access_token[:50]}...")
            
            # 2. Testar criação de update com autenticação
            print("\n2. Testando criação de update com autenticação")
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            update_data = {
                "title": "Update de teste via API",
                "description": "Este é um teste da API com autenticação",
                "type": "progress",
                "status": "published",
                "people_impacted": 100,
                "budget_spent": "15000.00",
                "progress_percentage": 85
            }
            
            response = requests.post(
                f"{BASE_URL}/api/v1/tracking/projects/Joel/updates/",
                json=update_data,
                headers=headers
            )
            
            print(f"   Status da criação: {response.status_code}")
            
            if response.status_code == 201:
                created_update = response.json()
                print(f"   ✓ Update criado com sucesso!")
                print(f"   ID: {created_update.get('id')}")
                print(f"   Título: {created_update.get('title')}")
                print(f"   Autor: {created_update.get('author_name', 'N/A')}")
            else:
                print(f"   ✗ Erro: {response.text}")
                
        else:
            print(f"   ✗ Erro no login: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Erro de conexão: {e}")

if __name__ == "__main__":
    test_auth_and_create()
