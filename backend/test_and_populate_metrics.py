#!/usr/bin/env python3
"""
Teste para verificar e popular métricas do projeto Joel
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.models import ProjectMetrics, ProjectUpdate
from core.models import Project
from datetime import datetime, date
import requests

def test_and_populate_metrics():
    """Verificar e popular métricas para o projeto Joel"""
    print("=== VERIFICAÇÃO E POPULAÇÃO DE MÉTRICAS ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        print(f"✅ Projeto encontrado: {project.name}")
        
        # Verificar se já tem métricas
        try:
            metrics = project.metrics
            print(f"✅ Métricas já existem: ID {metrics.id}")
            print(f"   Pessoas impactadas: {metrics.people_impacted}")
            print(f"   Orçamento usado: {metrics.budget_used}")
            print(f"   Orçamento total: {metrics.budget_total}")
            print(f"   Progresso: {metrics.progress_percentage}%")
            print(f"   Marcos: {metrics.completed_milestones}/{metrics.total_milestones}")
        except ProjectMetrics.DoesNotExist:
            print("⚠️ Métricas não existem, criando...")
            
            # Calcular métricas baseadas nos updates
            updates = project.tracking_updates.filter(status='published')
            total_people = sum(update.people_impacted or 0 for update in updates)
            total_budget_spent = sum(float(update.budget_spent or 0) for update in updates)
            
            # Criar métricas
            metrics = ProjectMetrics.objects.create(
                project=project,
                people_impacted=total_people,
                budget_used=total_budget_spent,
                budget_total=100000.00,  # Valor exemplo
                progress_percentage=75,  # Valor exemplo
                completed_milestones=3,
                total_milestones=5,
                start_date=date(2024, 1, 1),
                end_date=date(2025, 12, 31),
                last_updated=datetime.now()
            )
            print(f"✅ Métricas criadas: ID {metrics.id}")
        
        # Testar endpoint
        print("\n2. Testando endpoint de tracking...")
        auth_response = requests.post('http://localhost:8000/api/v1/auth/token/', {
            'username': 'admin',
            'password': 'admin123'
        })
        
        if auth_response.status_code == 200:
            token = auth_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            response = requests.get('http://localhost:8000/api/v1/tracking/project-tracking/Joel/', headers=headers)
            if response.status_code == 200:
                data = response.json()
                print("✅ Endpoint funcionando")
                print(f"   Updates: {len(data.get('updates', []))}")
                print(f"   Métricas: {data.get('metrics', {}).get('id', 'N/A')}")
                print(f"   Pessoas impactadas: {data.get('metrics', {}).get('people_impacted', 'N/A')}")
                print(f"   Progresso: {data.get('metrics', {}).get('progress_percentage', 'N/A')}%")
            else:
                print(f"❌ Erro no endpoint: {response.status_code}")
        else:
            print(f"❌ Erro na autenticação: {auth_response.status_code}")
            
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")

if __name__ == "__main__":
    test_and_populate_metrics()
