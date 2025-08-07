#!/usr/bin/env python
import os
import sys
import django

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_hub.settings')
django.setup()

from moz_solidaria_api.models import Project

# Atualizar localização do projeto Futuro Sustentável
try:
    project = Project.objects.get(slug='futuro-sustentavel')
    project.province = 'Cabo Delgado'
    project.district = 'Mocimboa da Praia'
    project.save()
    
    print(f"✅ Projeto atualizado: {project.name}")
    print(f"   Local: {project.location}")
    print(f"   Distrito: {project.district}")
    print(f"   Província: {project.province}")
    
except Project.DoesNotExist:
    print("❌ Projeto 'futuro-sustentavel' não encontrado")
except Exception as e:
    print(f"❌ Erro ao atualizar projeto: {e}")
