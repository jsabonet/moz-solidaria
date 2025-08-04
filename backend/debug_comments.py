#!/usr/bin/env python3
"""
Script para debugar a estrutura dos dados de comentários
"""

import os
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from blog.models import Comment

def debug_comment_data():
    """Debug da estrutura dos dados de comentários"""
    
    print("🔍 Debug da Estrutura de Comentários")
    print("=" * 40)
    
    # Verificar dados no banco
    comments = Comment.objects.all()[:3]
    
    print(f"📊 Total de comentários no banco: {Comment.objects.count()}")
    print("\n📝 Estrutura dos comentários no banco:")
    
    for comment in comments:
        print(f"\nComentário ID {comment.id}:")
        print(f"  - content: {comment.content}")
        print(f"  - author_name: {comment.author_name}")
        print(f"  - author_email: {comment.author_email}")
        print(f"  - post: {comment.post}")
        print(f"  - post.id: {comment.post.id if comment.post else 'None'}")
        print(f"  - post.title: {comment.post.title if comment.post else 'None'}")
        print(f"  - post.slug: {comment.post.slug if comment.post else 'None'}")
        print(f"  - is_approved: {comment.is_approved}")
        print(f"  - created_at: {comment.created_at}")
    
    # Testar API
    print(f"\n🌐 Testando API...")
    
    # Login
    login_data = {"username": "admin", "password": "admin123"}
    auth_response = requests.post("http://localhost:8000/api/v1/auth/token/", json=login_data)
    
    if auth_response.status_code == 200:
        token = auth_response.json().get('access')
        headers = {"Authorization": f"Bearer {token}"}
        
        # Buscar comentários via API
        response = requests.get("http://localhost:8000/api/v1/blog/admin/comments/", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Response Status: {response.status_code}")
            print(f"📦 Response Type: {type(data)}")
            
            if isinstance(data, dict):
                print(f"🔑 Response Keys: {list(data.keys())}")
                if 'results' in data:
                    comments_data = data['results']
                    print(f"📋 Comments Count from API: {len(comments_data)}")
                else:
                    comments_data = data
            else:
                comments_data = data
                print(f"📋 Comments Count from API: {len(comments_data)}")
            
            # Mostrar estrutura do primeiro comentário
            if comments_data and len(comments_data) > 0:
                first_comment = comments_data[0]
                print(f"\n📝 Estrutura do primeiro comentário da API:")
                print(json.dumps(first_comment, indent=2, ensure_ascii=False))
            else:
                print("❌ Nenhum comentário retornado pela API")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"❌ Response: {response.text}")
    else:
        print(f"❌ Login failed: {auth_response.status_code}")

if __name__ == "__main__":
    debug_comment_data()
