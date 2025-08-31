#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User

# Verificar se o usuário já existe
username = 'adamoabdala'
email = 'admin@mozsolidaria.org'
password = 'Jeison2@@'

try:
    # Tentar obter o usuário existente
    user = User.objects.get(username=username)
    print(f"Usuário '{username}' já existe! Atualizando senha...")
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f"Senha do usuário '{username}' atualizada com sucesso!")
except User.DoesNotExist:
    # Criar novo usuário
    print(f"Criando novo superusuário '{username}'...")
    user = User.objects.create_superuser(username, email, password)
    print(f"Superusuário '{username}' criado com sucesso!")

print(f"Total de usuários no sistema: {User.objects.count()}")
