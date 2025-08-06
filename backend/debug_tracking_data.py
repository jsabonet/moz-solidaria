#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project
from project_tracking.models import ProjectUpdate
from project_tracking.serializers import ProjectTrackingDataSerializer

def debug_tracking_data():
    print("=== Debug Tracking Data ===\n")
    
    try:
        # Buscar projeto
        project = Project.objects.get(slug='Joel')
        print(f"Projeto: {project.name}")
        
        # Verificar updates diretamente
        updates = project.tracking_updates.all()
        print(f"Updates via relationship: {updates.count()}")
        for update in updates:
            print(f"  - {update.title} (status: {update.status})")
        
        # Verificar updates publicados
        published_updates = project.tracking_updates.filter(status='published')
        print(f"Updates publicados: {published_updates.count()}")
        for update in published_updates:
            print(f"  - {update.title}")
        
        # Verificar via serializer
        print("\n=== Testando Serializer ===")
        serializer = ProjectTrackingDataSerializer(project)
        data = serializer.data
        
        print(f"Total updates (serializer): {data.get('total_updates', 0)}")
        print(f"Updates no data: {len(data.get('tracking_updates', []))}")
        print(f"Recent updates: {len(data.get('recent_updates', []))}")
        
        if data.get('tracking_updates'):
            print("Updates encontrados:")
            for update in data['tracking_updates']:
                print(f"  - {update['title']} (status: {update['status']})")
        
    except Project.DoesNotExist:
        print("Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    debug_tracking_data()
