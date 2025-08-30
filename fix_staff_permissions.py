#!/usr/bin/env python
"""
Script para corrigir usuários que foram promovidos mas não têm is_staff=True
"""
import os
import sys
import django

# Configurar Django
sys.path.append('d:\\Projectos\\moz-solidaria-hub-main\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User, Group

print("🔧 CORRIGINDO USUÁRIOS COM GRUPOS MAS SEM is_staff")
print("="*60)

# Grupos que devem ter is_staff=True
staff_groups = ['Gestor de Blog', 'Gestor de Projetos', 'Gestor de Comunidade', 'Visualizador']

for group_name in staff_groups:
    try:
        group = Group.objects.get(name=group_name)
        users_in_group = group.user_set.all()
        
        print(f"\n📋 Grupo: {group_name}")
        print(f"   Usuários: {len(users_in_group)}")
        
        for user in users_in_group:
            print(f"   👤 {user.username}: is_staff={user.is_staff}, is_superuser={user.is_superuser}")
            
            if not user.is_staff and not user.is_superuser:
                print(f"   🔧 Corrigindo {user.username}: is_staff False -> True")
                user.is_staff = True
                user.save()
                print(f"   ✅ {user.username} corrigido!")
            else:
                print(f"   ✅ {user.username} já está correto")
                
    except Group.DoesNotExist:
        print(f"❌ Grupo '{group_name}' não encontrado")

print(f"\n🎯 VERIFICAÇÃO FINAL:")
print("="*30)

for group_name in staff_groups:
    try:
        group = Group.objects.get(name=group_name)
        users_in_group = group.user_set.all()
        
        for user in users_in_group:
            status = "✅" if user.is_staff else "❌"
            print(f"{status} {user.username} ({group_name}): is_staff={user.is_staff}")
            
    except Group.DoesNotExist:
        continue

print("\n" + "="*60)
print("✅ CORREÇÃO CONCLUÍDA!")
print("Agora todos os usuários promovidos devem ter acesso ao Dashboard")
print("="*60)
