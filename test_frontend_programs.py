#!/usr/bin/env python3
"""
Teste do frontend para verificar se a seleção de programas está funcionando
"""
import requests
import json
import sys

def test_frontend_api():
    """Testa se o frontend consegue buscar programas"""
    try:
        print("🧪 Testando API que o frontend usa...")
        
        # URL que o frontend usa (baseado no api.ts)
        url = "http://209.97.128.71:8000/api/v1/core/programs/"
        
        print(f"📡 Fazendo requisição para: {url}")
        response = requests.get(url, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sucesso! Resposta:")
            print(f"  📦 Tipo: {type(data)}")
            
            if isinstance(data, dict):
                if 'results' in data:
                    results = data['results']
                    print(f"  📝 Results: {len(results)} programas")
                    if results:
                        print(f"  🎯 Primeiro programa:")
                        prog = results[0]
                        print(f"    - ID: {prog.get('id')}")
                        print(f"    - Nome: {prog.get('name')}")
                        print(f"    - Slug: {prog.get('slug')}")
                        print(f"    - Cor: {prog.get('color')}")
                        print(f"    - Ícone: {prog.get('icon')}")
                        
                        # Verificar se tem todos os campos necessários
                        required_fields = ['id', 'name']
                        missing_fields = [field for field in required_fields if field not in prog]
                        if missing_fields:
                            print(f"    ⚠️ Campos faltando: {missing_fields}")
                        else:
                            print(f"    ✅ Todos os campos necessários presentes")
                else:
                    print(f"  📝 Objeto direto: {data}")
                    
            elif isinstance(data, list):
                print(f"  📝 Array direto: {len(data)} programas")
                if data:
                    print(f"  🎯 Primeiro programa: {data[0]}")
            
            print(f"\n🧬 Estrutura completa da resposta:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
        else:
            print(f"❌ Erro: {response.status_code}")
            print(f"Resposta: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

def main():
    print("🚀 Testando integração frontend com API de programas...")
    test_frontend_api()
    print("\n🏁 Teste concluído!")

if __name__ == "__main__":
    main()
