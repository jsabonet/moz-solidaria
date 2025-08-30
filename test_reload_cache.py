#!/usr/bin/env python3
"""
🔄 TESTE DA LIMPEZA AUTOMÁTICA DE CACHE NO RELOAD
 
Este script testa a nova funcionalidade que limpa o cache automaticamente
quando o usuário recarrega a página, garantindo permissões sempre atualizadas.
"""

import requests
import json
import time
from datetime import datetime

# Configuração
BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_separator(title):
    print(f"\n{'='*60}")
    print(f"🔄 {title}")
    print('='*60)

def print_step(step, description):
    print(f"\n{step}. {description}")
    print("-" * 40)

def test_login():
    """Fazer login e obter token"""
    print_step("1", "Fazendo login")
    
    login_data = {
        "username": "admin",  # Ajuste conforme necessário
        "password": "admin123"  # Ajuste conforme necessário
    }
    
    response = requests.post(f"{BASE_URL}/auth/token/", json=login_data)
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get('access')
        print(f"✅ Login bem-sucedido! Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Erro no login: {response.status_code}")
        return None

def test_normal_request(token):
    """Testar requisição normal (sem headers de reload)"""
    print_step("2", "Testando requisição normal")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f"{BASE_URL}/auth/user/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Requisição normal:")
        print(f"   - Username: {data.get('username')}")
        print(f"   - Is Staff: {data.get('is_staff')}")
        print(f"   - Fresh Data: {data.get('fresh_data', 'N/A')}")
        print(f"   - Is Page Reload: {data.get('is_page_reload', 'N/A')}")
        print(f"   - Cache Busted: {data.get('cache_busted', 'N/A')}")
        return data
    else:
        print(f"❌ Erro na requisição normal: {response.status_code}")
        return None

def test_page_reload_request(token):
    """Testar requisição simulando reload da página"""
    print_step("3", "Testando requisição com headers de RELOAD DA PÁGINA")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Force-Fresh': 'true',
        'X-Page-Reload': 'true'  # Header que indica reload da página
    }
    
    response = requests.get(f"{BASE_URL}/auth/user/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Requisição com reload da página:")
        print(f"   - Username: {data.get('username')}")
        print(f"   - Is Staff: {data.get('is_staff')}")
        print(f"   - Fresh Data: {data.get('fresh_data', 'N/A')}")
        print(f"   - Is Page Reload: {data.get('is_page_reload', 'N/A')}")
        print(f"   - Cache Busted: {data.get('cache_busted', 'N/A')}")
        print(f"   - Timestamp: {data.get('timestamp', 'N/A')}")
        
        # Verificar headers de resposta
        cache_cleared = response.headers.get('X-Cache-Cleared')
        fresh_data_header = response.headers.get('X-Fresh-Data')
        
        print(f"\n📡 Headers de resposta:")
        print(f"   - X-Cache-Cleared: {cache_cleared}")
        print(f"   - X-Fresh-Data: {fresh_data_header}")
        print(f"   - Cache-Control: {response.headers.get('Cache-Control')}")
        
        return data
    else:
        print(f"❌ Erro na requisição de reload: {response.status_code}")
        return None

def compare_requests(normal_data, reload_data):
    """Comparar requisições normal vs reload"""
    print_step("4", "Comparando requisição normal vs reload")
    
    if not normal_data or not reload_data:
        print("❌ Dados insuficientes para comparação")
        return
    
    print("📊 Comparação de dados:")
    print(f"   - Fresh Data (normal): {normal_data.get('fresh_data', 'N/A')}")
    print(f"   - Fresh Data (reload): {reload_data.get('fresh_data', 'N/A')}")
    print(f"   - Is Page Reload (normal): {normal_data.get('is_page_reload', 'N/A')}")
    print(f"   - Is Page Reload (reload): {reload_data.get('is_page_reload', 'N/A')}")
    print(f"   - Cache Busted (normal): {normal_data.get('cache_busted', 'N/A')}")
    print(f"   - Cache Busted (reload): {reload_data.get('cache_busted', 'N/A')}")
    
    # Verificar se o comportamento de reload está funcionando
    reload_detected = reload_data.get('is_page_reload') == True
    cache_properly_handled = reload_data.get('cache_busted') == True
    fresh_data_provided = reload_data.get('fresh_data') == True
    
    print(f"\n🔍 Verificações de funcionalidade:")
    print(f"   ✅ Reload detectado: {reload_detected}")
    print(f"   ✅ Cache foi limpo: {cache_properly_handled}")
    print(f"   ✅ Dados frescos fornecidos: {fresh_data_provided}")
    
    return reload_detected and cache_properly_handled and fresh_data_provided

def test_cache_clear_endpoint(token):
    """Testar o endpoint específico de limpeza de cache"""
    print_step("5", "Testando endpoint específico de limpeza de cache")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(f"{BASE_URL}/auth/sessions/force_user_cache_clear/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Endpoint de limpeza de cache:")
        print(f"   - Status: {data.get('status')}")
        print(f"   - Message: {data.get('message')}")
        print(f"   - Cache Cleared: {data.get('cache_cleared')}")
        print(f"   - Fresh Data: {data.get('fresh_data')}")
        return True
    else:
        print(f"❌ Erro no endpoint de limpeza: {response.status_code}")
        return False

def main():
    """Função principal do teste"""
    print_separator("TESTE DE LIMPEZA AUTOMÁTICA DE CACHE NO RELOAD")
    print(f"🕒 Iniciado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Login
    token = test_login()
    if not token:
        print("❌ Não foi possível obter token. Encerrando teste.")
        return
    
    # 2. Requisição normal
    normal_data = test_normal_request(token)
    
    # 3. Pequena pausa
    time.sleep(1)
    
    # 4. Requisição simulando reload
    reload_data = test_page_reload_request(token)
    
    # 5. Comparar resultados
    comparison_success = compare_requests(normal_data, reload_data)
    
    # 6. Testar endpoint específico
    cache_endpoint_success = test_cache_clear_endpoint(token)
    
    # Conclusão
    print_separator("RESULTADO DO TESTE")
    
    if comparison_success and cache_endpoint_success:
        print("🎉 TESTE PASSOU! A limpeza automática de cache no reload está funcionando!")
        print("   ✅ Headers de reload são detectados corretamente")
        print("   ✅ Cache é limpo automaticamente em reloads")
        print("   ✅ Dados frescos são fornecidos")
        print("   ✅ Endpoint específico de limpeza funciona")
        print("\n💡 Agora quando o usuário recarregar a página, as permissões serão sempre atualizadas!")
    elif comparison_success:
        print("⚠️ TESTE PARCIAL. Reload funciona mas endpoint específico falhou.")
    elif cache_endpoint_success:
        print("⚠️ TESTE PARCIAL. Endpoint específico funciona mas detecção de reload falhou.")
    else:
        print("❌ TESTE FALHOU. A funcionalidade não está funcionando como esperado.")
    
    print(f"\n🕒 Finalizado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
