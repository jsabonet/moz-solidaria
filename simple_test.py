#!/usr/bin/env python3
"""
Teste simples do endpoint
"""

try:
    import requests
    
    # Teste básico
    response = requests.get("http://127.0.0.1:8000/api/v1/reports/")
    print(f"Status: {response.status_code}")
    print(f"Resposta: {response.text[:200]}...")
    
except ImportError:
    print("Requests não está instalado")
except Exception as e:
    print(f"Erro: {e}")
