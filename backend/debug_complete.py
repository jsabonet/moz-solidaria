import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project

# Carregar projeto
project = Project.objects.select_related('program', 'category').get(slug='futuro-sustentavel')

print("=== DEBUG PROJETO ===")
print(f"Nome: {project.name}")
print(f"Status: {project.status}")
print(f"Priority: {project.priority}")
print(f"Program: {project.program}")
print(f"Category: {project.category}")

print("\n=== DEBUG CAMPOS DO MODEL ===")
# Verificar todos os campos do modelo
for field in project._meta.fields:
    field_value = getattr(project, field.name, 'N/A')
    print(f"{field.name}: {field_value}")

print("\n=== DEBUG SERIALIZER SIMPLES ===")
from rest_framework import serializers

class SimpleProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'status', 'priority', 'program', 'category']

simple_serializer = SimpleProjectSerializer(project)
print("Dados do serializer simples:")
for key, value in simple_serializer.data.items():
    print(f"{key}: {value}")

print("\n=== DEBUG SERIALIZER COMPLETO ===")
from project_tracking.serializers import ProjectTrackingDataSerializer

full_serializer = ProjectTrackingDataSerializer(project)
print("Status no serializer completo:", full_serializer.data.get('status'))
print("Priority no serializer completo:", full_serializer.data.get('priority'))
print("Program no serializer completo:", full_serializer.data.get('program'))
print("Category no serializer completo:", full_serializer.data.get('category'))
