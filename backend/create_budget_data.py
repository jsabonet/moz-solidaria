#!/usr/bin/env python
"""
Script para criar dados de orçamento de exemplo para demonstrar a funcionalidade
de "Orçamento Utilizado" em tempo real no ProjectDetails.tsx
"""

import os
import django
import sys
from decimal import Decimal
from datetime import date

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project
from project_tracking.models import ProjectMetrics

def create_budget_data():
    """
    Cria dados de orçamento de exemplo para o projeto 'educacao-para-todos'
    """
    try:
        # Buscar o projeto existente
        project = Project.objects.get(slug='educacao-para-todos')
        print(f"✅ Projeto encontrado: {project.name}")
        
        # Definir valores de exemplo realistas
        budget_total = Decimal('50000.00')  # 50.000 MZN
        budget_used = Decimal('23750.00')   # 47.5% utilizado
        people_impacted = 125               # 125 de 300 pessoas (41.7%)
        
        # Atualizar o projeto base com orçamento total
        project.budget = budget_total
        project.target_beneficiaries = 300
        project.current_beneficiaries = people_impacted
        project.save()
        print(f"✅ Projeto atualizado com orçamento total: {budget_total}")
        
        # Criar ou atualizar métricas de tracking
        metrics, created = ProjectMetrics.objects.get_or_create(
            project=project,
            defaults={
                'people_impacted': people_impacted,
                'budget_used': budget_used,
                'budget_total': budget_total,
                'progress_percentage': 47,  # 47% de progresso
                'completed_milestones': 3,
                'total_milestones': 6,
                'start_date': date(2025, 8, 7),
                'end_date': date(2025, 12, 31),
            }
        )
        
        if not created:
            # Atualizar métricas existentes
            metrics.people_impacted = people_impacted
            metrics.budget_used = budget_used
            metrics.budget_total = budget_total
            metrics.progress_percentage = 47
            metrics.completed_milestones = 3
            metrics.total_milestones = 6
            metrics.save()
            print(f"✅ Métricas atualizadas")
        else:
            print(f"✅ Métricas criadas")
        
        print(f"""
📊 DADOS DE ORÇAMENTO CRIADOS COM SUCESSO:

🔹 Projeto: {project.name}
🔹 Orçamento Total: {budget_total:,.2f} MZN
🔹 Orçamento Utilizado: {budget_used:,.2f} MZN
🔹 Percentual Utilizado: {(budget_used/budget_total)*100:.1f}%
🔹 Pessoas Impactadas: {people_impacted} de {project.target_beneficiaries}
🔹 Progresso Geral: {metrics.progress_percentage}%

✅ Agora o campo "Orçamento Utilizado" no frontend funcionará em tempo real!
        """)
        
    except Project.DoesNotExist:
        print("❌ Projeto 'educacao-para-todos' não encontrado!")
        print("📋 Projetos disponíveis:")
        for proj in Project.objects.all():
            print(f"  - {proj.slug}: {proj.name}")
    
    except Exception as e:
        print(f"❌ Erro ao criar dados de orçamento: {e}")

if __name__ == '__main__':
    create_budget_data()
