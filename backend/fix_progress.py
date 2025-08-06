#!/usr/bin/env python3
"""
Corrigir progresso para valor realista
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.models import ProjectMetrics
from core.models import Project

def fix_progress_percentage():
    """Corrigir progresso para valor realista"""
    print("=== CORRIGINDO PROGRESSO ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        metrics = project.metrics
        
        # Definir progresso realista baseado no que foi observado
        metrics.progress_percentage = 85  # 85% - um valor realista
        metrics.save()
        
        print(f"✅ Progresso corrigido para: {metrics.progress_percentage}%")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    fix_progress_percentage()
