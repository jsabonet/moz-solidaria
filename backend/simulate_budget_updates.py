#!/usr/bin/env python
"""
Script para simular atualizações de orçamento em tempo real
Demonstra como o campo "Orçamento Utilizado" responde a mudanças nos dados
"""

import os
import django
import sys
from decimal import Decimal
import time
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project
from project_tracking.models import ProjectMetrics, ProjectUpdate

def simulate_budget_updates():
    """
    Simula atualizações de orçamento para demonstrar funcionalidade em tempo real
    """
    try:
        project = Project.objects.get(slug='educacao-para-todos')
        metrics = ProjectMetrics.objects.get(project=project)
        
        # Cenários de atualização simulados
        scenarios = [
            {
                "budget_used": Decimal('28500.00'),  # 57% utilizado
                "people_impacted": 165,
                "progress": 57,
                "description": "Compra de material escolar e contratação de 2 professores"
            },
            {
                "budget_used": Decimal('35200.00'),  # 70.4% utilizado
                "people_impacted": 210,
                "progress": 70,
                "description": "Implementação de oficinas de tecnologia e artes"
            },
            {
                "budget_used": Decimal('42800.00'),  # 85.6% utilizado
                "people_impacted": 260,
                "progress": 85,
                "description": "Expansão para 3 escolas adicionais"
            }
        ]
        
        print(f"🚀 SIMULAÇÃO DE ORÇAMENTO EM TEMPO REAL - {project.name}")
        print("=" * 60)
        
        for i, scenario in enumerate(scenarios, 1):
            # Atualizar métricas
            metrics.budget_used = scenario["budget_used"]
            metrics.people_impacted = scenario["people_impacted"] 
            metrics.progress_percentage = scenario["progress"]
            metrics.save()
            
            # Atualizar beneficiários no projeto base
            project.current_beneficiaries = scenario["people_impacted"]
            project.save()
            
            # Criar update de progresso
            ProjectUpdate.objects.create(
                project=project,
                author_id=2,  # Assumindo que existe um usuário com ID 2
                type='progress',
                status='published',
                title=f"Atualização {i}: {scenario['progress']}% concluído",
                description=scenario["description"],
                people_impacted=scenario["people_impacted"],
                budget_spent=str(scenario["budget_used"]),
                progress_percentage=scenario["progress"]
            )
            
            budget_percentage = (scenario["budget_used"] / metrics.budget_total) * 100
            
            print(f"""
📊 ATUALIZAÇÃO {i}/3:
🔹 Orçamento Utilizado: {scenario['budget_used']:,.2f} MZN ({budget_percentage:.1f}%)
🔹 Pessoas Impactadas: {scenario['people_impacted']} de {project.target_beneficiaries}
🔹 Progresso Geral: {scenario['progress']}%
🔹 Ação: {scenario['description']}
⏰ Timestamp: {datetime.now().strftime('%H:%M:%S')}
            """)
            
            if i < len(scenarios):
                print("⏳ Aguardando próxima atualização...")
                time.sleep(3)  # Aguarda 3 segundos entre atualizações
        
        print(f"""
✅ SIMULAÇÃO CONCLUÍDA!

📈 RESUMO FINAL:
🔹 Orçamento Total: {metrics.budget_total:,.2f} MZN
🔹 Orçamento Utilizado: {metrics.budget_used:,.2f} MZN
🔹 Percentual Gasto: {(metrics.budget_used/metrics.budget_total)*100:.1f}%
🔹 Pessoas Impactadas: {metrics.people_impacted}
🔹 Progresso: {metrics.progress_percentage}%

🌐 Acesse http://localhost:8081/projects/educacao-para-todos
   para ver as atualizações em tempo real na aba "Impacto"!
        """)
        
    except Exception as e:
        print(f"❌ Erro na simulação: {e}")

if __name__ == '__main__':
    simulate_budget_updates()
