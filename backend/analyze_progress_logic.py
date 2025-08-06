#!/usr/bin/env python3
"""
Análise da lógica de cálculo de progresso atual e propostas de melhoria
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.models import ProjectMetrics, ProjectUpdate, ProjectMilestone
from core.models import Project
from datetime import datetime, date

def analyze_progress_calculation():
    """Analisar como o progresso é calculado atualmente"""
    print("=== ANÁLISE: LÓGICA DE CÁLCULO DE PROGRESSO ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        metrics = project.metrics
        
        print(f"\n🎯 PROJETO: {project.name}")
        print(f"📊 Progresso atual: {metrics.progress_percentage}%")
        print(f"📅 Data início: {metrics.start_date}")
        print(f"📅 Data fim prevista: {metrics.end_date}")
        
        # Analisar atualizações de progresso
        updates_with_progress = project.tracking_updates.filter(
            status='published',
            progress_percentage__isnull=False
        ).order_by('created_at')
        
        print(f"\n📈 HISTÓRICO DE PROGRESSO (de {updates_with_progress.count()} atualizações):")
        for i, update in enumerate(updates_with_progress[:10], 1):
            print(f"   {i}. {update.created_at.strftime('%d/%m/%Y %H:%M')} - {update.progress_percentage}% - {update.title}")
        
        if updates_with_progress.count() > 10:
            print(f"   ... e mais {updates_with_progress.count() - 10} atualizações")
        
        # Analisar milestones
        milestones = project.tracking_milestones.all()
        completed_milestones = milestones.filter(status='completed')
        
        print(f"\n🎯 MARCOS DO PROJETO:")
        print(f"   Total de marcos: {milestones.count()}")
        print(f"   Marcos concluídos: {completed_milestones.count()}")
        if milestones.count() > 0:
            milestone_progress = (completed_milestones.count() / milestones.count()) * 100
            print(f"   Progresso por marcos: {milestone_progress:.1f}%")
        
        # Mostrar diferentes métodos de cálculo
        print(f"\n🧮 DIFERENTES MÉTODOS DE CÁLCULO:")
        
        # Método 1: Valor mais alto registrado (atual)
        if updates_with_progress.exists():
            max_progress = max(update.progress_percentage for update in updates_with_progress)
            print(f"   1. Maior valor registrado: {max_progress}%")
        
        # Método 2: Último valor registrado
        if updates_with_progress.exists():
            last_progress = updates_with_progress.last().progress_percentage
            print(f"   2. Último valor registrado: {last_progress}%")
        
        # Método 3: Baseado em marcos concluídos
        if milestones.count() > 0:
            milestone_based = (completed_milestones.count() / milestones.count()) * 100
            print(f"   3. Baseado em marcos: {milestone_based:.1f}%")
        
        # Método 4: Baseado em cronograma
        if metrics.start_date and metrics.end_date:
            total_days = (metrics.end_date - metrics.start_date).days
            elapsed_days = (date.today() - metrics.start_date).days
            if total_days > 0:
                time_based = min(100, (elapsed_days / total_days) * 100)
                print(f"   4. Baseado em tempo: {time_based:.1f}%")
        
        # Método 5: Baseado em orçamento
        if float(metrics.budget_total) > 0:
            budget_based = min(100, (float(metrics.budget_used) / float(metrics.budget_total)) * 100)
            print(f"   5. Baseado em orçamento: {budget_based:.1f}%")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

def propose_improved_logic():
    """Propor uma lógica melhorada de cálculo de progresso"""
    print(f"\n\n💡 PROPOSTA DE LÓGICA MELHORADA:")
    
    print(f"""
    📋 ESTRATÉGIAS POSSÍVEIS:
    
    1. 🎯 HÍBRIDA (Recomendada):
       - 40% baseado em marcos concluídos
       - 30% baseado no último progresso reportado
       - 20% baseado em orçamento utilizado
       - 10% baseado em cronograma
    
    2. 📈 PROGRESSIVA:
       - Usar sempre o último valor reportado
       - Validar que não há regressão sem justificativa
       
    3. 🎯 MARCOS-FOCADA:
       - Progresso = (marcos concluídos / total marcos) * 100
       - Ajustes manuais permitidos via atualizações
    
    4. ⏰ CRONOGRAMA-FOCADA:
       - Progresso baseado no tempo decorrido
       - Ajustado por marcos e orçamento
    
    5. 🎭 CONFIGURÁVEL:
       - Administrador define os pesos para cada fator
       - Diferentes projetos podem usar diferentes lógicas
    """)

if __name__ == "__main__":
    analyze_progress_calculation()
    propose_improved_logic()
