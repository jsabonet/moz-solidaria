#!/usr/bin/env python
"""
Script para debugar o erro de doação de convidado
"""

import requests
import json
import os
from pathlib import Path

# Configuração
API_BASE = "http://localhost:8000/api/v1"

def test_guest_donation_detailed():
    """Testa criação de doação como convidado com logs detalhados"""
    print("🧪 Testando doação de convidado com debug...")
    
    # Primeiro, obter métodos de doação
    print("1. Obtendo métodos de doação...")
    try:
        methods_response = requests.get(f"{API_BASE}/donations/methods/")
        print(f"   Status: {methods_response.status_code}")
        print(f"   Response: {methods_response.text[:200]}...")
        
        if methods_response.status_code != 200:
            print(f"❌ Erro ao obter métodos de doação: {methods_response.status_code}")
            return False
        
        methods = methods_response.json()
        if not methods:
            print("❌ Nenhum método de doação disponível")
            return False
        
        method_id = methods[0]['id'] if isinstance(methods, list) else methods['results'][0]['id']
        print(f"✅ Método de doação selecionado: {method_id}")
        
    except Exception as e:
        print(f"❌ Erro ao obter métodos: {str(e)}")
        return False
    
    # Criar arquivo de teste para upload
    print("2. Criando arquivo PDF de teste...")
    test_file_path = Path(__file__).parent / "test_receipt_debug.pdf"
    
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
    print("3. Preparando dados...")
    data = {
        'amount': '1500.00',
        'donation_method': str(method_id),
        'guest_name': 'Maria Silva Debug',
        'guest_email': 'maria.debug@example.com',
        'guest_phone': '+258 84 987 6543',
        'donor_message': 'Doação de teste para debug do sistema'
    }
    
    print(f"   Dados: {data}")
    
    # Upload do comprovante
    files = {
        'payment_proof': ('test_receipt_debug.pdf', open(test_file_path, 'rb'), 'application/pdf')
    }
    
    print("4. Enviando requisição...")
    try:
        response = requests.post(f"{API_BASE}/donations/guest/", data=data, files=files)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 201:
            donation_data = response.json()
            print(f"✅ Doação de convidado criada com sucesso!")
            print(f"   ID: {donation_data.get('id')}")
            print(f"   Valor: {donation_data.get('amount')} MZN")
            print(f"   Status: {donation_data.get('status')}")
            return True
        else:
            print(f"❌ Erro ao criar doação: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Detalhes do erro: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Resposta não é JSON válido")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
        return False
        
    finally:
        # Limpar arquivo de teste
        if test_file_path.exists():
            test_file_path.unlink()
        files['payment_proof'][1].close()

if __name__ == "__main__":
    test_guest_donation_detailed()
