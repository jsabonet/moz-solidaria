import requests
import json

try:
    # Adicionando headers para evitar cache
    headers = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
    
    response = requests.get(
        'http://localhost:8000/api/v1/tracking/project-tracking/futuro-sustentavel/',
        headers=headers
    )
    
    print("Status da resposta:", response.status_code)
    
    if response.status_code == 200:
        data = response.json()
        
        print("\n--- Dados recebidos da API ---")
        print("Nome:", data.get('name'))
        print("Status:", data.get('status'))
        print("Status Display:", data.get('status_display'))
        print("Priority:", data.get('priority'))
        print("Priority Display:", data.get('priority_display'))
        print("Program:", data.get('program'))
        print("Category:", data.get('category'))
        
        print("\n--- Campos disponíveis na resposta ---")
        print("Todos os campos:", list(data.keys()))
        
        # Vamos salvar a resposta completa para análise
        with open('api_response_debug.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("\nResposta completa salva em 'api_response_debug.json'")
        
    else:
        print("Erro:", response.status_code)
        print("Resposta:", response.text)
        
except Exception as e:
    print("Erro ao fazer request:", e)
