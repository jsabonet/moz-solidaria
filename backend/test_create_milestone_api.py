#!/usr/bin/env python3
"""
Teste de criação de marco via API
"""
import requests
import json
from datetime import datetime

def test_create_milestone():
    """Testar criação de marco via API"""
    print("=== TESTE: CRIAÇÃO DE MARCO VIA API ===")
    
    url = "http://localhost:8000/api/v1/tracking/projects/Joel/milestones/"
    
    # Dados do novo marco
    milestone_data = {
        "title": f"Marco Teste API {datetime.now().strftime('%H:%M:%S')}",
        "description": "Marco criado via API REST para teste de funcionalidade",
        "target_date": "2025-08-25",
        "status": "pending",
        "progress": 0,
        "order": 99
    }
    
    try:
        print(f"\n📤 Enviando POST para {url}")
        print(f"📋 Dados: {json.dumps(milestone_data, indent=2)}")
        
        response = requests.post(
            url,
            json=milestone_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n📥 Response:")
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            created_milestone = response.json()
            print(f"\n✅ Marco criado com sucesso!")
            print(f"ID: {created_milestone.get('id')}")
            print(f"Título: {created_milestone.get('title')}")
            print(f"Status: {created_milestone.get('status')}")
            print(f"Data alvo: {created_milestone.get('target_date')}")
        else:
            print(f"\n❌ Erro na criação:")
            print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_create_milestone()
