#!/usr/bin/env python3
"""
Script para testar os endpoints de tracking corrigidos
"""
import requests
import json

BASE_URL = 'http://localhost:8000'

def test_endpoints():
    print("🧪 Testando endpoints de tracking corrigidos\n")
    
    # 1. Testar project tracking detail
    print("1. 📊 Testando GET /api/v1/tracking/project-tracking/futuro-sustentavel/")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/tracking/project-tracking/futuro-sustentavel/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Dados obtidos: {data.get('name', 'N/A')}")
            print(f"   📝 Updates: {len(data.get('updates', []))}")
            print(f"   🏆 Milestones: {len(data.get('milestones', []))}")
        else:
            print(f"   ❌ Erro: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exceção: {e}")
    
    print()
    
    # 2. Testar project updates list
    print("2. 📝 Testando GET /api/v1/tracking/projects/futuro-sustentavel/updates/")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/tracking/projects/futuro-sustentavel/updates/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"   ✅ {len(data)} updates encontrados")
                for update in data[:3]:  # Mostrar apenas os primeiros 3
                    print(f"      - {update.get('title', 'N/A')}")
            else:
                print(f"   ✅ Dados: {type(data)}")
        else:
            print(f"   ❌ Erro: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exceção: {e}")
    
    print()
    
    # 3. Testar com slug do Joel também
    print("3. 📊 Testando GET /api/v1/tracking/project-tracking/Joel/")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/tracking/project-tracking/Joel/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Dados obtidos: {data.get('name', 'N/A')}")
            print(f"   📝 Updates: {len(data.get('updates', []))}")
        else:
            print(f"   ❌ Erro: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exceção: {e}")
    
    print()
    
    # 4. Testar endpoints gerais
    print("4. 📝 Testando GET /api/v1/tracking/project-updates/ (endpoint geral)")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/tracking/project-updates/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"   ✅ {len(data)} updates no total")
            elif 'results' in data:
                print(f"   ✅ {len(data['results'])} updates (paginados)")
        else:
            print(f"   ❌ Erro: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exceção: {e}")

if __name__ == "__main__":
    test_endpoints()
