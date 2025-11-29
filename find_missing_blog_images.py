#!/usr/bin/env python3
"""
Script para encontrar imagens de blog faltantes e mapear para arquivos existentes
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, '/home/ubuntu/moz-solidaria/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from blog.models import BlogPost
import glob

def find_missing_images():
    """Encontra todas as imagens faltantes nos posts do blog"""
    
    media_root = '/home/ubuntu/moz-solidaria/backend/media'
    missing_images = []
    found_images = []
    
    # Get all posts with featured images
    posts = BlogPost.objects.filter(featured_image__isnull=False).exclude(featured_image='')
    
    print(f"📊 Total de posts com imagens: {posts.count()}")
    print("=" * 80)
    
    for post in posts:
        image_path = os.path.join(media_root, str(post.featured_image))
        image_name = os.path.basename(str(post.featured_image))
        
        if os.path.exists(image_path):
            found_images.append({
                'post_id': post.id,
                'post_title': post.title,
                'image_path': str(post.featured_image),
                'status': '✅ OK'
            })
            print(f"✅ {post.title[:50]}")
            print(f"   Imagem: {image_name}")
        else:
            # Try to find similar files
            search_patterns = [
                f"{media_root}/**/{image_name}",
                f"{media_root}/**/download*.jp*",
                f"{media_root}/**/10002*.jpg",
            ]
            
            similar_files = []
            for pattern in search_patterns:
                similar_files.extend(glob.glob(pattern, recursive=True))
            
            missing_images.append({
                'post_id': post.id,
                'post_title': post.title,
                'image_path': str(post.featured_image),
                'image_name': image_name,
                'similar_files': similar_files,
                'status': '❌ FALTANDO'
            })
            print(f"❌ {post.title[:50]}")
            print(f"   Esperado: {image_name}")
            if similar_files:
                print(f"   Similares encontrados: {len(similar_files)}")
                for sf in similar_files[:3]:
                    print(f"      - {os.path.basename(sf)}")
    
    print("\n" + "=" * 80)
    print(f"📈 RESUMO:")
    print(f"   ✅ Imagens encontradas: {len(found_images)}")
    print(f"   ❌ Imagens faltando: {len(missing_images)}")
    
    if missing_images:
        print("\n" + "=" * 80)
        print("🔍 IMAGENS FALTANDO:")
        for img in missing_images:
            print(f"\nPost ID {img['post_id']}: {img['post_title'][:60]}")
            print(f"   Procurando: {img['image_name']}")
            
    # Check for all files in blog_images that are not referenced
    print("\n" + "=" * 80)
    print("📁 Arquivos em blog_images não referenciados no banco:")
    all_files = set(os.listdir(f"{media_root}/blog_images"))
    referenced_files = set([os.path.basename(str(p.featured_image)) for p in posts if p.featured_image])
    
    unreferenced = all_files - referenced_files
    print(f"   Total: {len(unreferenced)} arquivos")
    for uf in sorted(list(unreferenced))[:20]:
        print(f"   - {uf}")

if __name__ == '__main__':
    find_missing_images()
