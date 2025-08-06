# backend/test_tracking_apis.py
import os
import django
import sys
from decimal import Decimal
from datetime import date, datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Project
from project_tracking.models import (
    ProjectMetrics, ProjectUpdate, ProjectMilestone,
    ProjectGalleryImage, ProjectEvidence, ProjectMetricsEntry
)

def create_sample_tracking_data():
    """Cria dados de exemplo para testar o sistema de tracking"""
    
    # Buscar ou criar usuário admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@moz-solidaria.org',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"✅ Usuário admin criado")
    else:
        print(f"✅ Usuário admin encontrado")
    
    # Buscar ou criar projeto
    from core.models import Program, ProjectCategory
    
    # Buscar ou criar programa
    program, _ = Program.objects.get_or_create(
        slug='educacao',
        defaults={
            'name': 'Educação',
            'description': 'Programa de desenvolvimento educacional'
        }
    )
    
    # Buscar ou criar categoria
    category, _ = ProjectCategory.objects.get_or_create(
        slug='construcao-escolar',
        defaults={
            'name': 'Construção Escolar',
            'description': 'Projetos de construção de escolas',
            'program': program
        }
    )
    
    project, created = Project.objects.get_or_create(
        slug='escola-rural-namaacha',
        defaults={
            'name': 'Escola Rural em Namaacha',
            'description': 'Construção de uma escola rural para servir a comunidade de Namaacha',
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
    
    # Criar métricas do projeto
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
        print(f"✅ Métricas criadas para o projeto")
    else:
        print(f"✅ Métricas encontradas para o projeto")
    
    # Criar atualizações do projeto
    updates_data = [
        {
            'title': 'Construção da Primeira Fase Concluída',
            'description': 'A primeira fase da construção foi concluída com sucesso. Foram construídas 4 salas de aula e a biblioteca.',
            'type': 'progress',
            'status': 'published',
            'people_impacted': 120,
            'budget_spent': Decimal('15000.00'),
            'progress_percentage': 25
        },
        {
            'title': 'Inauguração Oficial',
            'description': 'A escola foi oficialmente inaugurada com a presença da comunidade local e autoridades.',
            'type': 'milestone',
            'status': 'published',
            'people_impacted': 245,
            'progress_percentage': 50
        },
        {
            'title': 'Primeiro Grupo de Estudantes Formados',
            'description': '25 estudantes completaram o programa de alfabetização básica.',
            'type': 'achievement',
            'status': 'published',
            'people_impacted': 25,
            'progress_percentage': 65
        }
    ]
    
    for update_data in updates_data:
        update, created = ProjectUpdate.objects.get_or_create(
            project=project,
            title=update_data['title'],
            defaults={
                **update_data,
                'author': admin_user
            }
        )
        if created:
            print(f"✅ Atualização criada: {update.title}")
    
    # Criar milestones
    milestones_data = [
        {
            'title': 'Planejamento e Aprovações',
            'description': 'Obter todas as aprovações necessárias e finalizar o planejamento detalhado.',
            'status': 'completed',
            'target_date': date(2024, 2, 15),
            'completed_date': date(2024, 2, 10)
        },
        {
            'title': 'Preparação do Terreno',
            'description': 'Limpeza e preparação do terreno para construção.',
            'status': 'completed',
            'target_date': date(2024, 3, 1),
            'completed_date': date(2024, 2, 28)
        },
        {
            'title': 'Fundações',
            'description': 'Construção das fundações do edifício principal.',
            'status': 'completed',
            'target_date': date(2024, 3, 20),
            'completed_date': date(2024, 3, 18)
        },
        {
            'title': 'Estrutura Principal',
            'description': 'Construção da estrutura principal e paredes.',
            'status': 'completed',
            'target_date': date(2024, 4, 30),
            'completed_date': date(2024, 4, 25)
        },
        {
            'title': 'Telhado e Cobertura',
            'description': 'Instalação do telhado e sistema de cobertura.',
            'status': 'completed',
            'target_date': date(2024, 5, 15),
            'completed_date': date(2024, 5, 12)
        },
        {
            'title': 'Instalações Elétricas e Hidráulicas',
            'description': 'Instalação dos sistemas elétrico e hidráulico.',
            'status': 'in-progress',
            'target_date': date(2024, 6, 10)
        },
        {
            'title': 'Acabamentos Internos',
            'description': 'Pintura, pisos e acabamentos internos.',
            'status': 'pending',
            'target_date': date(2024, 7, 1)
        },
        {
            'title': 'Mobiliário e Equipamentos',
            'description': 'Instalação de móveis e equipamentos educacionais.',
            'status': 'pending',
            'target_date': date(2024, 7, 20)
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
    
    # Criar registros de métricas
    metrics_entries_data = [
        {
            'date': date(2024, 2, 15),
            'people_impacted': 50,
            'budget_spent': Decimal('5000.00'),
            'progress_percentage': 15,
            'description': 'Início das obras - preparação do terreno',
            'category': 'planning',
            'verified': True
        },
        {
            'date': date(2024, 3, 30),
            'people_impacted': 100,
            'budget_spent': Decimal('12000.00'),
            'progress_percentage': 30,
            'description': 'Fundações concluídas',
            'category': 'execution',
            'verified': True
        },
        {
            'date': date(2024, 5, 15),
            'people_impacted': 180,
            'budget_spent': Decimal('25000.00'),
            'progress_percentage': 50,
            'description': 'Estrutura principal finalizada',
            'category': 'execution',
            'verified': True
        },
        {
            'date': date(2024, 6, 10),
            'people_impacted': 245,
            'budget_spent': Decimal('32500.00'),
            'progress_percentage': 65,
            'description': 'Instalações básicas concluídas',
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
            print(f"✅ Registro de métrica criado: {entry.date}")
    
    print(f"\n🎉 Dados de exemplo criados com sucesso!")
    print(f"📊 Projeto: {project.name}")
    print(f"📈 Métricas: {metrics.people_impacted} pessoas impactadas")
    print(f"💰 Orçamento: {metrics.budget_used}/{metrics.budget_total}")
    print(f"🎯 Progresso: {metrics.progress_percentage}%")
    print(f"📝 Atualizações: {project.tracking_updates.count()}")
    print(f"🏆 Milestones: {project.tracking_milestones.count()}")
    print(f"📊 Registros: {project.tracking_metrics_entries.count()}")

def test_api_endpoints():
    """Testa os endpoints da API"""
    print("\n🧪 Testando endpoints da API...")
    
    try:
        from django.test import Client
        from django.contrib.auth.models import User
        from rest_framework.authtoken.models import Token
        
        client = Client()
        
        # Buscar usuário admin
        admin_user = User.objects.get(username='admin')
        token, created = Token.objects.get_or_create(user=admin_user)
        
        # Teste do endpoint principal de tracking
        response = client.get(
            '/api/v1/tracking/projects/escola-rural-namaacha/',
            HTTP_AUTHORIZATION=f'Bearer {token.key}'
        )
        
        if response.status_code == 200:
            print("✅ Endpoint de tracking funcionando")
            data = response.json()
            print(f"   📊 Projeto: {data.get('name', 'N/A')}")
        else:
            print(f"❌ Erro no endpoint de tracking: {response.status_code}")
        
        # Teste do endpoint de métricas
        response = client.get(
            '/api/v1/tracking/projects/escola-rural-namaacha/metrics/',
            HTTP_AUTHORIZATION=f'Bearer {token.key}'
        )
        
        if response.status_code == 200:
            print("✅ Endpoint de métricas funcionando")
        else:
            print(f"❌ Erro no endpoint de métricas: {response.status_code}")
        
        # Teste do endpoint de atualizações
        response = client.get(
            '/api/v1/tracking/projects/escola-rural-namaacha/updates/',
            HTTP_AUTHORIZATION=f'Bearer {token.key}'
        )
        
        if response.status_code == 200:
            print("✅ Endpoint de atualizações funcionando")
            data = response.json()
            print(f"   📝 {len(data)} atualizações encontradas")
        else:
            print(f"❌ Erro no endpoint de atualizações: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro ao testar APIs: {str(e)}")

if __name__ == '__main__':
    print("🚀 Iniciando configuração do sistema de tracking...")
    
    try:
        create_sample_tracking_data()
        test_api_endpoints()
        
        print("\n✅ Sistema de tracking configurado com sucesso!")
        print("\n📋 Próximos passos:")
        print("1. Iniciar o servidor Django: python manage.py runserver")
        print("2. Testar as APIs no frontend")
        print("3. Verificar o dashboard de administração")
        
    except Exception as e:
        print(f"❌ Erro durante a configuração: {str(e)}")
        sys.exit(1)
