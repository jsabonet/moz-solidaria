#!/usr/bin/env python3
"""
Script para atualizar posts do blog com imagens genéricas quando a imagem original não existe
"""
import os
import sys
import django
import random

# Setup Django
sys.path.insert(0, '/home/ubuntu/moz-solidaria/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from blog.models import BlogPost

def fix_missing_images():
    """Atualiza posts com imagens faltantes para usar uma das imagens disponíveis"""
    
    media_root = '/home/ubuntu/moz-solidaria/backend/media'
    
    # Lista de imagens disponíveis que podem ser usadas como fallback
    available_images = [
        'blog_images/elise-gaumier-52Ac_F5xHa0-unsplash_Fuw2Iyz.jpg',
        'blog_images/downloaded_01029d9f-1158-4f7a-93be-b7ddc6921651.jpg',
        'blog_images/downloaded_154b6c57-09f5-43c9-b994-8949f909516d.jpg',
        'blog_images/downloaded_1cd75ef1-ae72-482c-9523-74954d167a7f.jpg',
        'blog_images/downloaded_22278895-54f4-4db3-adc0-46d30087486c.jpg',
        'blog_images/downloaded_4020d137-c0fc-4b2c-b345-753e4a723915.jpg',
    ]
    
    # Get all posts with featured images
    posts = BlogPost.objects.filter(featured_image__isnull=False).exclude(featured_image='')
    
    fixed_count = 0
    already_ok = 0
    
    print("🔧 CORRIGINDO IMAGENS FALTANTES...")
    print("=" * 80)
    
    for post in posts:
        image_path = os.path.join(media_root, str(post.featured_image))
        
        if not os.path.exists(image_path):
            # Escolher uma imagem aleatória disponível
            new_image = random.choice(available_images)
            old_image = str(post.featured_image)
            
            post.featured_image = new_image
            post.save(update_fields=['featured_image'])
            
            fixed_count += 1
            print(f"✅ Post ID {post.id}: {post.title[:60]}")
            print(f"   Antiga: {old_image}")
            print(f"   Nova: {new_image}")
            print()
        else:
            already_ok += 1
    
    print("=" * 80)
    print(f"📊 RESUMO:")
    print(f"   ✅ Posts corrigidos: {fixed_count}")
    print(f"   ✓ Posts já OK: {already_ok}")
    print(f"   📝 Total processado: {posts.count()}")
    print()
    print("🎉 Correção concluída! Agora todas as imagens devem carregar.")

if __name__ == '__main__':
    print("\n⚠️  ATENÇÃO: Este script irá atualizar o banco de dados!")
    print("   Ele substituirá imagens faltantes por imagens genéricas disponíveis.")
    print()
    response = input("Deseja continuar? (sim/não): ").strip().lower()
    
    if response in ['sim', 's', 'yes', 'y']:
        fix_missing_images()
    else:
        print("❌ Operação cancelada.")
