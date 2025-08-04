#!/usr/bin/env python3
"""
Script para testar a API pública de comentários
"""

import os
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from blog.models import Comment, BlogPost

def test_public_comments_api():
    """Testa a API pública de comentários"""
    
    print("🔍 Testando API Pública de Comentários")
    print("=" * 40)
    
    # Verificar posts disponíveis
    posts = BlogPost.objects.filter(status='published')[:3]
    
    if not posts:
        print("❌ Nenhum post publicado encontrado")
        return
    
    for post in posts:
        print(f"\n📝 Testando post: {post.title}")
        print(f"   Slug: {post.slug}")
        
        # Verificar comentários no banco
        comments_in_db = Comment.objects.filter(post=post)
        approved_comments = comments_in_db.filter(is_approved=True)
        
        print(f"   📊 Comentários no banco: {comments_in_db.count()}")
        print(f"   ✅ Comentários aprovados: {approved_comments.count()}")
        
        # Testar API pública
        try:
            response = requests.get(f"http://localhost:8000/api/v1/blog/posts/{post.slug}/comments/")
            
            if response.status_code == 200:
                data = response.json()
                api_comments = data if isinstance(data, list) else data.get('results', [])
                
                print(f"   🌐 Comentários via API: {len(api_comments)}")
                
                # Verificar se todos são aprovados
                all_approved = all(comment.get('is_approved', False) for comment in api_comments)
                print(f"   🔒 Todos aprovados: {'Sim' if all_approved else 'Não'}")
                
                # Mostrar alguns comentários
                if api_comments:
                    print(f"   📋 Primeiros comentários:")
                    for comment in api_comments[:2]:
                        status = "✅" if comment.get('is_approved') else "❌"
                        print(f"      {status} {comment.get('author_name')}: {comment.get('content', '')[:50]}...")
                else:
                    print(f"   📭 Nenhum comentário retornado pela API")
                    
            else:
                print(f"   ❌ Erro na API: {response.status_code}")
                
        except Exception as e:
            print(f"   💥 Erro na requisição: {e}")
    
    print(f"\n✅ Teste concluído!")

if __name__ == "__main__":
    test_public_comments_api()
