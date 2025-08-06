#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project

def fix_project_slug():
    print("=== Ajustar slug do projeto ===\n")
    
    try:
        # Buscar projeto com slug 'joel'
        project = Project.objects.get(slug='joel')
        print(f"Projeto encontrado: {project.name} (slug: {project.slug})")
        
        # Atualizar para 'Joel' em maiúsculo se necessário
        choice = input("Atualizar slug para 'Joel' (maiúsculo)? (s/N): ").lower()
        if choice == 's':
            project.slug = 'Joel'
            project.save()
            print(f"Slug atualizado para: {project.slug}")
        else:
            print("Slug mantido como: joel")
            
        print("\n=== URLs disponíveis ===")
        print(f"GET /api/v1/tracking/project-tracking/{project.slug}/")
        print(f"GET /api/v1/tracking/projects/{project.slug}/updates/")
        print(f"POST /api/v1/tracking/projects/{project.slug}/updates/")
        
    except Project.DoesNotExist:
        print("Projeto com slug 'joel' não encontrado!")

if __name__ == "__main__":
    fix_project_slug()
