#!/usr/bin/env python3
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User

def setup_test_user():
    """Configurar usuário para testes"""
    try:
        # Tentar obter usuário admin
        admin = User.objects.get(username='admin')
        admin.set_password('admin123')
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()
        print("✅ Usuário admin configurado com senha: admin123")
        
        # Verificar outros usuários
        users = User.objects.all()
        print(f"\n👥 Usuários no sistema:")
        for user in users:
            print(f"   - {user.username} (Staff: {user.is_staff}, Super: {user.is_superuser})")
            
    except User.DoesNotExist:
        # Criar novo usuário
        admin = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
        print("✅ Superusuário admin criado com senha: admin123")

if __name__ == "__main__":
    setup_test_user()
