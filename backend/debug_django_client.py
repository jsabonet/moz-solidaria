import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import AnonymousUser
import json

# Usar Django test client diretamente
client = Client()

# Fazer a requisição
response = client.get('/api/v1/tracking/project-tracking/futuro-sustentavel/')

print(f"=== TESTE COM DJANGO CLIENT ===")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    
    print(f"Total de campos: {len(data)}")
    print("Campos retornados:")
    for key in sorted(data.keys()):
        print(f"  - {key}")
    
    print(f"\nCampos críticos:")
    print(f"Status: {data.get('status', 'AUSENTE')}")
    print(f"Priority: {data.get('priority', 'AUSENTE')}")
    print(f"Program: {data.get('program', 'AUSENTE')}")
    print(f"Category: {data.get('category', 'AUSENTE')}")
    
    print(f"\nContent-Type: {response.get('content-type')}")
    print(f"Response size: {len(response.content)} bytes")
    
else:
    print(f"Erro: {response.status_code}")
    print(f"Content: {response.content}")
