#!/usr/bin/env python3
"""
Teste para verificar se o novo signal está funcionando
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
from django.contrib.auth.models import User
from datetime import datetime

def test_automatic_metrics_update():
    """Testar se as métricas são atualizadas automaticamente"""
    print("=== TESTE: SIGNAL DE ATUALIZAÇÃO AUTOMÁTICA ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        metrics = project.metrics
        
        print(f"\n📊 Estado atual das métricas:")
        print(f"   Pessoas impactadas: {metrics.people_impacted}")
        print(f"   Orçamento usado: {metrics.budget_used}")
        print(f"   Progresso: {metrics.progress_percentage}%")
        
        # Obter ou criar usuário para o autor
        author, created = User.objects.get_or_create(
            username='test_user',
            defaults={'email': 'test@example.com'}
        )
        
        # Criar nova atualização
        print(f"\n📝 Criando nova atualização...")
        new_update = ProjectUpdate.objects.create(
            project=project,
            title=f"Teste Signal {datetime.now().strftime('%H:%M:%S')}",
            description="Teste para verificar se o signal atualiza as métricas automaticamente",
            type='progress',
            status='published',
            people_impacted=200,
            budget_spent='15000.00',
            progress_percentage=98,
            author=author
        )
        
        print(f"✅ Atualização criada: {new_update.title}")
        print(f"   ID: {new_update.id}")
        print(f"   Pessoas impactadas: {new_update.people_impacted}")
        print(f"   Orçamento gasto: {new_update.budget_spent}")
        print(f"   Progresso: {new_update.progress_percentage}%")
        
        # Recarregar métricas do banco de dados
        metrics.refresh_from_db()
        
        print(f"\n📊 Estado das métricas após criar atualização:")
        print(f"   Pessoas impactadas: {metrics.people_impacted}")
        print(f"   Orçamento usado: {metrics.budget_used}")
        print(f"   Progresso: {metrics.progress_percentage}%")
        print(f"   Última atualização: {metrics.last_updated}")
        
        # Verificar se há atualizações
        total_updates = project.tracking_updates.filter(status='published').count()
        print(f"\n📈 Total de updates publicados: {total_updates}")
        
        print(f"\n✅ Teste concluído!")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_automatic_metrics_update()
