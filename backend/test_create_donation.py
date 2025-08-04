#!/usr/bin/env python
"""Script para testar criação de doação"""

import os
import django
import requests

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from donations.models import DonationMethod

# Get a superuser
user = User.objects.filter(is_superuser=True).first()
if user:
    token, created = Token.objects.get_or_create(user=user)
    print(f"User: {user.username}")
    print(f"Token: {token.key}")
    
    # Get a donation method
    method = DonationMethod.objects.filter(is_active=True).first()
    if method:
        print(f"Using donation method: {method.id} - {method.name}")
        
        # Test the API
        headers = {
            'Authorization': f'Token {token.key}',
        }
        
        data = {
            'amount': '100.00',
            'donation_method': str(method.id),
            'donor_message': 'Teste de doação via API',
        }
        
        try:
            response = requests.post('http://localhost:8000/api/v1/donations/', headers=headers, data=data)
            print(f"Status: {response.status_code}")
            if response.status_code == 400:
                print(f"Error Response: {response.json()}")
            else:
                print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("No active donation methods found")
else:
    print("No superuser found")
