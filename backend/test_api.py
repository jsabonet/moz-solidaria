import requests
import json

try:
    response = requests.get('http://localhost:8000/api/v1/tracking/project-tracking/futuro-sustentavel/')
    
    if response.status_code == 200:
        data = response.json()
        print("Status da resposta:", response.status_code)
        print("Status:", data.get('status'))
        print("Status Display:", data.get('status_display'))
        print("Priority:", data.get('priority'))
        print("Priority Display:", data.get('priority_display'))
        print("Program:", data.get('program'))
        print("Category:", data.get('category'))
    else:
        print("Erro:", response.status_code)
        print("Resposta:", response.text)
        
except Exception as e:
    print("Erro ao fazer request:", e)
