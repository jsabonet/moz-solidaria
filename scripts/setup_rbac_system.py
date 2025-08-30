#!/usr/bin/env python
# scripts/setup_rbac_system.py
"""
Script para configurar completamente o sistema RBAC da Moz Solidária Hub
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management import call_command
from core.models import UserProfile
from core.permissions import SYSTEM_PERMISSIONS, GROUPS_PERMISSIONS

def create_content_types():
    """Cria content types customizados para permissões"""
    
    # Content types para os módulos do sistema
    content_types = [
        ('system', 'Sistema'),
        ('users', 'Usuários'),
        ('blog', 'Blog'),
        ('projects', 'Projetos'),
        ('community', 'Comunidade'),
        ('reports', 'Relatórios'),
    ]
    
    created_content_types = {}
    
    for app_label, model in content_types:
        content_type, created = ContentType.objects.get_or_create(
            app_label='core',
            model=model.lower()
        )
        created_content_types[app_label] = content_type
        
        if created:
            print(f"✓ Content type criado: {model}")
        else:
            print(f"- Content type já existe: {model}")
    
    return created_content_types

def create_custom_permissions(content_types):
    """Cria permissões customizadas do sistema"""
    
    created_permissions = {}
    
    for module, permissions_list in SYSTEM_PERMISSIONS.items():
        print(f"\nProcessando módulo: {module}")
        
        # Verifica se o content type existe
        if module not in content_types:
            print(f"⚠ Content type não encontrado para {module}")
            continue
        
        content_type = content_types[module]
        
        # Processa cada permissão do módulo
        for perm_code, description in permissions_list:
            # Cria o codename removendo pontos (Django não permite)
            codename = perm_code.replace('.', '_')
            
            # Cria a permissão
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                content_type=content_type,
                defaults={'name': description}
            )
            
            created_permissions[perm_code] = permission
            
            if created:
                print(f"✓ Permissão criada: {description}")
            else:
                print(f"- Permissão já existe: {description}")
    
    return created_permissions

def create_groups_and_assign_permissions(permissions):
    """Cria grupos e atribui permissões"""
    
    created_groups = {}
    
    for group_name, permissions_list in GROUPS_PERMISSIONS.items():
        # Cria o grupo
        group, created = Group.objects.get_or_create(name=group_name)
        created_groups[group_name] = group
        
        if created:
            print(f"✓ Grupo criado: {group_name}")
        else:
            print(f"- Grupo já existe: {group_name}")
        
        # Limpa permissões existentes
        group.permissions.clear()
        
        # Adiciona permissões ao grupo
        assigned_permissions = 0
        for perm_code in permissions_list:
            if perm_code in permissions:
                group.permissions.add(permissions[perm_code])
                assigned_permissions += 1
            else:
                print(f"⚠ Permissão não encontrada: {perm_code}")
        
        print(f"  → {assigned_permissions} permissões atribuídas ao grupo {group_name}")
    
    return created_groups

def create_super_admin_user():
    """Cria usuário super admin se não existir"""
    
    username = 'admin'
    email = 'admin@mozsolidaria.org'
    password = 'MozSolidaria2024!'
    
    if User.objects.filter(username=username).exists():
        print(f"- Super admin já existe: {username}")
        user = User.objects.get(username=username)
    else:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Super',
            last_name='Administrador'
        )
        print(f"✓ Super admin criado: {username}")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
    
    # Cria perfil se não existir
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'department': 'TI',
            'position': 'Administrador do Sistema',
            'location': 'Maputo',
            'is_active_admin': True
        }
    )
    
    if created:
        print(f"✓ Perfil criado para {username}")
    
    # Adiciona ao grupo Super Admin
    try:
        super_admin_group = Group.objects.get(name='Super Admin')
        user.groups.add(super_admin_group)
        print(f"✓ {username} adicionado ao grupo Super Admin")
    except Group.DoesNotExist:
        print("⚠ Grupo Super Admin não encontrado")
    
    return user

def run_migrations():
    """Executa migrações necessárias"""
    print("\n=== EXECUTANDO MIGRAÇÕES ===")
    
    try:
        # Cria migrações para os novos modelos
        print("Criando migrações...")
        call_command('makemigrations', 'core', verbosity=1)
        
        # Aplica migrações
        print("Aplicando migrações...")
        call_command('migrate', verbosity=1)
        
        print("✓ Migrações executadas com sucesso")
        
    except Exception as e:
        print(f"⚠ Erro nas migrações: {str(e)}")
        return False
    
    return True

def setup_rbac_system():
    """Função principal para configurar o sistema RBAC"""
    
    print("=== CONFIGURAÇÃO DO SISTEMA RBAC MOZ SOLIDÁRIA HUB ===\n")
    
    # 1. Executar migrações
    if not run_migrations():
        print("❌ Falha nas migrações. Abortando setup.")
        return False
    
    print("\n=== CRIANDO CONTENT TYPES ===")
    content_types = create_content_types()
    
    print("\n=== CRIANDO PERMISSÕES CUSTOMIZADAS ===")
    permissions = create_custom_permissions(content_types)
    
    print("\n=== CRIANDO GRUPOS E ATRIBUINDO PERMISSÕES ===")
    groups = create_groups_and_assign_permissions(permissions)
    
    print("\n=== CRIANDO SUPER ADMIN ===")
    admin_user = create_super_admin_user()
    
    print("\n=== RESUMO DA CONFIGURAÇÃO ===")
    print(f"✓ {len(content_types)} content types configurados")
    print(f"✓ {len(permissions)} permissões criadas")
    print(f"✓ {len(groups)} grupos configurados")
    print(f"✓ 1 super admin criado")
    
    print("\n=== GRUPOS E PERMISSÕES CRIADOS ===")
    for group_name, group in groups.items():
        perm_count = group.permissions.count()
        print(f"• {group_name}: {perm_count} permissões")
    
    print("\n=== PRÓXIMOS PASSOS ===")
    print("1. Adicione os middlewares ao settings.py:")
    print("   - 'backend.core.middleware.AuditMiddleware'")
    print("   - 'backend.core.middleware.SecurityMiddleware'")
    print("   - 'backend.core.middleware.PermissionLoggingMiddleware'")
    print("\n2. Inclua as URLs de permissões no urls.py principal")
    print("\n3. Configure o frontend para usar as permissões")
    print("\n4. Teste o sistema de login com o super admin criado")
    
    return True

if __name__ == '__main__':
    try:
        success = setup_rbac_system()
        if success:
            print("\n🎉 SISTEMA RBAC CONFIGURADO COM SUCESSO!")
        else:
            print("\n❌ FALHA NA CONFIGURAÇÃO DO SISTEMA RBAC")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERRO INESPERADO: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
