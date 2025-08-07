import requests
import json

try:
    response = requests.get('http://localhost:8000/api/v1/tracking/test/futuro-sustentavel/')
    
    print("Status da resposta:", response.status_code)
    
    if response.status_code == 200:
        data = response.json()
        
        if data.get('success'):
            project_data = data.get('data', {})
            print("\n--- Dados do endpoint de teste ---")
            print("Nome:", project_data.get('name'))
            print("Status:", project_data.get('status'))
            print("Status Display:", project_data.get('status_display'))
            print("Priority:", project_data.get('priority'))
            print("Priority Display:", project_data.get('priority_display'))
            print("Program:", project_data.get('program'))
            print("Category:", project_data.get('category'))
            
            print("\n--- Campos disponíveis ---")
            print("Campos:", list(project_data.keys()))
            
        else:
            print("Erro:", data.get('error'))
    else:
        print("Erro HTTP:", response.status_code)
        print("Resposta:", response.text)
        
except Exception as e:
    print("Erro ao fazer request:", e)
