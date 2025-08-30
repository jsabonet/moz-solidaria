#!/usr/bin/env python3
"""
Script para verificar e criar usuário admin para testes
"""

import os
import sys
import django

# Configurar Django
sys.path.append('d:\\Projectos\\moz-solidaria-hub-main\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User, Group
from django.contrib.auth.models import Permission

def setup_test_user():
    print("🔧 Configurando usuário admin para testes...")
    
    # Criar ou obter usuário admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@test.com',
            'first_name': 'Admin',
            'last_name': 'Test',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        }
    )
    
    if created:
        admin_user.set_password('123456')
        admin_user.save()
        print(f"✅ Usuário admin criado com sucesso!")
    else:
        admin_user.set_password('123456')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.save()
        print(f"✅ Usuário admin atualizado!")
    
    # Criar usuário comum para teste
    test_user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@test.com',
            'first_name': 'Test',
            'last_name': 'User',
            'is_staff': False,
            'is_superuser': False,
            'is_active': True
        }
    )
    
    if created:
        test_user.set_password('senha123')
        test_user.save()
        print(f"✅ Usuário de teste criado com sucesso!")
    else:
        test_user.set_password('senha123')
        test_user.is_staff = False
        test_user.is_superuser = False
        test_user.is_active = True
        test_user.save()
        print(f"✅ Usuário de teste atualizado!")
    
    # Verificar grupos
    groups = ['Super Admin', 'Gestor de Blog', 'Gestor de Projetos', 'Gestor de Comunidade', 'Visualizador']
    for group_name in groups:
        group, created = Group.objects.get_or_create(name=group_name)
        if created:
            print(f"✅ Grupo '{group_name}' criado!")
        else:
            print(f"ℹ️  Grupo '{group_name}' já existe")
    
    print(f"\n📊 Resumo:")
    print(f"   Total de usuários: {User.objects.count()}")
    print(f"   Total de grupos: {Group.objects.count()}")
    print(f"   Admin: {admin_user.username} (staff: {admin_user.is_staff}, super: {admin_user.is_superuser})")
    print(f"   Test User: {test_user.username} (staff: {test_user.is_staff}, super: {test_user.is_superuser})")

if __name__ == "__main__":
    setup_test_user()
