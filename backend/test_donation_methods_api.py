#!/usr/bin/env python
"""Script para testar a API de métodos de doação"""

import os
import django
import requests

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Get a superuser
user = User.objects.filter(is_superuser=True).first()
if user:
    token, created = Token.objects.get_or_create(user=user)
    print(f"User: {user.username}")
    print(f"Token: {token.key}")
    
    # Test the API
    headers = {
        'Authorization': f'Token {token.key}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get('http://localhost:8000/api/v1/donations/methods/', headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No superuser found")
