#!/usr/bin/env python3
"""
Script para testar as funcionalidades administrativas do sistema social
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

def test_admin_apis():
    """Testa as APIs administrativas"""
    
    print("🔧 Testando APIs Administrativas")
    print("=" * 50)
    
    # URLs base
    BASE_URL = "http://localhost:8000/api/v1/blog"
    
    # Autenticar como admin
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    auth_response = requests.post("http://localhost:8000/api/v1/auth/token/", json=login_data)
    if auth_response.status_code != 200:
        print("❌ Erro de autenticação admin")
        return
    
    token = auth_response.json().get('access')
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Autenticado como admin")
    print()
    
    # Teste 1: Estatísticas de comentários
    print("📊 Teste 1: Estatísticas de comentários")
    response = requests.get(f"{BASE_URL}/admin/comments/stats/", headers=headers)
    if response.status_code == 200:
        stats = response.json()
        print("✅ Estatísticas obtidas:")
        print(f"   Total: {stats.get('total_comments')}")
        print(f"   Pendentes: {stats.get('pending_comments')}")
        print(f"   Aprovados: {stats.get('approved_comments')}")
        print(f"   Recentes: {stats.get('recent_comments')}")
    else:
        print(f"❌ Erro: {response.status_code}")
    print()
    
    # Teste 2: Listar comentários pendentes
    print("⏳ Teste 2: Comentários pendentes")
    response = requests.get(f"{BASE_URL}/admin/comments/pending/", headers=headers)
    if response.status_code == 200:
        comments = response.json()
        if isinstance(comments, dict) and 'results' in comments:
            comments = comments['results']
        print(f"✅ {len(comments)} comentários pendentes")
        for comment in comments[:3]:  # Mostrar apenas os primeiros 3
            print(f"   - ID {comment['id']}: {comment['author_name']} - {comment['content'][:50]}...")
    else:
        print(f"❌ Erro: {response.status_code}")
    print()
    
    # Teste 3: Aprovar comentário via API
    if comments:
        comment_id = comments[0]['id']
        print(f"✅ Teste 3: Aprovar comentário #{comment_id}")
        response = requests.post(f"{BASE_URL}/admin/comments/{comment_id}/approve/", headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {result.get('message')}")
        else:
            print(f"❌ Erro: {response.status_code}")
        print()
    
    # Teste 4: Estatísticas sociais gerais
    print("📈 Teste 4: Estatísticas sociais")
    response = requests.get(f"{BASE_URL}/admin/social-stats/overview/", headers=headers)
    if response.status_code == 200:
        stats = response.json()
        overview = stats.get('overview', {})
        recent = stats.get('recent_activity', {})
        
        print("✅ Visão geral:")
        print(f"   Total de curtidas: {overview.get('total_likes')}")
        print(f"   Total de shares: {overview.get('total_shares')}")
        print(f"   Total de comentários: {overview.get('total_comments')}")
        print(f"   Engajamento total: {overview.get('total_engagement')}")
        
        print("📅 Atividade recente (7 dias):")
        print(f"   Curtidas: {recent.get('recent_likes')}")
        print(f"   Shares: {recent.get('recent_shares')}")
        print(f"   Comentários: {recent.get('recent_comments')}")
        
        popular_posts = stats.get('popular_posts', [])[:3]
        if popular_posts:
            print("🏆 Posts populares:")
            for i, post in enumerate(popular_posts, 1):
                print(f"   {i}. {post['title'][:40]}... (engajamento: {post['total_engagement']})")
    else:
        print(f"❌ Erro: {response.status_code}")
    print()
    
    # Teste 5: Aprovação em massa
    pending_response = requests.get(f"{BASE_URL}/admin/comments/pending/", headers=headers)
    if pending_response.status_code == 200:
        pending_comments = pending_response.json()
        if isinstance(pending_comments, dict) and 'results' in pending_comments:
            pending_comments = pending_comments['results']
        
        if pending_comments:
            print("🔄 Teste 5: Aprovação em massa")
            comment_ids = [c['id'] for c in pending_comments[:2]]  # Aprovar apenas 2
            
            bulk_data = {"comment_ids": comment_ids}
            response = requests.post(f"{BASE_URL}/admin/comments/bulk_approve/", 
                                   json=bulk_data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {result.get('message')}")
            else:
                print(f"❌ Erro na aprovação em massa: {response.status_code}")
        else:
            print("ℹ️  Teste 5: Nenhum comentário pendente para aprovação em massa")
    print()
    
    print("🎉 Testes administrativos concluídos!")

def test_command_line():
    """Testa os comandos de linha"""
    print("\n🖥️  Testando comandos de linha")
    print("=" * 40)
    
    import subprocess
    import sys
    
    # Executar comando de estatísticas
    try:
        result = subprocess.run([
            sys.executable, 'manage.py', 'moderate_comments', 'stats'
        ], capture_output=True, text=True, cwd='.')
        
        if result.returncode == 0:
            print("✅ Comando 'stats' executado com sucesso")
            # Mostrar apenas algumas linhas do output
            lines = result.stdout.split('\n')[:10]
            for line in lines:
                if line.strip():
                    print(f"   {line}")
        else:
            print(f"❌ Erro no comando: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Erro ao executar comando: {e}")

def show_admin_interface_guide():
    """Mostra guia da interface administrativa"""
    print("\n" + "="*60)
    print("🎛️  GUIA DA INTERFACE ADMINISTRATIVA")
    print("="*60)
    
    print("\n📱 ACESSO AO PAINEL ADMIN:")
    print("   URL: http://localhost:8000/admin/")
    print("   Login: admin / admin123")
    
    print("\n💬 GESTÃO DE COMENTÁRIOS:")
    print("   • Painel: Blog > Comentários")
    print("   • Filtros: Status, Data, Categoria do Post")
    print("   • Ações em massa: Aprovar, Rejeitar, Marcar como SPAM, Excluir")
    print("   • Ações individuais: Links diretos para aprovar/rejeitar")
    print("   • Estatísticas: Dashboard integrado com métricas")
    
    print("\n❤️  GESTÃO DE CURTIDAS:")
    print("   • Painel: Blog > Likes")
    print("   • Visualizar: Usuário, Post, Data")
    print("   • Filtros: Data, Categoria do Post")
    
    print("\n📤 GESTÃO DE COMPARTILHAMENTOS:")
    print("   • Painel: Blog > Shares")
    print("   • Visualizar: Post, Tipo, Usuário/Anônimo, IP, Data")
    print("   • Estatísticas: Por tipo de compartilhamento")
    
    print("\n🔧 COMANDOS DE LINHA:")
    print("   • python manage.py moderate_comments stats")
    print("   • python manage.py moderate_comments pending")
    print("   • python manage.py moderate_comments approve --comment-id <ID>")
    print("   • python manage.py moderate_comments reject --comment-id <ID>")
    print("   • python manage.py moderate_comments approve --all")
    
    print("\n🌐 APIs ADMINISTRATIVAS:")
    print("   • GET /api/v1/blog/admin/comments/stats/")
    print("   • GET /api/v1/blog/admin/comments/pending/")
    print("   • POST /api/v1/blog/admin/comments/{id}/approve/")
    print("   • POST /api/v1/blog/admin/comments/bulk_approve/")
    print("   • GET /api/v1/blog/admin/social-stats/overview/")
    
    print("\n✨ FUNCIONALIDADES DESTACADAS:")
    print("   🎯 Dashboard com estatísticas em tempo real")
    print("   ⚡ Aprovação/rejeição com um clique")
    print("   📊 Métricas de engajamento por post")
    print("   🔍 Filtros avançados e busca inteligente")
    print("   📱 Interface responsiva e intuitiva")
    print("   🚀 Ações em massa para produtividade")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    test_admin_apis()
    test_command_line()
    show_admin_interface_guide()
