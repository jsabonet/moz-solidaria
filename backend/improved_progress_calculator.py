#!/usr/bin/env python3
"""
Implementação de lógica melhorada para cálculo de progresso
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
from decimal import Decimal

class ProgressCalculator:
    """Calculadora inteligente de progresso"""
    
    def __init__(self, project):
        self.project = project
        self.metrics = project.metrics
    
    def calculate_smart_progress(self, method='hybrid'):
        """
        Calcula progresso usando diferentes estratégias
        
        Methods:
        - 'hybrid': Combinação inteligente de fatores
        - 'latest': Último valor reportado válido
        - 'milestones': Baseado em marcos concluídos
        - 'budget': Baseado em orçamento usado
        - 'timeline': Baseado em cronograma
        """
        
        if method == 'hybrid':
            return self._calculate_hybrid_progress()
        elif method == 'latest':
            return self._calculate_latest_progress()
        elif method == 'milestones':
            return self._calculate_milestone_progress()
        elif method == 'budget':
            return self._calculate_budget_progress()
        elif method == 'timeline':
            return self._calculate_timeline_progress()
        else:
            return self._calculate_hybrid_progress()
    
    def _calculate_hybrid_progress(self):
        """Lógica híbrida que combina múltiplos fatores"""
        factors = {}
        weights = {}
        
        # 1. Progresso baseado em marcos (peso 40%)
        milestone_progress = self._calculate_milestone_progress()
        if milestone_progress is not None:
            factors['milestones'] = milestone_progress
            weights['milestones'] = 0.4
        
        # 2. Último progresso reportado válido (peso 30%)
        latest_progress = self._calculate_latest_progress()
        if latest_progress is not None:
            factors['latest'] = latest_progress
            weights['latest'] = 0.3
        
        # 3. Progresso baseado em orçamento (peso 20%)
        budget_progress = self._calculate_budget_progress()
        if budget_progress is not None:
            factors['budget'] = min(100, budget_progress)  # Cap at 100%
            weights['budget'] = 0.2
        
        # 4. Progresso baseado em cronograma (peso 10%)
        timeline_progress = self._calculate_timeline_progress()
        if timeline_progress is not None:
            factors['timeline'] = timeline_progress
            weights['timeline'] = 0.1
        
        if not factors:
            return 0
        
        # Normalizar pesos
        total_weight = sum(weights.values())
        if total_weight > 0:
            for key in weights:
                weights[key] = weights[key] / total_weight
        
        # Calcular média ponderada
        weighted_sum = sum(factors[key] * weights[key] for key in factors)
        
        return min(100, max(0, round(weighted_sum)))
    
    def _calculate_latest_progress(self):
        """Último valor de progresso reportado (filtrado para ser válido)"""
        updates = self.project.tracking_updates.filter(
            status='published',
            progress_percentage__isnull=False,
            progress_percentage__lte=100,  # Filtrar valores absurdos
            progress_percentage__gte=0
        ).order_by('-created_at')
        
        if updates.exists():
            return updates.first().progress_percentage
        return None
    
    def _calculate_milestone_progress(self):
        """Progresso baseado em marcos concluídos"""
        milestones = self.project.tracking_milestones.all()
        if milestones.count() == 0:
            return None
        
        completed = milestones.filter(status='completed').count()
        total = milestones.count()
        
        return round((completed / total) * 100, 1)
    
    def _calculate_budget_progress(self):
        """Progresso baseado em orçamento utilizado"""
        if not self.metrics.budget_total or float(self.metrics.budget_total) <= 0:
            return None
        
        budget_used = float(self.metrics.budget_used or 0)
        budget_total = float(self.metrics.budget_total)
        
        return round((budget_used / budget_total) * 100, 1)
    
    def _calculate_timeline_progress(self):
        """Progresso baseado em cronograma"""
        if not self.metrics.start_date or not self.metrics.end_date:
            return None
        
        total_days = (self.metrics.end_date - self.metrics.start_date).days
        if total_days <= 0:
            return None
        
        elapsed_days = (date.today() - self.metrics.start_date).days
        
        return min(100, max(0, round((elapsed_days / total_days) * 100, 1)))
    
    def get_progress_breakdown(self):
        """Retorna breakdown detalhado dos fatores de progresso"""
        breakdown = {
            'milestones': self._calculate_milestone_progress(),
            'latest_reported': self._calculate_latest_progress(),
            'budget': self._calculate_budget_progress(),
            'timeline': self._calculate_timeline_progress(),
            'hybrid': self._calculate_hybrid_progress()
        }
        
        return breakdown

def test_improved_progress_calculation():
    """Testar a nova lógica de cálculo"""
    print("=== TESTE: NOVA LÓGICA DE CÁLCULO DE PROGRESSO ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        calculator = ProgressCalculator(project)
        
        print(f"\n🎯 PROJETO: {project.name}")
        print(f"📊 Progresso atual (sistema): {project.metrics.progress_percentage}%")
        
        # Testar diferentes métodos
        breakdown = calculator.get_progress_breakdown()
        
        print(f"\n📊 BREAKDOWN DE PROGRESSO:")
        for method, value in breakdown.items():
            if value is not None:
                print(f"   {method.capitalize():15}: {value}%")
            else:
                print(f"   {method.capitalize():15}: N/A")
        
        # Mostrar recomendação
        recommended = calculator.calculate_smart_progress('hybrid')
        print(f"\n💡 PROGRESSO RECOMENDADO: {recommended}%")
        
        # Comparar com valor atual
        current = project.metrics.progress_percentage or 0
        difference = recommended - current
        
        print(f"\n📈 COMPARAÇÃO:")
        print(f"   Atual: {current}%")
        print(f"   Recomendado: {recommended}%")
        print(f"   Diferença: {difference:+.0f}%")
        
        if abs(difference) > 10:
            print(f"   ⚠️  Grande diferença detectada!")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

def propose_signal_improvement():
    """Propor melhoria no signal"""
    print(f"\n\n🔧 PROPOSTA DE MELHORIA NO SIGNAL:")
    
    print(f"""
    📝 ALTERAÇÕES SUGERIDAS NO SIGNAL:
    
    1. 🚫 VALIDAÇÃO DE ENTRADA:
       - Rejeitar progress_percentage > 100%
       - Rejeitar progress_percentage < 0%
       - Log de valores anômalos
    
    2. 🧮 LÓGICA MELHORADA:
       - Usar ProgressCalculator para recalcular
       - Considerar contexto histórico
       - Evitar regressões injustificadas
    
    3. 📊 MÚLTIPLAS ESTRATÉGIAS:
       - Configuração por projeto
       - Fallback para método padrão
       - Audit trail das mudanças
    
    📋 IMPLEMENTAÇÃO:
    ```python
    # No signal update_project_metrics_on_update_save:
    
    # Validar entrada
    if instance.progress_percentage:
        if not (0 <= instance.progress_percentage <= 100):
            print(f"⚠️ Valor de progresso inválido: {instance.progress_percentage}%")
            instance.progress_percentage = None
    
    # Usar calculadora inteligente
    calculator = ProgressCalculator(instance.project)
    smart_progress = calculator.calculate_smart_progress('hybrid')
    
    # Aplicar nova lógica
    metrics.progress_percentage = smart_progress
    ```
    """)

if __name__ == "__main__":
    test_improved_progress_calculation()
    propose_signal_improvement()
