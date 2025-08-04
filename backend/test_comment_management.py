#!/usr/bin/env python3
"""
Script para testar a funcionalidade de gestão de comentários na dashboard
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
from blog.models import BlogPost, Comment

def test_comment_management():
    """Testa a gestão de comentários"""
    
    print("🧪 Testando Sistema de Gestão de Comentários")
    print("=" * 50)
    
    # URLs base
    BASE_URL = "http://localhost:8000/api/v1/blog/admin/comments"
    AUTH_URL = "http://localhost:8000/api/v1/auth/token/"
    
    try:
        # 1. Obter token de autenticação
        print("🔐 Fazendo login como admin...")
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        auth_response = requests.post(AUTH_URL, json=login_data)
        if auth_response.status_code == 200:
            auth_data = auth_response.json()
            token = auth_data.get('access')
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Login realizado com sucesso")
        else:
            print(f"❌ Erro no login: {auth_response.status_code}")
            return
        
        # 2. Testar busca de comentários
        print("\n📝 Testando busca de comentários...")
        response = requests.get(f"{BASE_URL}/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            comments = data if isinstance(data, list) else data.get('results', [])
            print(f"✅ Encontrados {len(comments)} comentários")
            
            for comment in comments[:3]:  # Mostrar apenas os primeiros 3
                status = "Aprovado" if comment.get('is_approved') else "Pendente"
                print(f"   - ID {comment['id']}: {comment['content'][:50]}... ({status})")
        else:
            print(f"❌ Erro ao buscar comentários: {response.status_code}")
            return
        
        # 3. Testar filtros
        print("\n🔍 Testando filtros...")
        
        # Comentários pendentes
        response = requests.get(f"{BASE_URL}/?is_approved=false", headers=headers)
        if response.status_code == 200:
            data = response.json()
            pending = data if isinstance(data, list) else data.get('results', [])
            print(f"✅ Comentários pendentes: {len(pending)}")
        
        # Comentários aprovados
        response = requests.get(f"{BASE_URL}/?is_approved=true", headers=headers)
        if response.status_code == 200:
            data = response.json()
            approved = data if isinstance(data, list) else data.get('results', [])
            print(f"✅ Comentários aprovados: {len(approved)}")
        
        # 4. Testar aprovação (se houver comentários pendentes)
        if len(pending) > 0:
            comment_id = pending[0]['id']
            print(f"\n✅ Testando aprovação do comentário ID {comment_id}...")
            
            response = requests.post(f"{BASE_URL}/{comment_id}/approve/", headers=headers)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Comentário aprovado: {result.get('message', 'Sucesso')}")
            else:
                print(f"❌ Erro na aprovação: {response.status_code}")
        
        # 5. Testar busca por texto
        print("\n🔍 Testando busca por texto...")
        response = requests.get(f"{BASE_URL}/?search=test", headers=headers)
        if response.status_code == 200:
            data = response.json()
            search_results = data if isinstance(data, list) else data.get('results', [])
            print(f"✅ Resultados da busca 'test': {len(search_results)}")
        
        print("\n🎉 Todos os testes da API concluídos!")
        
        # 6. Verificar dados no banco
        print("\n📊 Verificando dados no banco de dados...")
        total_comments = Comment.objects.count()
        approved_comments = Comment.objects.filter(is_approved=True).count()
        pending_comments = Comment.objects.filter(is_approved=False).count()
        
        print(f"   Total de comentários: {total_comments}")
        print(f"   Aprovados: {approved_comments}")
        print(f"   Pendentes: {pending_comments}")
        
        # Mostrar alguns comentários
        if total_comments > 0:
            print("\n📝 Últimos comentários:")
            recent_comments = Comment.objects.order_by('-created_at')[:3]
            for comment in recent_comments:
                status = "✅ Aprovado" if comment.is_approved else "⏳ Pendente"
                print(f"   - {comment.author_name}: {comment.content[:50]}... ({status})")
        
        print("\n✨ Sistema de gestão de comentários está funcionando!")
        
    except Exception as e:
        print(f"❌ Erro durante os testes: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_comment_management()
