import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.models import Project
from project_tracking.serializers import ProjectTrackingDataSerializer

# Testar o serializer
project = Project.objects.get(slug='futuro-sustentavel')
serializer = ProjectTrackingDataSerializer(project)
data = serializer.data

print(f"Status: {data.get('status')}")
print(f"Status Display: {data.get('status_display')}")
print(f"Priority: {data.get('priority')}")
print(f"Priority Display: {data.get('priority_display')}")
print(f"Program: {data.get('program')}")
print(f"Category: {data.get('category')}")

print("\n--- Estrutura completa dos dados ---")
for key, value in data.items():
    if key in ['status', 'status_display', 'priority', 'priority_display', 'program', 'category']:
        print(f"{key}: {value}")
