#!/usr/bin/env python3
"""
Teste do novo signal melhorado
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

def test_improved_signal():
    """Testar o signal melhorado"""
    print("=== TESTE: SIGNAL MELHORADO ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        metrics = project.metrics
        
        print(f"\n📊 Estado ANTES da nova atualização:")
        print(f"   Pessoas impactadas: {metrics.people_impacted}")
        print(f"   Orçamento usado: {metrics.budget_used}")
        print(f"   Progresso: {metrics.progress_percentage}%")
        
        # Obter ou criar usuário para o autor
        author, created = User.objects.get_or_create(
            username='test_user',
            defaults={'email': 'test@example.com'}
        )
        
        # Criar nova atualização COM VALORES PEQUENOS
        print(f"\n📝 Criando nova atualização (valores pequenos)...")
        new_update = ProjectUpdate.objects.create(
            project=project,
            title=f"Teste Signal Melhorado {datetime.now().strftime('%H:%M:%S')}",
            description="Teste com valores pequenos para verificar incremento",
            type='progress',
            status='published',
            people_impacted=50,  # Apenas 50 pessoas
            budget_spent='5000.00',  # Apenas 5000 MZN
            progress_percentage=87,  # Progresso de 87% (maior que 85%)
            author=author
        )
        
        print(f"✅ Atualização criada:")
        print(f"   Pessoas impactadas: +{new_update.people_impacted}")
        print(f"   Orçamento gasto: +{new_update.budget_spent} MZN")
        print(f"   Progresso: {new_update.progress_percentage}%")
        
        # Recarregar métricas do banco de dados
        metrics.refresh_from_db()
        
        print(f"\n📊 Estado DEPOIS da nova atualização:")
        print(f"   Pessoas impactadas: {metrics.people_impacted}")
        print(f"   Orçamento usado: {metrics.budget_used}")
        print(f"   Progresso: {metrics.progress_percentage}%")
        print(f"   Última atualização: {metrics.last_updated}")
        
        # Calcular qual deveria ser o resultado esperado
        expected_people = 8215 + 50
        expected_budget = 1079176.00 + 5000.00
        expected_progress = max(85, 87)
        
        print(f"\n🎯 Resultado esperado:")
        print(f"   Pessoas impactadas: {expected_people}")
        print(f"   Orçamento usado: {expected_budget}")
        print(f"   Progresso: {expected_progress}%")
        
        # Verificar se está correto
        if (metrics.people_impacted == expected_people and 
            float(metrics.budget_used) == expected_budget and 
            metrics.progress_percentage == expected_progress):
            print(f"\n✅ SUCESSO! Signal funcionando corretamente!")
        else:
            print(f"\n❌ Algo não está correto...")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_improved_signal()
