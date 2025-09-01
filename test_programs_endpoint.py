#!/usr/bin/env python3
"""
Teste do endpoint de programas após habilitação
"""
import requests
import json
import sys

# URLs para testar
BASE_URL = "http://209.97.128.71:8000"
ENDPOINTS = [
    "/api/v1/core/programs/",
    "/api/v1/projects/public/projects/",  # Para comparar estrutura
]

def test_endpoint(url):
    """Testa um endpoint específico"""
    try:
        print(f"\n🧪 Testando: {url}")
        response = requests.get(url, timeout=10)
        
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ Sucesso! Dados recebidos:")
                if isinstance(data, list):
                    print(f"  📦 Lista com {len(data)} itens")
                    if data:
                        print(f"  📝 Primeiro item: {json.dumps(data[0], indent=2, ensure_ascii=False)}")
                    else:
                        print("  ⚠️ Lista vazia")
                elif isinstance(data, dict):
                    print(f"  📦 Objeto com {len(data)} campos")
                    if 'results' in data:
                        results = data['results']
                        print(f"  📝 Resultados: {len(results)} itens")
                        if results:
                            print(f"  📝 Primeiro resultado: {json.dumps(results[0], indent=2, ensure_ascii=False)}")
                    else:
                        print(f"  📝 Dados: {json.dumps(data, indent=2, ensure_ascii=False)}")
                else:
                    print(f"  📝 Dados: {data}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ Erro ao decodificar JSON: {e}")
                print(f"Raw response: {response.text[:500]}...")
        else:
            print(f"❌ Erro: {response.status_code}")
            print(f"Resposta: {response.text[:500]}...")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

def main():
    print("🚀 Testando endpoints de programas...")
    
    for endpoint in ENDPOINTS:
        url = BASE_URL + endpoint
        test_endpoint(url)
    
    print("\n🏁 Teste concluído!")

if __name__ == "__main__":
    main()
