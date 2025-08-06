#!/usr/bin/env python3
"""
Reset das métricas para valores realistas
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
from datetime import datetime

def reset_metrics_to_realistic():
    """Reset das métricas para valores realistas"""
    print("=== RESET DAS MÉTRICAS PARA VALORES REALISTAS ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        metrics = project.metrics
        
        print(f"\n📊 Estado atual das métricas:")
        print(f"   Pessoas impactadas: {metrics.people_impacted}")
        print(f"   Orçamento usado: {metrics.budget_used}")
        print(f"   Progresso: {metrics.progress_percentage}%")
        
        # Reset para valores realistas
        metrics.people_impacted = 8215  # Valor original correto
        metrics.budget_used = "1079176.00"  # Valor original correto
        metrics.progress_percentage = 85  # Valor original correto
        metrics.last_updated = datetime.now()
        metrics.save()
        
        print(f"\n✅ Métricas resetadas:")
        print(f"   Pessoas impactadas: {metrics.people_impacted}")
        print(f"   Orçamento usado: {metrics.budget_used}")
        print(f"   Progresso: {metrics.progress_percentage}%")
        
        # Mostrar quantos updates temos
        total_updates = project.tracking_updates.filter(status='published').count()
        print(f"\n📈 Total de updates publicados: {total_updates}")
        
        # Mostrar os últimos 5 updates
        recent_updates = project.tracking_updates.filter(status='published').order_by('-created_at')[:5]
        print(f"\n📝 Últimos 5 updates:")
        for update in recent_updates:
            print(f"   - {update.title}: {update.people_impacted or 0} pessoas, {update.budget_spent or 0} MZN, {update.progress_percentage or 0}%")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    reset_metrics_to_realistic()
