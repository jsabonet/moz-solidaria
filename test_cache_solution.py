#!/usr/bin/env python3
"""
🧪 TESTE DA SOLUÇÃO DE CACHE DE PERMISSÕES
 
Este script testa a nova implementação de limpeza de cache que deve resolver
o problema de permissões que só se atualizam após logout/login.
"""

import requests
import json
import time
from datetime import datetime

# Configuração
BASE_URL = "http://127.0.0.1:8000/api/v1"
TEST_USER_EMAIL = "test_user@example.com"
ADMIN_TOKEN = None  # Será preenchido durante o teste

def print_separator(title):
    print(f"\n{'='*60}")
    print(f"🧪 {title}")
    print('='*60)

def print_step(step, description):
    print(f"\n{step}. {description}")
    print("-" * 40)

def test_login_and_get_token():
    """Fazer login e obter token"""
    print_step("1", "Fazendo login para obter token")
    
    login_data = {
        "username": "admin",  # Ajuste conforme necessário
        "password": "admin123"  # Ajuste conforme necessário
    }
    
    response = requests.post(f"{BASE_URL}/auth/token/", json=login_data)
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get('access')
        print(f"✅ Login bem-sucedido! Token obtido: {token[:20]}...")
        return token
    else:
        print(f"❌ Erro no login: {response.status_code}")
        print(f"Resposta: {response.text}")
        return None

def get_user_permissions(token):
    """Obter permissões atuais do usuário"""
    print_step("2", "Obtendo permissões atuais do usuário")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
    
    response = requests.get(f"{BASE_URL}/auth/user/", headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Dados do usuário obtidos:")
        print(f"   - ID: {user_data.get('id')}")
        print(f"   - Username: {user_data.get('username')}")
        print(f"   - Is Staff: {user_data.get('is_staff')}")
        print(f"   - Is Superuser: {user_data.get('is_superuser')}")
        print(f"   - Groups: {user_data.get('groups', [])}")
        print(f"   - Fresh Data: {user_data.get('fresh_data', 'N/A')}")
        print(f"   - Cache Busted: {user_data.get('cache_busted', 'N/A')}")
        return user_data
    else:
        print(f"❌ Erro ao obter dados do usuário: {response.status_code}")
        print(f"Resposta: {response.text}")
        return None

def test_cache_clear_endpoint(token):
    """Testar o novo endpoint de limpeza de cache"""
    print_step("3", "Testando endpoint de limpeza de cache")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
    
    response = requests.post(f"{BASE_URL}/auth/sessions/force_user_cache_clear/", headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Cache limpo com sucesso!")
        print(f"   - Status: {result.get('status')}")
        print(f"   - Message: {result.get('message')}")
        print(f"   - Cache Cleared: {result.get('cache_cleared')}")
        print(f"   - Fresh Data: {result.get('fresh_data')}")
        print(f"   - Timestamp: {result.get('timestamp')}")
        
        user_data = result.get('user_data', {})
        print(f"   - User Groups: {user_data.get('groups', [])}")
        print(f"   - User Permissions Count: {len(user_data.get('permissions', []))}")
        
        return True
    else:
        print(f"❌ Erro ao limpar cache: {response.status_code}")
        print(f"Resposta: {response.text}")
        return False

def test_user_data_after_cache_clear(token):
    """Verificar dados do usuário após limpeza de cache"""
    print_step("4", "Verificando dados do usuário após limpeza de cache")
    
    # Pequena pausa para garantir que o cache foi limpo
    time.sleep(1)
    
    return get_user_permissions(token)

def compare_before_after(before_data, after_data):
    """Comparar dados antes e depois da limpeza de cache"""
    print_step("5", "Comparando dados antes e depois da limpeza de cache")
    
    if not before_data or not after_data:
        print("❌ Dados insuficientes para comparação")
        return
    
    print("📊 Comparação:")
    
    # Comparar campos importantes
    fields_to_compare = ['is_staff', 'is_superuser', 'groups', 'permissions']
    
    for field in fields_to_compare:
        before_value = before_data.get(field)
        after_value = after_data.get(field)
        
        if before_value == after_value:
            print(f"   ✅ {field}: Inalterado ({before_value})")
        else:
            print(f"   🔄 {field}: Mudou de {before_value} para {after_value}")
    
    # Verificar indicadores de cache
    print(f"\n📋 Indicadores de Cache:")
    print(f"   - Fresh Data (antes): {before_data.get('fresh_data', 'N/A')}")
    print(f"   - Fresh Data (depois): {after_data.get('fresh_data', 'N/A')}")
    print(f"   - Cache Busted (antes): {before_data.get('cache_busted', 'N/A')}")
    print(f"   - Cache Busted (depois): {after_data.get('cache_busted', 'N/A')}")

def main():
    """Função principal do teste"""
    print_separator("TESTE DA SOLUÇÃO DE CACHE DE PERMISSÕES")
    print(f"🕒 Iniciado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Login
    token = test_login_and_get_token()
    if not token:
        print("❌ Não foi possível obter token. Encerrando teste.")
        return
    
    # 2. Obter permissões antes da limpeza de cache
    before_data = get_user_permissions(token)
    if not before_data:
        print("❌ Não foi possível obter dados do usuário. Encerrando teste.")
        return
    
    # 3. Testar limpeza de cache
    cache_clear_success = test_cache_clear_endpoint(token)
    if not cache_clear_success:
        print("❌ Falha na limpeza de cache. Continuando com o teste...")
    
    # 4. Obter permissões após limpeza de cache
    after_data = test_user_data_after_cache_clear(token)
    
    # 5. Comparar resultados
    compare_before_after(before_data, after_data)
    
    # Conclusão
    print_separator("RESULTADO DO TESTE")
    
    if cache_clear_success and after_data:
        fresh_data_indicator = after_data.get('fresh_data', False)
        cache_busted_indicator = after_data.get('cache_busted', False)
        
        if fresh_data_indicator and cache_busted_indicator:
            print("🎉 TESTE PASSOU! A solução de cache está funcionando corretamente.")
            print("   ✅ Cache foi limpo com sucesso")
            print("   ✅ Dados frescos foram retornados")
            print("   ✅ Indicadores de cache estão corretos")
        else:
            print("⚠️ TESTE PARCIAL. A limpeza de cache funcionou mas os indicadores podem estar incorretos.")
            print(f"   - Fresh Data: {fresh_data_indicator}")
            print(f"   - Cache Busted: {cache_busted_indicator}")
    else:
        print("❌ TESTE FALHOU. A solução de cache não está funcionando como esperado.")
    
    print(f"\n🕒 Finalizado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
