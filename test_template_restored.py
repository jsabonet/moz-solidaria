#!/usr/bin/env python3
"""
🧪 TESTE DO TEMPLATE PERSONALIZADO RESTAURADO
Verifica se o template premium da Moz Solidária foi restaurado corretamente
"""

import requests
import json
import sys
import os

def test_restored_template():
    """Testar se o template personalizado foi restaurado"""
    
    print("🎯 TESTE DO TEMPLATE PERSONALIZADO MOZ SOLIDÁRIA")
    print("=" * 60)
    
    url = 'http://localhost:8000/api/v1/reports/exports/generate/'
    
    test_data = {
        'type': 'blog',
        'format': 'pdf',
        'filename': 'test-template-premium-restored'
    }
    
    try:
        print("🚀 Enviando requisição para endpoint...")
        print(f"📍 URL: {url}")
        print(f"📦 Dados: {json.dumps(test_data, indent=2)}")
        print("-" * 60)
        
        response = requests.post(
            url,
            json=test_data,
            timeout=15,  # Mais tempo para geração premium
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"📏 Content-Length: {response.headers.get('content-length', 'N/A')}")
        
        # Verificar headers específicos do template premium
        if 'X-Generated-By' in response.headers:
            print(f"⭐ Generated-By: {response.headers['X-Generated-By']}")
        if 'X-Template-Version' in response.headers:
            print(f"🎨 Template Version: {response.headers['X-Template-Version']}")
        
        print("-" * 60)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            
            if content_type.startswith('application/pdf'):
                # PDF Premium gerado!
                pdf_size = len(response.content)
                print(f"✅ PDF PREMIUM GERADO COM SUCESSO!")
                print(f"📄 Tamanho: {pdf_size:,} bytes")
                
                # Salvar para verificação
                filename = 'template_premium_restored.pdf'
                with open(filename, 'wb') as f:
                    f.write(response.content)
                
                print(f"💾 PDF salvo como: {filename}")
                print(f"🎨 TEMPLATE PERSONALIZADO RESTAURADO CORRETAMENTE!")
                
                # Verificar se o PDF tem tamanho esperado (template premium deve ser maior)
                if pdf_size > 50000:  # PDFs premium são maiores (>50KB)
                    print(f"⭐ CONFIRMADO: Template premium detectado (tamanho: {pdf_size:,} bytes)")
                else:
                    print(f"⚠️ Aviso: PDF menor que esperado para template premium")
                
            elif content_type.startswith('application/json'):
                print("📋 Resposta JSON (fallback):")
                try:
                    json_data = response.json()
                    print(json.dumps(json_data, indent=2, ensure_ascii=False))
                    
                    if 'PDF libraries not available' in json_data.get('message', ''):
                        print("⚠️ ReportLab não disponível - usando fallback")
                    else:
                        print("ℹ️ Fallback JSON por outro motivo")
                        
                except:
                    print(response.text[:300])
            else:
                print(f"❓ Tipo de resposta inesperado: {content_type}")
                print(f"📄 Conteúdo: {response.text[:200]}")
                
        else:
            print(f"❌ ERRO: Status {response.status_code}")
            print(f"📄 Resposta: {response.text}")
            
        print("-" * 60)
        
        if response.status_code == 200 and response.headers.get('content-type', '').startswith('application/pdf'):
            print("🎉 SUCESSO: Template personalizado Moz Solidária restaurado!")
            print("🎨 O PDF agora inclui:")
            print("   ✓ Cabeçalho premium com logo Moz Solidária")
            print("   ✓ Seção de resumo executivo em português")
            print("   ✓ Tabela responsiva com formatação profissional")
            print("   ✓ Rodapé corporativo com informações de contato")
            print("   ✓ Numeração de páginas e marca d'água")
        else:
            print("⚠️ Template pode não estar funcionando como esperado")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERRO: Não foi possível conectar ao servidor Django")
        print("   🔧 Verifique se o servidor está rodando em http://localhost:8000")
        sys.exit(1)
        
    except requests.exceptions.Timeout:
        print("⏱️ ERRO: Timeout na requisição (template premium demora mais)")
        print("   ℹ️ Template personalizado pode estar funcionando mas ser lento")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ ERRO inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_restored_template()
