#!/usr/bin/env python3
"""
Script para criar marcos de exemplo no projeto
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

def create_sample_milestones():
    """Criar marcos de exemplo para o projeto"""
    print("=== CRIANDO MARCOS DE EXEMPLO ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        
        # Limpar marcos existentes (opcional)
        existing_milestones = project.tracking_milestones.all()
        print(f"📊 Marcos existentes: {existing_milestones.count()}")
        
        # Marcos de exemplo
        sample_milestones = [
            {
                'title': 'Aprovação do Projeto',
                'description': 'Obter aprovação formal do projeto pela comunidade e autoridades locais',
                'target_date': date.today() - timedelta(days=30),
                'status': 'completed',
                'progress': 100,
                'order': 1
            },
            {
                'title': 'Aquisição de Materiais',
                'description': 'Compra e transporte de todos os materiais necessários para a construção',
                'target_date': date.today() - timedelta(days=15),
                'status': 'completed',
                'progress': 100,
                'order': 2
            },
            {
                'title': 'Construção da Infraestrutura',
                'description': 'Construção do poço e instalação do sistema de bombeamento',
                'target_date': date.today() + timedelta(days=5),
                'status': 'in-progress',
                'progress': 75,
                'order': 3
            },
            {
                'title': 'Teste e Verificação',
                'description': 'Testes de qualidade da água e funcionamento do sistema',
                'target_date': date.today() + timedelta(days=15),
                'status': 'pending',
                'progress': 0,
                'order': 4
            },
            {
                'title': 'Treinamento da Comunidade',
                'description': 'Treinar membros da comunidade para manutenção básica do sistema',
                'target_date': date.today() + timedelta(days=30),
                'status': 'pending',
                'progress': 0,
                'order': 5
            }
        ]
        
        created_count = 0
        for milestone_data in sample_milestones:
            # Verificar se já existe
            if not project.tracking_milestones.filter(title=milestone_data['title']).exists():
                milestone = ProjectMilestone.objects.create(
                    project=project,
                    **milestone_data
                )
                print(f"✅ Criado: {milestone.title} ({milestone.status})")
                created_count += 1
            else:
                print(f"⚠️ Já existe: {milestone_data['title']}")
        
        print(f"\n📊 Resumo:")
        print(f"   Marcos criados: {created_count}")
        print(f"   Total de marcos: {project.tracking_milestones.count()}")
        
        # Atualizar métricas do projeto
        completed_milestones = project.tracking_milestones.filter(status='completed').count()
        total_milestones = project.tracking_milestones.count()
        
        try:
            metrics = project.metrics
            metrics.completed_milestones = completed_milestones
            metrics.total_milestones = total_milestones
            metrics.save()
            
            print(f"\n📈 Métricas atualizadas:")
            print(f"   Marcos concluídos: {completed_milestones}")
            print(f"   Total de marcos: {total_milestones}")
            print(f"   Percentual: {(completed_milestones/total_milestones)*100:.1f}%")
            
        except Exception as e:
            print(f"❌ Erro ao atualizar métricas: {e}")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_sample_milestones()
