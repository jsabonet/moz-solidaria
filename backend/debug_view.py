import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.views import ProjectTrackingViewSet
from rest_framework.test import APIRequestFactory
from core.models import Project

# Criar uma requisição
factory = APIRequestFactory()
request = factory.get('/api/v1/tracking/project-tracking/futuro-sustentavel/')

# Criar a view
view = ProjectTrackingViewSet()
view.action = 'retrieve'
view.request = request
view.format_kwarg = None

# Obter o projeto
project = Project.objects.select_related('program', 'category').get(slug='futuro-sustentavel')

# Obter o serializer da view
serializer = view.get_serializer(project)

print("=== DEBUG DA VIEW ===")
print(f"View class: {view.__class__.__name__}")
print(f"Serializer class: {serializer.__class__.__name__}")
print(f"Serializer data tem {len(serializer.data)} campos")

print("\n=== CAMPOS DO SERIALIZER DA VIEW ===")
for key in sorted(serializer.data.keys()):
    print(f"  - {key}")

print(f"\n=== CAMPOS CRÍTICOS ===")
print(f"Status: {serializer.data.get('status', 'AUSENTE')}")
print(f"Priority: {serializer.data.get('priority', 'AUSENTE')}")
print(f"Program: {serializer.data.get('program', 'AUSENTE')}")
print(f"Category: {serializer.data.get('category', 'AUSENTE')}")

# Verificar se a view tem algum método de filtragem
print(f"\n=== MÉTODOS DA VIEW ===")
methods = [method for method in dir(view) if not method.startswith('_')]
filtering_methods = [method for method in methods if 'filter' in method.lower() or 'serializer' in method.lower()]
print("Métodos relacionados a filtering/serializer:", filtering_methods)
