import requests
import json

try:
    # Testar endpoint básico de projetos
    response = requests.get('http://localhost:8000/api/v1/projects/public/projects/?slug=futuro-sustentavel')
    
    print("=== TESTE ENDPOINT BÁSICO ===")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        
        if results:
            project = results[0]
            print(f"\nTotal de campos: {len(project)}")
            print("Campos disponíveis:")
            for key in sorted(project.keys()):
                print(f"  - {key}")
            
            print(f"\nStatus: {project.get('status', 'AUSENTE')}")
            print(f"Priority: {project.get('priority', 'AUSENTE')}")
            print(f"Program: {project.get('program', 'AUSENTE')}")
            print(f"Category: {project.get('category', 'AUSENTE')}")
            
            # Verificar relacionamentos
            if project.get('program_id'):
                print(f"Program ID: {project.get('program_id')}")
            if project.get('category_id'):
                print(f"Category ID: {project.get('category_id')}")
        else:
            print("Nenhum projeto encontrado")
    else:
        print(f"Erro: {response.status_code}")
        print(f"Resposta: {response.text}")
        
except Exception as e:
    print(f"Erro de conexão: {e}")
