#!/usr/bin/env python
# test_programs_api.py - Testar os endpoints de programas

import os
import sys
import django
import requests
import json

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Program, ProjectCategory
from django.contrib.auth import get_user_model

def test_program_api():
    """Testar API de programas"""
    
    print("🚀 Testando API de Programas...")
    
    # Testar dados locais primeiro
    programs = Program.objects.all()
    categories = ProjectCategory.objects.all()
    
    print(f"📊 Programas no banco: {programs.count()}")
    for program in programs[:3]:
        print(f"   • {program.name} (ID: {program.id}, slug: {program.slug})")
    
    print(f"📊 Categorias no banco: {categories.count()}")
    for category in categories[:3]:
        print(f"   • {category.name} (ID: {category.id}, programa: {category.program.name if category.program else 'Nenhum'})")
    
    # Serializar dados para teste
    from core.serializers import ProgramSerializer, ProjectCategorySerializer
    
    program_serializer = ProgramSerializer(programs, many=True)
    category_serializer = ProjectCategorySerializer(categories, many=True)
    
    print("\n📋 Estrutura de dados dos programas:")
    print(json.dumps(program_serializer.data[:2], indent=2, ensure_ascii=False))
    
    print("\n📋 Estrutura de dados das categorias:")
    print(json.dumps(category_serializer.data[:2], indent=2, ensure_ascii=False))
    
    # Verificar ViewSets
    from core.views import ProgramViewSet, ProjectCategoryViewSet
    
    print("\n✅ ViewSets configurados:")
    print(f"   • ProgramViewSet: {ProgramViewSet}")
    print(f"   • ProjectCategoryViewSet: {ProjectCategoryViewSet}")
    
    print("\n🎯 Endpoints disponíveis:")
    print("   • GET /api/v1/core/programs/")
    print("   • GET /api/v1/core/project-categories/")
    print("   • GET /api/v1/core/project-categories/?program=<id>")

if __name__ == '__main__':
    test_program_api()
