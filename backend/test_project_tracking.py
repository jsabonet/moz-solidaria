#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project
from project_tracking.models import ProjectMetrics, ProjectUpdate

def test_project_tracking():
    print("=== Teste do Sistema de Tracking ===\n")
    
    # 1. Verificar projetos existentes
    print("1. Projetos existentes:")
    projects = Project.objects.all()
    for project in projects:
        print(f"   - ID: {project.id}, Slug: {project.slug}, Nome: {project.name}")
    
    if not projects.exists():
        print("   Nenhum projeto encontrado!")
        return
    
    print()
    
    # 2. Verificar projeto "Joel" (tentando minúsculo primeiro)
    try:
        joel_project = Project.objects.get(slug='joel')
        print(f"2. Projeto 'joel' encontrado: {joel_project.name}")
        
        # Verificar métricas
        try:
            metrics = joel_project.metrics
            print(f"   - Métricas existem: {metrics}")
        except ProjectMetrics.DoesNotExist:
            print("   - Métricas não existem. Criando...")
            from django.utils import timezone
            metrics = ProjectMetrics.objects.create(
                project=joel_project,
                people_impacted=0,
                budget_used=0,
                budget_total=1000000,
                progress_percentage=0,
                completed_milestones=0,
                total_milestones=5,
                start_date=timezone.now().date()
            )
            print(f"   - Métricas criadas: {metrics}")
        
        # Verificar updates
        updates = joel_project.tracking_updates.all()
        print(f"   - Updates existentes: {updates.count()}")
        
    except Project.DoesNotExist:
        # Tentar com maiúsculo
        try:
            joel_project = Project.objects.get(slug='Joel')
            print(f"2. Projeto 'Joel' encontrado: {joel_project.name}")
        except Project.DoesNotExist:
            print("2. Projeto 'Joel'/'joel' não encontrado!")
            print("   Usando o primeiro projeto disponível para teste...")
            
            if projects.exists():
                joel_project = projects.first()
                print(f"   Usando projeto: {joel_project.name} (slug: {joel_project.slug})")
                
                # Verificar métricas
                try:
                    metrics = joel_project.metrics
                    print(f"   - Métricas existem: {metrics}")
                except ProjectMetrics.DoesNotExist:
                    print("   - Métricas não existem. Criando...")
                    from django.utils import timezone
                    metrics = ProjectMetrics.objects.create(
                        project=joel_project,
                        people_impacted=0,
                        budget_used=50000,
                        budget_total=100000,
                        progress_percentage=50,
                        completed_milestones=2,
                        total_milestones=5,
                        start_date=timezone.now().date()
                    )
                    print(f"   - Métricas criadas: {metrics}")
            else:
                print("   Nenhum projeto disponível!")
                return
    
    print("\n=== URLs de teste ===")
    print(f"GET /api/v1/tracking/project-tracking/{joel_project.slug}/")
    print(f"GET /api/v1/tracking/projects/{joel_project.slug}/updates/")
    print(f"POST /api/v1/tracking/projects/{joel_project.slug}/updates/")

if __name__ == "__main__":
    test_project_tracking()
