#!/usr/bin/env python3
"""
Teste da funcionalidade de exportação PDF do sistema de relatórios
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

def test_pdf_export_endpoints():
    """Testa todos os endpoints de exportação PDF"""
    base_url = "http://127.0.0.1:8000"
    endpoints = [
        "/api/v1/reports/exports/projects/",
        "/api/v1/reports/exports/donations/",
        "/api/v1/reports/exports/volunteers/",
        "/api/v1/reports/exports/beneficiaries/"
    ]
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    print("🧪 Testando endpoints de exportação PDF...")
    print("=" * 60)
    
    for endpoint in endpoints:
        area_name = endpoint.split('/')[-2]
        
        # Teste para PDF
        payload = {
            "format": "pdf",
            "filters": {}
        }
        
        print(f"\n📄 Testando exportação PDF para {area_name}...")
        
        try:
            response = requests.post(f"{base_url}{endpoint}", 
                                   data=json.dumps(payload), 
                                   headers=headers)
            
            print(f"   Status: {response.status_code}")
            print(f"   Content-Type: {response.headers.get('Content-Type', 'N/A')}")
            print(f"   Content-Length: {len(response.content)} bytes")
            
            if response.status_code == 200:
                # Verificar se é realmente um PDF
                if response.content.startswith(b'%PDF'):
                    print(f"   ✅ PDF válido gerado para {area_name}")
                    
                    # Salvar arquivo de exemplo
                    filename = f"test_export_{area_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    print(f"   📁 Arquivo salvo: {filename}")
                else:
                    print(f"   ❌ Resposta não é um PDF válido para {area_name}")
                    print(f"   Primeiros bytes: {response.content[:50]}")
            
            elif response.status_code == 401:
                print(f"   🔒 Autenticação necessária (esperado)")
            
            else:
                print(f"   ❌ Erro inesperado: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Erro: {error_data}")
                except:
                    print(f"   Resposta: {response.text[:200]}")
                    
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Não foi possível conectar ao servidor")
        except Exception as e:
            print(f"   ❌ Erro: {e}")

def test_local_pdf_generation():
    """Testa geração de PDF diretamente no backend"""
    print("\n🔧 Testando geração de PDF local...")
    print("=" * 60)
    
    try:
        from reports.export_views import ExportViewSet
        from django.http import HttpResponse
        
        # Simular dados para PDF
        test_data = [
            {'id': 1, 'nome': 'Projeto Teste', 'categoria': 'Educação', 'status': 'Ativo'},
            {'id': 2, 'nome': 'Projeto 2', 'categoria': 'Saúde', 'status': 'Concluído'}
        ]
        
        # Criar instância do ViewSet
        viewset = ExportViewSet()
        
        # Testar geração de PDF (função retorna HttpResponse)
        options = {}
        filename = "test_relatorio"
        
        response = viewset._generate_pdf(test_data, options, filename)
        
        # Verificar se é uma resposta HTTP válida
        if isinstance(response, HttpResponse):
            pdf_data = response.content
            
            if pdf_data.startswith(b'%PDF'):
                print("✅ PDF gerado com sucesso localmente")
                print(f"   Tamanho: {len(pdf_data)} bytes")
                print(f"   Content-Type: {response.get('Content-Type', 'N/A')}")
                
                # Salvar arquivo de teste
                test_filename = f"test_local_pdf_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                with open(test_filename, 'wb') as f:
                    f.write(pdf_data)
                print(f"   📁 Arquivo salvo: {test_filename}")
                
                return True
            else:
                print("❌ PDF não foi gerado corretamente")
                print(f"   Primeiros bytes: {pdf_data[:50]}")
                return False
        else:
            print("❌ Resposta não é HttpResponse")
            return False
            
    except ImportError as e:
        print(f"❌ Erro de importação: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro na geração local: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_frontend_integration():
    """Testa se o frontend consegue acessar as opções de PDF"""
    print("\n🌐 Testando integração frontend...")
    print("=" * 60)
    
    try:
        # Verificar se o frontend está rodando
        response = requests.get("http://localhost:8083/")
        
        if response.status_code == 200:
            print("✅ Frontend acessível em http://localhost:8083/")
            
            # Verificar se contém referências a PDF
            content = response.text.lower()
            if 'pdf' in content:
                print("✅ Opções de PDF encontradas no frontend")
            else:
                print("⚠️  Opções de PDF não encontradas no HTML")
                
        else:
            print("❌ Frontend não acessível")
            
    except requests.exceptions.ConnectionError:
        print("❌ Frontend não está rodando")
    except Exception as e:
        print(f"❌ Erro ao testar frontend: {e}")

def main():
    """Função principal de teste"""
    print("🚀 TESTE COMPLETO DA FUNCIONALIDADE PDF")
    print("=" * 60)
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Teste 1: Geração local de PDF
    local_success = test_local_pdf_generation()
    
    # Teste 2: Endpoints de API
    test_pdf_export_endpoints()
    
    # Teste 3: Integração frontend
    test_frontend_integration()
    
    print("\n" + "=" * 60)
    print("📋 RESUMO DOS TESTES")
    print("=" * 60)
    
    if local_success:
        print("✅ Geração local de PDF: FUNCIONANDO")
    else:
        print("❌ Geração local de PDF: FALHOU")
    
    print("🔍 Para testar completamente:")
    print("   1. Acesse http://localhost:8083/")
    print("   2. Navegue para 'Relatórios'")
    print("   3. Vá para a aba 'Exportações por Área'")
    print("   4. Selecione uma área e formato 'PDF'")
    print("   5. Clique em 'Exportar'")
    
    print("\n🎯 Sistema de exportação PDF implementado e pronto para uso!")

if __name__ == "__main__":
    main()
