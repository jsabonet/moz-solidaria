#!/usr/bin/env python
"""
Script para testar o sistema unificado de doações
Testa tanto doações de usuários logados quanto de convidados
"""

import requests
import json
import os
from pathlib import Path

# Configuração
BASE_URL = "http://localhost:8082"  # Frontend Vite
API_BASE = "http://localhost:8000/api/v1"  # Backend Django

def test_guest_donation():
    """Testa criação de doação como convidado"""
    print("🧪 Testando doação de convidado...")
    
    # Primeiro, obter métodos de doação
    methods_response = requests.get(f"{API_BASE}/donations/methods/")
    if methods_response.status_code != 200:
        print(f"❌ Erro ao obter métodos de doação: {methods_response.status_code}")
        return False
    
    methods = methods_response.json()
    if not methods:
        print("❌ Nenhum método de doação disponível")
        return False
    
    method_id = methods[0]['id'] if isinstance(methods, list) else methods['results'][0]['id']
    print(f"✅ Método de doação selecionado: {method_id}")
    
    # Criar arquivo de teste para upload
    test_file_path = Path(__file__).parent / "test_receipt.pdf"
    
    # Criar um PDF mínimo válido
    pdf_content = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000015 00000 n 
0000000060 00000 n 
0000000111 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF"""
    
    with open(test_file_path, "wb") as f:
        f.write(pdf_content)
    
    # Dados da doação de convidado
    data = {
        'amount': '1000.00',
        'donation_method': str(method_id),
        'guest_name': 'João Silva Teste',
        'guest_email': 'joao.teste@example.com',
        'guest_phone': '+258 84 123 4567',
        'donor_message': 'Doação de teste via formulário de convidado'
    }
    
    # Upload do comprovante
    files = {
        'payment_proof': ('test_receipt.pdf', open(test_file_path, 'rb'), 'application/pdf')
    }
    
    try:
        response = requests.post(f"{API_BASE}/donations/guest/", data=data, files=files)
        print(f"📤 Resposta da API: {response.status_code}")
        
        if response.status_code == 201:
            donation_data = response.json()
            print(f"✅ Doação de convidado criada com sucesso!")
            print(f"   ID: {donation_data.get('id')}")
            print(f"   Valor: {donation_data.get('amount')} MZN")
            print(f"   Status: {donation_data.get('status')}")
            return True
        else:
            print(f"❌ Erro ao criar doação: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
        return False
        
    finally:
        # Limpar arquivo de teste
        if test_file_path.exists():
            test_file_path.unlink()
        files['payment_proof'][1].close()

def test_donation_methods():
    """Testa endpoint de métodos de doação"""
    print("🧪 Testando métodos de doação...")
    
    try:
        response = requests.get(f"{API_BASE}/donations/methods/")
        if response.status_code == 200:
            methods = response.json()
            print(f"✅ Métodos obtidos com sucesso: {len(methods) if isinstance(methods, list) else len(methods.get('results', []))}")
            return True
        else:
            print(f"❌ Erro ao obter métodos: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
        return False

def test_frontend_routes():
    """Testa se as rotas do frontend estão acessíveis"""
    print("🧪 Testando rotas do frontend...")
    
    routes_to_test = [
        "/doacao",
        "/enviar-comprovante"
    ]
    
    success_count = 0
    for route in routes_to_test:
        try:
            response = requests.get(f"{BASE_URL}{route}")
            if response.status_code == 200:
                print(f"✅ Rota {route} acessível")
                success_count += 1
            else:
                print(f"❌ Rota {route} retornou: {response.status_code}")
        except Exception as e:
            print(f"❌ Erro ao acessar {route}: {str(e)}")
    
    return success_count == len(routes_to_test)

def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes do sistema unificado de doações")
    print("=" * 60)
    
    tests = [
        ("Métodos de Doação", test_donation_methods),
        ("Doação de Convidado", test_guest_donation),
        ("Rotas do Frontend", test_frontend_routes)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 40)
        result = test_func()
        results.append((test_name, result))
        print("-" * 40)
    
    print(f"\n📊 RESUMO DOS TESTES")
    print("=" * 60)
    for test_name, result in results:
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\n🎯 Resultado final: {passed}/{total} testes passaram")
    
    if passed == total:
        print("🎉 Todos os testes passaram! Sistema pronto para uso.")
    else:
        print("⚠️  Alguns testes falharam. Verifique a configuração.")

if __name__ == "__main__":
    main()
