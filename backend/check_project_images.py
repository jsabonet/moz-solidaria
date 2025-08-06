#!/usr/bin/env python3
"""
Script para verificar imagens dos projetos
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project

def check_project_images():
    """Verificar imagens dos projetos"""
    print("=== VERIFICANDO IMAGENS DOS PROJETOS ===")
    
    try:
        projects = Project.objects.all()
        print(f"📊 Total de projetos: {projects.count()}")
        
        for project in projects:
            print(f"\n🔍 Projeto: {project.name}")
            print(f"   Slug: {project.slug}")
            print(f"   Campo featured_image: {project.featured_image}")
            if project.featured_image:
                print(f"   URL da imagem: {project.featured_image.url}")
                print(f"   Arquivo existe: {os.path.exists(project.featured_image.path) if hasattr(project.featured_image, 'path') else 'N/A'}")
            else:
                print("   ❌ Nenhuma imagem principal associada")
                
            # Verificar se tem galeria de imagens
            gallery_count = project.gallery_images.count() if hasattr(project, 'gallery_images') else 0
            print(f"   Imagens na galeria: {gallery_count}")
    
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_project_images()
