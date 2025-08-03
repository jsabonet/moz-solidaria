#!/usr/bin/env python
import os
import sys
import django

# Adicionar o diretório backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from blog.models import BlogPost

def update_post_seo():
    """Atualizar o primeiro post com dados SEO para teste"""
    try:
        # Pegar o primeiro post
        post = BlogPost.objects.first()
        if not post:
            print("❌ Nenhum post encontrado")
            return
            
        # Atualizar campos SEO
        post.meta_keywords = "educação cabo delgado, desenvolvimento comunitário moçambique, transformação social, programas educacionais, apoio humanitário"
        post.focus_keyword = "educação cabo delgado"
        post.meta_title = f"{post.title} | Moçambique Solidária"
        post.meta_description = post.excerpt if post.excerpt else f"Descubra como {post.title.lower()} está transformando vidas em Cabo Delgado através de nossos programas."
        
        # Campos Open Graph
        post.og_title = post.title
        post.og_description = post.meta_description
        
        # Campos Twitter
        post.twitter_title = post.title
        post.twitter_description = post.meta_description[:200]
        
        post.save()
        
        print(f"✅ Post '{post.title}' atualizado com sucesso!")
        print(f"📍 Meta Keywords: {post.meta_keywords}")
        print(f"📍 Focus Keyword: {post.focus_keyword}")
        print(f"📍 Slug: {post.slug}")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar post: {e}")

if __name__ == '__main__':
    update_post_seo()
