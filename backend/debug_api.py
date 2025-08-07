import json
import requests

# Testar com diferentes métodos
print("=== TESTE DETALHADO DA API ===")

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

url = 'http://localhost:8000/api/v1/tracking/project-tracking/futuro-sustentavel/'

try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Headers da resposta: {dict(response.headers)}")
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"\nTotal de campos retornados: {len(data)}")
        print("\nCampos da resposta:")
        for key in sorted(data.keys()):
            print(f"  - {key}")
        
        print(f"\nStatus: {data.get('status', 'AUSENTE')}")
        print(f"Priority: {data.get('priority', 'AUSENTE')}")
        print(f"Program: {data.get('program', 'AUSENTE')}")
        print(f"Category: {data.get('category', 'AUSENTE')}")
        
        # Salvar resposta para análise
        with open('debug_api_response.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("\nResposta salva em debug_api_response.json")
        
    else:
        print(f"Erro: {response.status_code}")
        print(f"Conteúdo: {response.text}")
        
except Exception as e:
    print(f"Erro de conexão: {e}")
