import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from rest_framework import serializers
from core.models import Project

# Serializer de teste só com os campos que estão faltando
class TestProjectSerializer(serializers.ModelSerializer):
    # Campos de relacionamento
    program = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    
    # Campos com display
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'status', 'status_display', 
            'priority', 'priority_display', 'program', 'category'
        ]
    
    def get_program(self, obj):
        if obj.program:
            return {
                'id': obj.program.id,
                'name': obj.program.name,
                'color': obj.program.color
            }
        return None
    
    def get_category(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'color': obj.category.color
            }
        return None

# Testar
project = Project.objects.select_related('program', 'category').get(slug='futuro-sustentavel')
test_serializer = TestProjectSerializer(project)

print("=== SERIALIZER DE TESTE ===")
print("Dados:")
for key, value in test_serializer.data.items():
    print(f"  {key}: {value}")

# Agora comparar com o serializer original
from project_tracking.serializers import ProjectTrackingDataSerializer
original_serializer = ProjectTrackingDataSerializer(project)

print("\n=== SERIALIZER ORIGINAL (SÓ OS CAMPOS DE TESTE) ===")
original_data = original_serializer.data
for field in ['status', 'status_display', 'priority', 'priority_display', 'program', 'category']:
    print(f"  {field}: {original_data.get(field, 'AUSENTE')}")

print(f"\nTamanho total do serializer original: {len(original_data)} campos")
print("Campos disponíveis:", list(original_data.keys()))
