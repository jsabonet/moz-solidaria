#!/usr/bin/env python3
"""
Script para testar o endpoint de geração de PDF
"""

import requests
import json
import sys

def test_pdf_endpoint():
    """Testa o endpoint de geração de PDF"""
    
    url = 'http://localhost:8000/api/v1/reports/exports/generate/'
    
    # Dados de teste
    test_data = {
        'type': 'blog',
        'format': 'pdf', 
        'filename': 'test-export'
    }
    
    try:
        print("🚀 Testando endpoint de PDF...")
        print(f"URL: {url}")
        print(f"Dados: {json.dumps(test_data, indent=2)}")
        print("-" * 50)
        
        # Fazer requisição
        response = requests.post(
            url,
            json=test_data,
            timeout=10,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"📋 Response Headers:")
        for key, value in response.headers.items():
            print(f"   {key}: {value}")
        
        print(f"\n📄 Response Content Type: {response.headers.get('content-type', 'N/A')}")
        
        # Verificar se é PDF ou JSON
        if response.headers.get('content-type', '').startswith('application/pdf'):
            print(f"✅ PDF gerado com sucesso! Tamanho: {len(response.content)} bytes")
            
            # Salvar PDF para verificação
            with open('test_generated.pdf', 'wb') as f:
                f.write(response.content)
            print("📁 PDF salvo como 'test_generated.pdf'")
            
        elif response.headers.get('content-type', '').startswith('application/json'):
            print("📋 Resposta JSON recebida:")
            try:
                json_data = response.json()
                print(json.dumps(json_data, indent=2, ensure_ascii=False))
            except:
                print(response.text)
        else:
            print(f"📄 Resposta recebida (primeiros 200 caracteres):")
            print(response.text[:200])
            
        if response.status_code == 200:
            print("\n🎉 SUCESSO: Endpoint funcionando corretamente!")
        else:
            print(f"\n⚠️ AVISO: Status code {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERRO: Não foi possível conectar ao servidor")
        print("   Verifique se o Django está rodando em http://localhost:8000")
        sys.exit(1)
        
    except requests.exceptions.Timeout:
        print("⏱️ ERRO: Timeout na requisição")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ ERRO inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_pdf_endpoint()
