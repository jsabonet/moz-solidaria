#!/usr/bin/env python3
"""
Teste da nova lógica de progresso melhorada
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

def test_improved_progress_logic():
    """Testar a nova lógica de progresso"""
    print("=== TESTE: LÓGICA DE PROGRESSO MELHORADA ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        metrics = project.metrics
        
        print(f"\n📊 Estado inicial:")
        print(f"   Progresso: {metrics.progress_percentage}%")
        
        # Obter usuário
        author, _ = User.objects.get_or_create(
            username='test_user',
            defaults={'email': 'test@example.com'}
        )
        
        # Teste 1: Valor normal (85%)
        print(f"\n🧪 TESTE 1: Progresso normal (85%)")
        update1 = ProjectUpdate.objects.create(
            project=project,
            title=f"Teste Progresso Normal {datetime.now().strftime('%H:%M:%S')}",
            description="Teste com progresso normal",
            type='progress',
            status='published',
            progress_percentage=85,
            author=author
        )
        
        metrics.refresh_from_db()
        print(f"   Resultado: {metrics.progress_percentage}%")
        
        # Teste 2: Valor inválido (150%)
        print(f"\n🧪 TESTE 2: Progresso inválido (150% - deve ser limitado a 100%)")
        update2 = ProjectUpdate.objects.create(
            project=project,
            title=f"Teste Progresso Inválido {datetime.now().strftime('%H:%M:%S')}",
            description="Teste com progresso > 100%",
            type='progress',
            status='published',
            progress_percentage=150,
            author=author
        )
        
        metrics.refresh_from_db()
        print(f"   Resultado: {metrics.progress_percentage}%")
        
        # Teste 3: Regressão justificada (90% -> 70%)
        print(f"\n🧪 TESTE 3: Regressão significativa (70% - mudança > 5%)")
        update3 = ProjectUpdate.objects.create(
            project=project,
            title=f"Teste Regressão {datetime.now().strftime('%H:%M:%S')}",
            description="Teste de regressão de progresso",
            type='issue',
            status='published',
            progress_percentage=70,
            author=author
        )
        
        metrics.refresh_from_db()
        print(f"   Resultado: {metrics.progress_percentage}%")
        
        # Teste 4: Progresso pequeno (72% - mudança < 5%)
        print(f"\n🧪 TESTE 4: Mudança pequena (72% - mudança < 5%)")
        update4 = ProjectUpdate.objects.create(
            project=project,
            title=f"Teste Mudança Pequena {datetime.now().strftime('%H:%M:%S')}",
            description="Teste de mudança pequena",
            type='progress',
            status='published',
            progress_percentage=72,
            author=author
        )
        
        metrics.refresh_from_db()
        print(f"   Resultado: {metrics.progress_percentage}%")
        
        # Teste 5: Valor negativo (-10%)
        print(f"\n🧪 TESTE 5: Progresso negativo (-10% - deve ser 0%)")
        update5 = ProjectUpdate.objects.create(
            project=project,
            title=f"Teste Progresso Negativo {datetime.now().strftime('%H:%M:%S')}",
            description="Teste com progresso negativo",
            type='issue',
            status='published',
            progress_percentage=-10,
            author=author
        )
        
        metrics.refresh_from_db()
        print(f"   Resultado: {metrics.progress_percentage}%")
        
        print(f"\n✅ Testes concluídos!")
        print(f"📊 Progresso final: {metrics.progress_percentage}%")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_improved_progress_logic()
