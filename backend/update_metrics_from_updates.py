#!/usr/bin/env python3
"""
Atualizar métricas do projeto com dados baseados nos updates existentes
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

def update_metrics_from_updates():
    """Atualizar métricas baseadas nos updates existentes"""
    print("=== ATUALIZANDO MÉTRICAS BASEADAS NOS UPDATES ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        metrics = project.metrics
        
        # Calcular dados dos updates
        updates = project.tracking_updates.filter(status='published')
        print(f"📊 Analisando {updates.count()} updates publicados...")
        
        total_people = 0
        total_budget = 0
        max_progress = 0
        
        for update in updates:
            if update.people_impacted:
                total_people += update.people_impacted
            if update.budget_spent:
                total_budget += float(update.budget_spent)
            if update.progress_percentage:
                max_progress = max(max_progress, update.progress_percentage)
        
        print(f"   Total pessoas (de updates): {total_people}")
        print(f"   Total orçamento gasto (de updates): {total_budget}")
        print(f"   Maior progresso registrado: {max_progress}%")
        
        # Atualizar métricas
        metrics.people_impacted = total_people
        metrics.budget_used = total_budget
        metrics.progress_percentage = max_progress
        metrics.completed_milestones = 3  # Valor exemplo
        metrics.total_milestones = 5
        metrics.last_updated = datetime.now()
        metrics.save()
        
        print(f"\n✅ Métricas atualizadas:")
        print(f"   Pessoas impactadas: {metrics.people_impacted}")
        print(f"   Orçamento usado: {metrics.budget_used}")
        print(f"   Progresso: {metrics.progress_percentage}%")
        print(f"   Marcos: {metrics.completed_milestones}/{metrics.total_milestones}")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    update_metrics_from_updates()
