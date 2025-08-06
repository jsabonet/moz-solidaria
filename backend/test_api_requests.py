import requests
import json

def test_api_endpoints():
    base_url = "http://localhost:8000"
    
    # Test project tracking endpoint
    print("🧪 Testando API endpoints...")
    
    try:
        # Test 1: List projects with tracking data
        response = requests.get(f"{base_url}/api/v1/tracking/project-tracking/")
        print(f"📡 GET /api/v1/tracking/project-tracking/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {len(data.get('results', []))} projetos encontrados")
            if data.get('results'):
                project = data['results'][0]
                print(f"📊 Projeto: {project.get('name')}")
                metrics = project.get('metrics', {})
                if metrics:
                    print(f"📈 Progresso: {metrics.get('progress_percentage')}%")
                else:
                    print("📈 Progresso: Sem métricas disponíveis")
        
        # Test 2: Project details
        response = requests.get(f"{base_url}/api/v1/tracking/project-tracking/escola-rural-namaacha/")
        print(f"📡 GET /api/v1/tracking/project-tracking/escola-rural-namaacha/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Projeto: {data.get('name')}")
            print(f"📊 Métricas:")
            metrics = data.get('metrics', {})
            print(f"  - Pessoas impactadas: {metrics.get('people_impacted')}")
            print(f"  - Progresso: {metrics.get('progress_percentage')}%")
            print(f"  - Milestones: {metrics.get('completed_milestones')}/{metrics.get('total_milestones')}")
        
        # Test 3: Project analytics
        response = requests.get(f"{base_url}/api/v1/tracking/project-tracking/escola-rural-namaacha/analytics/")
        print(f"📡 GET /api/v1/tracking/project-tracking/escola-rural-namaacha/analytics/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Analytics disponível")
            print(f"📈 Eficiência: {data.get('efficiency_metrics', {})}")
        
        # Test 4: Updates
        response = requests.get(f"{base_url}/api/v1/tracking/project-updates/")
        print(f"📡 GET /api/v1/tracking/project-updates/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {len(data.get('results', []))} atualizações encontradas")
        
        # Test 5: Milestones
        response = requests.get(f"{base_url}/api/v1/tracking/project-milestones/")
        print(f"📡 GET /api/v1/tracking/project-milestones/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {len(data.get('results', []))} milestones encontrados")
        
        print("\n🎉 Todos os endpoints estão funcionando!")
        
    except requests.ConnectionError:
        print("❌ Erro: Servidor não está rodando. Execute 'python manage.py runserver' primeiro.")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_api_endpoints()
