#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project
from project_tracking.models import ProjectUpdate
from django.contrib.auth.models import User

def create_test_update():
    print("=== Criar Update de Teste ===\n")
    
    try:
        # Buscar projeto
        project = Project.objects.get(slug='Joel')
        print(f"Projeto encontrado: {project.name}")
        
        # Buscar ou criar usuário
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user.set_password('admin123')
            user.save()
            print(f"Usuário criado: {user.username}")
        else:
            print(f"Usuário encontrado: {user.username}")
        
        # Criar update de teste
        update = ProjectUpdate.objects.create(
            project=project,
            author=user,
            title="Update de Teste Automático",
            description="Este é um update criado automaticamente para testar o sistema de tracking. O projeto está progredindo conforme planejado.",
            type="progress",
            status="published",
            people_impacted=50,
            budget_spent=25000.00,
            progress_percentage=75
        )
        
        print(f"Update criado: {update.title}")
        print(f"ID: {update.id}")
        print(f"Tipo: {update.type}")
        print(f"Status: {update.status}")
        
        # Verificar total de updates
        total_updates = project.tracking_updates.count()
        print(f"\nTotal de updates do projeto: {total_updates}")
        
        print("\n=== Teste Finalizado ===")
        print("Agora você pode testar o frontend em:")
        print("- http://localhost:8080 (ou a porta que estiver rodando)")
        print("- Vá para a seção de gerenciamento de projetos")
        print("- Selecione o projeto 'Joel'")
        print("- Acesse a aba 'Tracker'")
        
    except Project.DoesNotExist:
        print("Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    create_test_update()
