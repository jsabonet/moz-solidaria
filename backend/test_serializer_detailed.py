import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project
from project_tracking.serializers import ProjectTrackingDataSerializer
import json

# Testar o serializer diretamente
project = Project.objects.get(slug='futuro-sustentavel')
print("Projeto carregado:", project.name)
print("Status do projeto:", project.status)
print("Priority do projeto:", project.priority)
print("Program do projeto:", project.program)
print("Category do projeto:", project.category)

# Testar serializer
serializer = ProjectTrackingDataSerializer(project)
data = serializer.data

print("\n--- Dados do serializer ---")
print("Status:", data.get('status'))
print("Status Display:", data.get('status_display'))
print("Priority:", data.get('priority'))
print("Priority Display:", data.get('priority_display'))
print("Program:", data.get('program'))
print("Category:", data.get('category'))

# Vamos ver quais campos o serializer realmente está incluindo
print("\n--- Campos disponíveis no serializer ---")
print("Todos os campos:", list(data.keys()))

# Verificar se os campos estão na classe Meta
from project_tracking.serializers import ProjectTrackingDataSerializer
print("\n--- Campos definidos na Meta ---")
print("Meta fields:", ProjectTrackingDataSerializer.Meta.fields)
