#!/usr/bin/env python3
"""
Script para criar um usuário de teste e verificar autenticação
"""

import os
import sys
import django
import requests
import json
from datetime import datetime

# Configurar Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

def create_test_user():
    """Criar um usuário de teste no Django"""
    print("🔧 Criando usuário de teste...")
    
    try:
        from django.contrib.auth.models import User
        
        # Verificar se o usuário já existe
        username = "admin"
        email = "admin@test.com"
        password = "admin123"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,
                'is_superuser': True,
                'first_name': 'Admin',
                'last_name': 'Test'
            }
        )
        
        if created:
            user.set_password(password)
            user.save()
            print(f"✅ Usuário criado: {username}")
        else:
            # Atualizar senha caso o usuário já exista
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"✅ Usuário atualizado: {username}")
        
        print(f"📋 Credenciais de teste:")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"   Email: {email}")
        
        return username, password
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        return None, None

def test_login_api(username, password):
    """Testar login via API"""
    print(f"\n🔐 Testando login API para: {username}")
    
    try:
        # Fazer login via API
        response = requests.post('http://localhost:8000/api/v1/auth/token/', {
            'username': username,
            'password': password
        })
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login bem-sucedido!")
            print(f"   Access Token: {data['access'][:50]}...")
            print(f"   Refresh Token: {data['refresh'][:50]}...")
            
            # Testar token obtendo dados do usuário
            user_response = requests.get('http://localhost:8000/api/v1/auth/user/', {
                'Authorization': f"Bearer {data['access']}"
            })
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"✅ Token válido! Usuário: {user_data['username']}")
                return data['access'], data['refresh']
            else:
                print(f"⚠️ Token obtido mas falhou ao buscar dados do usuário: {user_response.status_code}")
                
        else:
            print(f"❌ Login falhou: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao servidor Django")
        print("💡 Certifique-se de que o servidor está rodando em http://localhost:8000")
    except Exception as e:
        print(f"❌ Erro no teste de login: {e}")
    
    return None, None

def test_export_endpoint(access_token):
    """Testar endpoint de exportação com token"""
    print(f"\n📊 Testando endpoint de exportação...")
    
    endpoints = [
        'projects',
        'donations', 
        'volunteers',
        'beneficiaries'
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.post(
                f'http://localhost:8000/api/v1/reports/exports/{endpoint}/',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {access_token}'
                },
                json={
                    'format': 'json',
                    'filters': {}
                }
            )
            
            print(f"   {endpoint}: Status {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ {endpoint} - Exportação funcionando!")
            elif response.status_code == 401:
                print(f"   ❌ {endpoint} - Ainda não autorizado")
            else:
                print(f"   ⚠️ {endpoint} - Erro: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ {endpoint} - Erro: {e}")

def generate_frontend_login_instructions(username, password, access_token, refresh_token):
    """Gerar instruções para login no frontend"""
    print(f"\n📝 INSTRUÇÕES PARA CORRIGIR O PROBLEMA 401:")
    print("=" * 60)
    
    print("1️⃣ Método 1: Login via Interface Web")
    print(f"   • Acesse: http://localhost:8083/login")
    print(f"   • Username: {username}")
    print(f"   • Password: {password}")
    print(f"   • Depois vá para Relatórios > Exportações por Área")
    
    print("\n2️⃣ Método 2: Definir tokens manualmente no navegador")
    print("   • Abra o Console do navegador (F12)")
    print("   • Cole e execute este código:")
    print(f"""
localStorage.setItem('authToken', '{access_token}');
localStorage.setItem('refreshToken', '{refresh_token}');
localStorage.setItem('userData', '{json.dumps({"id": 1, "username": username, "is_staff": True})}');
console.log('✅ Tokens definidos! Recarregue a página.');
""")
    
    print("\n3️⃣ Verificar se funcionou:")
    print("   • Recarregue a página de relatórios")
    print("   • Tente exportar novamente")
    print("   • Deve funcionar sem erro 401")
    
    print(f"\n🎯 CREDENCIAIS DE TESTE:")
    print(f"   Username: {username}")
    print(f"   Password: {password}")

def main():
    """Função principal"""
    print("🚀 CONFIGURAÇÃO DE AUTENTICAÇÃO PARA TESTES DE EXPORTAÇÃO")
    print("=" * 60)
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Criar usuário de teste
    username, password = create_test_user()
    
    if not username:
        print("❌ Não foi possível criar usuário de teste")
        return
    
    # Testar login via API
    access_token, refresh_token = test_login_api(username, password)
    
    if access_token:
        # Testar endpoints de exportação
        test_export_endpoint(access_token)
        
        # Gerar instruções
        generate_frontend_login_instructions(username, password, access_token, refresh_token)
    else:
        print("❌ Não foi possível obter tokens de acesso")
        print("💡 Verifique se o servidor Django está rodando")

if __name__ == "__main__":
    main()
