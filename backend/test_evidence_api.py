#!/usr/bin/env python3
"""
Teste da API de evidências
"""
import requests
import json

def test_evidence_api():
    """Testar API de evidências"""
    print("=== TESTE: API DE EVIDÊNCIAS ===")
    
    url = "http://localhost:8000/api/v1/tracking/projects/Joel/evidence/"
    
    try:
        # GET - Listar evidências
        print(f"\n🔍 GET {url}")
        response = requests.get(url)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Verificar se são dados paginados ou lista direta
            if isinstance(data, dict) and 'results' in data:
                evidences = data['results']
                total = data.get('count', len(evidences))
                print(f"Evidências encontradas: {total}")
            else:
                evidences = data
                print(f"Evidências encontradas: {len(evidences)}")
            
            if evidences:
                print(f"\n📋 Primeiras evidências:")
                for evidence in evidences[:3]:
                    print(f"   • {evidence.get('title', 'N/A')}")
                    print(f"     Tipo: {evidence.get('type', 'N/A')}")
                    print(f"     Categoria: {evidence.get('category', 'N/A')}")
                    print(f"     Arquivo: {evidence.get('file', 'N/A')}")
                    print()
            
            print(f"✅ API de evidências funcionando!")
        else:
            print(f"❌ Erro: {response.status_code}")
            print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_evidence_api()
