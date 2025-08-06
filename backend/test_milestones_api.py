#!/usr/bin/env python3
"""
Teste da API de marcos
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.models import ProjectMilestone
from core.models import Project

def test_milestones_api():
    """Testar API de marcos"""
    print("=== TESTE: API DE MARCOS ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        milestones = project.tracking_milestones.all().order_by('order', 'target_date')
        
        print(f"\n🎯 MARCOS DO PROJETO '{project.name}':")
        print(f"   Total: {milestones.count()}")
        
        for i, milestone in enumerate(milestones, 1):
            status_emoji = {
                'completed': '✅',
                'in-progress': '🔄',
                'pending': '⏳',
                'delayed': '🚨'
            }.get(milestone.status, '❓')
            
            print(f"\n   {i}. {status_emoji} {milestone.title}")
            print(f"      Status: {milestone.get_status_display()}")
            print(f"      Data alvo: {milestone.target_date}")
            print(f"      Progresso: {milestone.progress}%")
            print(f"      Descrição: {milestone.description[:50]}...")
            if milestone.completed_date:
                print(f"      Concluído em: {milestone.completed_date}")
        
        # Testar endpoint direto
        print(f"\n🔗 ENDPOINT: /api/v1/tracking/projects/{project.slug}/milestones/")
        print(f"   Disponível em: http://localhost:8000/api/v1/tracking/projects/{project.slug}/milestones/")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_milestones_api()
