#!/usr/bin/env python3
"""
Teste de criação de marco via API
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
from datetime import datetime, date, timedelta

def test_milestone_creation():
    """Testar criação de marco"""
    print("=== TESTE: CRIAÇÃO DE MARCO VIA API ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        
        print(f"\n📊 Estado antes:")
        initial_count = project.tracking_milestones.count()
        print(f"   Marcos existentes: {initial_count}")
        
        # Criar novo marco
        new_milestone = ProjectMilestone.objects.create(
            project=project,
            title=f"Marco de Teste {datetime.now().strftime('%H:%M:%S')}",
            description="Marco criado via teste para verificar funcionalidade",
            target_date=date.today() + timedelta(days=10),
            status='pending',
            progress=0,
            order=99
        )
        
        print(f"\n✅ Marco criado:")
        print(f"   ID: {new_milestone.id}")
        print(f"   Título: {new_milestone.title}")
        print(f"   Data alvo: {new_milestone.target_date}")
        print(f"   Status: {new_milestone.get_status_display()}")
        
        print(f"\n📊 Estado depois:")
        final_count = project.tracking_milestones.count()
        print(f"   Marcos existentes: {final_count}")
        print(f"   Marcos criados: {final_count - initial_count}")
        
        # Verificar se as métricas foram atualizadas via signal
        project.metrics.refresh_from_db()
        print(f"\n📈 Métricas atualizadas:")
        print(f"   Total marcos: {project.metrics.total_milestones}")
        print(f"   Marcos concluídos: {project.metrics.completed_milestones}")
        
        print(f"\n✅ Teste concluído com sucesso!")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_milestone_creation()
