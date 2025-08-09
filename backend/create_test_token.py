#!/usr/bin/env python
"""
Script para criar um token de acesso de teste para poder testar a edição de projetos
"""

import os
import django
import sys
from datetime import datetime, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def create_test_token():
    """
    Cria um token de acesso de teste para usuário admin
    """
    try:
        # Buscar ou criar usuário admin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mozsolidaria.com',
                'first_name': 'Admin',
                'last_name': 'Sistema',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            print(f"✅ Usuário admin criado")
        else:
            print(f"✅ Usuário admin encontrado")
            
        # Gerar token JWT
        refresh = RefreshToken.for_user(admin_user)
        access_token = str(refresh.access_token)
        
        print(f"""
🔑 TOKEN DE ACESSO GERADO:

{access_token}

📋 INSTRUÇÕES:
1. Copie o token acima
2. Abra o DevTools do navegador (F12)
3. Vá para a aba Console
4. Execute: localStorage.setItem('accessToken', '{access_token}')
5. Recarregue a página de edição

⏰ Token válido por: 24 horas
👤 Usuário: admin / admin123
        """)
        
    except Exception as e:
        print(f"❌ Erro ao criar token: {e}")

if __name__ == '__main__':
    create_test_token()
