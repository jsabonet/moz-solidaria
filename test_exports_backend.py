import requests
import json

# Testar endpoints de exportação
BASE_URL = "http://localhost:8000/api/v1/reports/exports"

def test_export_endpoint(area, format_type="json", export_type="all"):
    """Testar endpoint de exportação"""
    url = f"{BASE_URL}/{area}/"
    data = {
        "format": format_type,
        "type": export_type
    }
    
    try:
        print(f"\n🧪 Testando exportação de {area} (formato: {format_type})")
        response = requests.post(url, json=data, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            if format_type == "json":
                try:
                    result = response.json()
                    print("✅ Sucesso! Dados retornados:")
                    print(json.dumps(result, indent=2, ensure_ascii=False)[:500] + "...")
                except:
                    print("✅ Sucesso! Arquivo binário gerado")
            else:
                print("✅ Sucesso! Arquivo binário gerado")
        else:
            print(f"❌ Erro: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Backend não está rodando")
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

# Testar todos os endpoints
if __name__ == "__main__":
    print("🚀 Testando endpoints de exportação...")
    
    # Testar cada área
    areas = ["projects", "donations", "volunteers", "beneficiaries"]
    formats = ["json", "csv"]
    
    for area in areas:
        for fmt in formats:
            test_export_endpoint(area, fmt)
    
    print("\n✅ Testes concluídos!")
