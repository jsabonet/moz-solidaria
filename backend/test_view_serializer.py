import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.views import ProjectTrackingViewSet
from django.test import RequestFactory
from core.models import Project

# Criar uma requisição fake
factory = RequestFactory()
request = factory.get('/api/v1/tracking/project-tracking/futuro-sustentavel/')

# Instanciar a view
view = ProjectTrackingViewSet()
view.request = request
view.kwargs = {'slug': 'futuro-sustentavel'}

# Obter o objeto
project = view.get_object()
print("Projeto obtido:", project.name)

# Obter o serializer
serializer = view.get_serializer(project)
print("Serializer utilizado:", type(serializer).__name__)

# Obter os dados
data = serializer.data
print("\n--- Dados do serializer da view ---")
print("Status:", data.get('status'))
print("Priority:", data.get('priority'))
print("Program:", data.get('program'))
print("Category:", data.get('category'))

print("\n--- Campos disponíveis ---")
print("Campos:", list(data.keys()))
