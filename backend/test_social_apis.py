#!/usr/bin/env python3
"""
Script para testar as APIs de interações sociais (likes, shares, comments)
"""

import os
import django
import requests
import json
from datetime import datetime

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from blog.models import BlogPost, Like, Share, Comment

def test_social_apis():
    """Testa as APIs de interações sociais"""
    
    print("🧪 Testando APIs de Interações Sociais")
    print("=" * 50)
    
    # URLs base
    BASE_URL = "http://localhost:8000/api/v1/blog/posts"
    
    # Obter primeiro post
    try:
        posts = BlogPost.objects.filter(status='published')[:1]
        if not posts:
            print("❌ Nenhum post publicado encontrado")
            return
        
        post = posts[0]
        print(f"📝 Testando com post: {post.title}")
        print(f"   Slug: {post.slug}")
        print()
        
        # Teste 1: Obter detalhes do post (sem autenticação)
        print("🔍 Teste 1: Obter detalhes do post")
        response = requests.get(f"{BASE_URL}/{post.slug}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Post obtido com sucesso")
            print(f"   Likes: {data.get('likes_count', 0)}")
            print(f"   Shares: {data.get('shares_count', 0)}")
            print(f"   Comments: {data.get('comments_count', 0)}")
            print(f"   Is liked: {data.get('is_liked_by_user', False)}")
        else:
            print(f"❌ Erro ao obter post: {response.status_code}")
        print()
        
        # Teste 2: Compartilhar post (sem autenticação)
        print("📤 Teste 2: Compartilhar post (anônimo)")
        share_data = {"share_type": "other"}
        response = requests.post(f"{BASE_URL}/{post.slug}/share/", json=share_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Compartilhamento registrado")
            print(f"   Message: {data.get('message')}")
            print(f"   Total shares: {data.get('shares_count')}")
        else:
            print(f"❌ Erro ao compartilhar: {response.status_code}")
            print(f"   Response: {response.text}")
        print()
        
        # Teste 3: Obter estatísticas de shares
        print("📊 Teste 3: Estatísticas de compartilhamentos")
        response = requests.get(f"{BASE_URL}/{post.slug}/shares/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Estatísticas obtidas")
            print(f"   Total shares: {data.get('total_shares')}")
            print(f"   Por tipo: {data.get('stats_by_type')}")
        else:
            print(f"❌ Erro ao obter estatísticas: {response.status_code}")
        print()
        
        # Teste 4: Tentar curtir sem autenticação (deve falhar)
        print("❤️ Teste 4: Tentar curtir sem autenticação")
        response = requests.post(f"{BASE_URL}/{post.slug}/like/")
        if response.status_code == 401:
            print("✅ Erro de autenticação correto (401)")
        else:
            print(f"❌ Resposta inesperada: {response.status_code}")
        print()
        
        # Teste 5: Comentar sem autenticação
        print("💬 Teste 5: Comentar sem autenticação")
        comment_data = {
            "content": "Este é um comentário de teste!",
            "author_name": "Teste User",
            "author_email": "teste@example.com"
        }
        response = requests.post(f"{BASE_URL}/{post.slug}/comments/", json=comment_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Comentário criado")
            print(f"   Message: {data.get('message')}")
        else:
            print(f"❌ Erro ao comentar: {response.status_code}")
            print(f"   Response: {response.text}")
        print()
        
        # Teste 6: Obter comentários
        print("📝 Teste 6: Obter comentários")
        response = requests.get(f"{BASE_URL}/{post.slug}/comments/")
        if response.status_code == 200:
            data = response.json()
            comments = data if isinstance(data, list) else data.get('results', [])
            print(f"✅ Comentários obtidos: {len(comments)}")
            for comment in comments:
                print(f"   - {comment.get('author_name')}: {comment.get('content')[:50]}...")
        else:
            print(f"❌ Erro ao obter comentários: {response.status_code}")
        print()
        
        # Teste com usuário autenticado
        print("🔐 Testes com autenticação")
        print("-" * 30)
        
        # Obter token JWT
        login_data = {
            "username": "admin",  # Assumindo que existe um admin
            "password": "admin123"  # Senha padrão
        }
        
        auth_response = requests.post("http://localhost:8000/api/v1/auth/token/", json=login_data)
        if auth_response.status_code == 200:
            auth_data = auth_response.json()
            token = auth_data.get('access')
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Autenticado com sucesso")
            
            # Teste 7: Curtir post autenticado
            print("❤️ Teste 7: Curtir post (autenticado)")
            response = requests.post(f"{BASE_URL}/{post.slug}/like/", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Like processado")
                print(f"   Is liked: {data.get('is_liked')}")
                print(f"   Total likes: {data.get('likes_count')}")
                print(f"   Message: {data.get('message')}")
            else:
                print(f"❌ Erro ao curtir: {response.status_code}")
                print(f"   Response: {response.text}")
            print()
            
            # Teste 8: Curtir novamente (toggle)
            print("🔄 Teste 8: Toggle like")
            response = requests.post(f"{BASE_URL}/{post.slug}/like/", headers=headers)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Toggle like processado")
                print(f"   Is liked: {data.get('is_liked')}")
                print(f"   Total likes: {data.get('likes_count')}")
                print(f"   Message: {data.get('message')}")
            else:
                print(f"❌ Erro no toggle: {response.status_code}")
            print()
            
            # Teste 9: Obter lista de likes
            print("👥 Teste 9: Lista de usuários que curtiram")
            response = requests.get(f"{BASE_URL}/{post.slug}/likes/", headers=headers)
            if response.status_code == 200:
                data = response.json()
                likes = data if isinstance(data, list) else data.get('results', [])
                print(f"✅ Likes obtidos: {len(likes)}")
                for like in likes:
                    user = like.get('user', {})
                    print(f"   - {user.get('username', 'Anônimo')} em {like.get('created_at')}")
            else:
                print(f"❌ Erro ao obter likes: {response.status_code}")
            print()
            
        else:
            print(f"❌ Erro de autenticação: {auth_response.status_code}")
            print("   Pulando testes autenticados...")
        
        print("🎉 Testes concluídos!")
        
    except Exception as e:
        print(f"❌ Erro durante os testes: {e}")
        import traceback
        traceback.print_exc()

def show_database_stats():
    """Mostra estatísticas do banco de dados"""
    print("\n📊 Estatísticas do Banco de Dados")
    print("=" * 40)
    
    print(f"📝 Posts: {BlogPost.objects.count()}")
    print(f"   Publicados: {BlogPost.objects.filter(status='published').count()}")
    print(f"❤️ Likes: {Like.objects.count()}")
    print(f"📤 Shares: {Share.objects.count()}")
    print(f"💬 Comments: {Comment.objects.count()}")
    print(f"   Aprovados: {Comment.objects.filter(is_approved=True).count()}")
    print(f"👥 Users: {User.objects.count()}")

if __name__ == "__main__":
    show_database_stats()
    test_social_apis()
