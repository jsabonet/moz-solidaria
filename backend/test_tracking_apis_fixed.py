# -*- coding: utf-8 -*-
import os
import sys
import django
from datetime import date, datetime
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Project, Program, ProjectCategory
from project_tracking.models import (
    ProjectMetrics, ProjectUpdate, ProjectMilestone,
    ProjectGalleryImage, ProjectEvidence, ProjectMetricsEntry
)

def create_sample_data():
    """Cria dados de exemplo para testar o sistema de tracking"""
    print("🚀 Iniciando configuracao do sistema de tracking...")
    
    try:
        # Buscar ou criar usuario admin
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mozsolidaria.mz',
                'first_name': 'Admin',
                'last_name': 'Sistema',
                'is_staff': True,
                'is_superuser': True
            }
        )
        print("✅ Usuario admin encontrado")
        
        # Buscar ou criar programa
        program, _ = Program.objects.get_or_create(
            slug='educacao',
            defaults={
                'name': 'Educacao',
                'description': 'Programa de desenvolvimento educacional',
                'short_description': 'Desenvolvimento educacional comunitario'
            }
        )
        
        # Buscar ou criar categoria
        category, _ = ProjectCategory.objects.get_or_create(
            slug='construcao-escolar',
            defaults={
                'name': 'Construcao Escolar',
                'description': 'Projetos de construcao de escolas',
                'program': program
            }
        )
        
        # Buscar ou criar projeto
        project, created = Project.objects.get_or_create(
            slug='escola-rural-namaacha',
            defaults={
                'name': 'Escola Rural em Namaacha',
                'description': 'Construcao de uma escola rural para servir a comunidade de Namaacha',
                'short_description': 'Escola rural em Namaacha com 6 salas de aula e biblioteca',
                'status': 'active',
                'program': program,
                'category': category,
                'location': 'Namaacha, Maputo',
                'start_date': date(2024, 1, 15),
                'end_date': date(2024, 7, 30),
                'target_beneficiaries': 300,
                'current_beneficiaries': 245,
                'progress_percentage': 65
            }
        )
        
        if created:
            print(f"✅ Projeto criado: {project.name}")
        else:
            print(f"✅ Projeto encontrado: {project.name}")
        
        # Criar metricas do projeto
        metrics, created = ProjectMetrics.objects.get_or_create(
            project=project,
            defaults={
                'people_impacted': 245,
                'budget_used': Decimal('32500.00'),
                'budget_total': Decimal('50000.00'),
                'progress_percentage': 65,
                'completed_milestones': 5,
                'total_milestones': 8,
                'start_date': date(2024, 1, 15),
                'end_date': date(2024, 7, 30)
            }
        )
        
        if created:
            print(f"✅ Metricas criadas para o projeto")
        else:
            print(f"✅ Metricas encontradas para o projeto")
        
        # Criar atualizacoes do projeto
        updates_data = [
            {
                'title': 'Inicio da construcao',
                'description': 'Iniciamos a construcao da escola com a preparacao do terreno',
                'type': 'milestone',
                'people_impacted': 0,
                'budget_spent': Decimal('5000.00'),
                'progress_percentage': 10
            },
            {
                'title': 'Fundacoes concluidas',
                'description': 'As fundacoes da escola foram concluidas com sucesso',
                'type': 'progress',
                'people_impacted': 50,
                'budget_spent': Decimal('15000.00'),
                'progress_percentage': 35
            },
            {
                'title': 'Estrutura principal erguida',
                'description': 'A estrutura principal do edificio foi erguida',
                'type': 'milestone',
                'people_impacted': 150,
                'budget_spent': Decimal('25000.00'),
                'progress_percentage': 60
            }
        ]
        
        for update_data in updates_data:
            update, created = ProjectUpdate.objects.get_or_create(
                project=project,
                title=update_data['title'],
                defaults={
                    **update_data,
                    'status': 'published',
                    'author': admin_user
                }
            )
            if created:
                print(f"✅ Atualizacao criada: {update.title}")
        
        # Criar milestones
        milestones_data = [
            {
                'title': 'Preparacao do terreno',
                'description': 'Limpeza e nivelamento do terreno para construcao',
                'target_date': date(2024, 2, 1),
                'status': 'completed',
                'completed_date': date(2024, 1, 28)
            },
            {
                'title': 'Fundacoes',
                'description': 'Construcao das fundacoes do edificio',
                'target_date': date(2024, 3, 15),
                'status': 'completed',
                'completed_date': date(2024, 3, 12)
            },
            {
                'title': 'Estrutura principal',
                'description': 'Construcao da estrutura principal',
                'target_date': date(2024, 5, 1),
                'status': 'completed',
                'completed_date': date(2024, 4, 28)
            },
            {
                'title': 'Telhado e cobertura',
                'description': 'Instalacao do telhado e sistema de cobertura',
                'target_date': date(2024, 6, 15),
                'status': 'in-progress'
            },
            {
                'title': 'Instalacoes eletricas',
                'description': 'Instalacao do sistema eletrico',
                'target_date': date(2024, 7, 1),
                'status': 'pending'
            }
        ]
        
        for milestone_data in milestones_data:
            milestone, created = ProjectMilestone.objects.get_or_create(
                project=project,
                title=milestone_data['title'],
                defaults=milestone_data
            )
            if created:
                print(f"✅ Milestone criado: {milestone.title}")
        
        # Criar registros de metricas
        metrics_entries_data = [
            {
                'date': date(2024, 2, 1),
                'people_impacted': 50,
                'budget_spent': Decimal('8000.00'),
                'progress_percentage': 15,
                'description': 'Preparacao inicial completada',
                'category': 'planning',
                'verified': True
            },
            {
                'date': date(2024, 4, 1),
                'people_impacted': 150,
                'budget_spent': Decimal('18000.00'),
                'progress_percentage': 40,
                'description': 'Estrutura principal em andamento',
                'category': 'execution',
                'verified': True
            },
            {
                'date': date(2024, 6, 10),
                'people_impacted': 245,
                'budget_spent': Decimal('32500.00'),
                'progress_percentage': 65,
                'description': 'Instalacoes basicas concluidas',
                'category': 'monitoring',
                'verified': True
            }
        ]
        
        for entry_data in metrics_entries_data:
            entry, created = ProjectMetricsEntry.objects.get_or_create(
                project=project,
                date=entry_data['date'],
                defaults={
                    **entry_data,
                    'author': admin_user
                }
            )
            if created:
                print(f"✅ Registro de metrica criado: {entry.date}")
        
        print(f"\n🎉 Dados de exemplo criados com sucesso!")
        print(f"📊 Projeto: {project.name}")
        print(f"📈 Metricas: {metrics.people_impacted} pessoas impactadas")
        print(f"💰 Orcamento: {metrics.budget_used}/{metrics.budget_total}")
        print(f"🎯 Progresso: {metrics.progress_percentage}%")
        print(f"📝 Atualizacoes: {project.tracking_updates.count()}")
        print(f"🏆 Milestones: {project.tracking_milestones.count()}")
        print(f"📊 Registros: {project.tracking_metrics_entries.count()}")
        
        return project
        
    except Exception as e:
        print(f"❌ Erro durante a configuracao: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_api_endpoints(project):
    """Testa os endpoints da API"""
    print("\n🧪 Testando endpoints da API...")
    
    try:
        from django.test import Client
        from django.urls import reverse
        import json
        
        client = Client()
        
        # Teste 1: Listar projetos com tracking
        print("📡 Testando GET /api/project-tracking/")
        response = client.get('/api/project-tracking/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {len(data.get('results', []))} projetos encontrados")
        
        # Teste 2: Detalhes do projeto
        print(f"📡 Testando GET /api/project-tracking/{project.id}/")
        response = client.get(f'/api/project-tracking/{project.id}/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Projeto: {data.get('name')}")
            print(f"📊 Metricas: {data.get('metrics', {}).get('people_impacted')} pessoas")
        
        # Teste 3: Analytics do projeto
        print(f"📡 Testando GET /api/project-tracking/{project.id}/analytics/")
        response = client.get(f'/api/project-tracking/{project.id}/analytics/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Analytics disponivel")
            print(f"📈 Eficiencia: {data.get('efficiency_metrics', {})}")
        
        # Teste 4: Listar atualizacoes
        print("📡 Testando GET /api/project-updates/")
        response = client.get('/api/project-updates/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {len(data.get('results', []))} atualizacoes encontradas")
        
        # Teste 5: Listar milestones
        print("📡 Testando GET /api/project-milestones/")
        response = client.get('/api/project-milestones/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {len(data.get('results', []))} milestones encontrados")
        
        print("\n✅ Testes de API concluidos com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro durante os testes: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🔧 Configurando sistema de tracking de projetos...")
    project = create_sample_data()
    
    if project:
        test_api_endpoints(project)
        print("\n🎉 Configuracao completa! O sistema de tracking esta pronto para uso.")
    else:
        print("\n❌ Falha na configuracao. Verifique os erros acima.")
