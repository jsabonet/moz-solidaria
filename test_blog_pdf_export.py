#!/usr/bin/env python3
"""
Teste do endpoint de exportação de PDF para blogs
"""

import requests
import json

# Configurações
BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_blog_pdf_export():
    print("🧪 TESTE: Exportação de PDF para Blogs")
    print("=" * 50)
    
    # 1. Login como admin
    print("\n1️⃣ Fazendo login como admin...")
    login_data = {
        "username": "admin",
        "password": "123456"
    }
    
    response = requests.post(f"{BASE_URL}/auth/token/", json=login_data)
    if response.status_code == 200:
        login_result = response.json()
        admin_token = login_result.get('access')
        print(f"✅ Login bem-sucedido! Token: {admin_token[:20]}...")
    else:
        print(f"❌ Erro no login: {response.status_code}")
        return False
    
    # 2. Testar endpoint de exportação
    print("\n2️⃣ Testando exportação de PDF para blogs...")
    headers = {'Authorization': f'Bearer {admin_token}'}
    
    # Payload similar ao que o frontend envia
    export_data = {
        "type": "blog",
        "format": "pdf",
        "filename": "blogs_test_export.pdf",
        "options": {
            "dateRange": {},
            "selectedFields": [],
            "emailRecipients": []
        }
    }
    
    print(f"📤 Enviando payload: {json.dumps(export_data, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/reports/exports/generate/",
        headers=headers,
        json=export_data
    )
    
    print(f"🔄 Status da resposta: {response.status_code}")
    print(f"📋 Headers da resposta: {dict(response.headers)}")
    
    if response.status_code == 200:
        print("✅ Exportação bem-sucedida!")
        
        # Verificar se é um PDF
        content_type = response.headers.get('content-type', '')
        if 'pdf' in content_type.lower():
            print(f"📄 Arquivo PDF gerado (tamanho: {len(response.content)} bytes)")
            
            # Salvar arquivo para verificação
            with open('test_blog_export.pdf', 'wb') as f:
                f.write(response.content)
            print("💾 Arquivo salvo como 'test_blog_export.pdf'")
        else:
            print(f"⚠️ Tipo de conteúdo inesperado: {content_type}")
            print(f"📝 Conteúdo: {response.text[:500]}...")
            
    elif response.status_code == 404:
        print("❌ Endpoint não encontrado (404)")
        print("🔍 Verificando se a URL está correta...")
        
        # Testar outros endpoints possíveis
        test_urls = [
            f"{BASE_URL}/reports/exports/area_exports/",
            f"{BASE_URL}/reports/",
            f"{BASE_URL}/reports/exports/"
        ]
        
        for test_url in test_urls:
            test_response = requests.get(test_url, headers=headers)
            print(f"  🧪 {test_url}: {test_response.status_code}")
            
    else:
        print(f"❌ Erro na exportação: {response.status_code}")
        try:
            error_data = response.json()
            print(f"📝 Detalhes do erro: {json.dumps(error_data, indent=2)}")
        except:
            print(f"📝 Resposta: {response.text}")
    
    return response.status_code == 200

if __name__ == "__main__":
    try:
        test_blog_pdf_export()
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        import traceback
        traceback.print_exc()
