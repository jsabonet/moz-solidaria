#!/usr/bin/env python3
"""
Script para testar o endpoint de exportação de PDF corrigido
"""

import requests
import json

def test_export_endpoint():
    print("🧪 TESTE: Endpoint de Exportação PDF")
    print("=" * 40)
    
    # 1. Login
    print("\n1️⃣ Fazendo login...")
    login_data = {"username": "admin", "password": "123456"}
    
    response = requests.post("http://127.0.0.1:8000/api/v1/auth/token/", json=login_data)
    if response.status_code == 200:
        token = response.json().get('access')
        print(f"✅ Login OK! Token: {token[:20]}...")
    else:
        print(f"❌ Erro no login: {response.status_code}")
        return

    # 2. Testar exportação
    print("\n2️⃣ Testando exportação...")
    headers = {'Authorization': f'Bearer {token}'}
    
    export_data = {
        "type": "blog",
        "format": "pdf", 
        "filename": "test_blog_export",
        "options": {}
    }
    
    response = requests.post(
        "http://127.0.0.1:8000/api/v1/reports/exports/generate/",
        headers=headers,
        json=export_data
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        content_type = response.headers.get('content-type', '')
        print(f"✅ Sucesso! Tipo: {content_type}")
        
        if 'pdf' in content_type:
            with open('blog_export_test.pdf', 'wb') as f:
                f.write(response.content)
            print("📄 PDF salvo como 'blog_export_test.pdf'")
        elif 'json' in content_type:
            print("📄 Recebido fallback JSON:")
            print(response.text[:300])
    else:
        print(f"❌ Erro: {response.status_code}")
        print(response.text[:300])

if __name__ == "__main__":
    try:
        test_export_endpoint()
    except Exception as e:
        print(f"❌ Erro: {e}")
