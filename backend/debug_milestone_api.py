#!/usr/bin/env python3
"""
Debug API de marcos
"""
import requests
import json

def debug_milestone_api():
    """Debug da API de marcos"""
    print("=== DEBUG: API DE MARCOS ===")
    
    url = "http://localhost:8000/api/v1/tracking/projects/Joel/milestones/"
    
    try:
        # GET - Listar marcos
        print(f"\n🔍 GET {url}")
        response = requests.get(url)
        
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Type: {type(data)}")
            print(f"Length: {len(data) if isinstance(data, list) else 'N/A'}")
            print(f"Content: {json.dumps(data, indent=2, default=str)[:500]}...")
        else:
            print(f"Error response: {response.text}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    debug_milestone_api()
