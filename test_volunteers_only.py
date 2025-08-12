import requests
import json

# Testar apenas volunteers
def test_volunteers():
    url = "http://localhost:8000/api/v1/reports/exports/volunteers/"
    data = {"format": "json", "type": "all"}
    
    try:
        print("🧪 Testando volunteers JSON...")
        response = requests.post(url, json=data, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Sucesso! Dados retornados:")
            print(json.dumps(result, indent=2, ensure_ascii=False)[:500] + "...")
        else:
            print(f"❌ Erro: {response.text}")
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

if __name__ == "__main__":
    test_volunteers()
