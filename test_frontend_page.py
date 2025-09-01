#!/usr/bin/env python3
"""
Teste do carregamento da página de criar projeto
"""
import requests
import json

def test_create_project_page():
    """Testa se a página de criar projeto está acessível"""
    try:
        print("🧪 Testando acesso à página de criar projeto...")
        
        url = "http://209.97.128.71:3000/criar-projeto"
        response = requests.get(url, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Página acessível!")
            
            # Verificar se contém elementos esperados
            content = response.text
            
            # Verificar elementos importantes
            checks = [
                ("select", "campo de seleção"),
                ("programa", "referência a programa"),
                ("option", "opções de seleção"),
                ("form", "formulário"),
                ("input", "campos de entrada")
            ]
            
            for keyword, description in checks:
                if keyword.lower() in content.lower():
                    print(f"  ✅ Encontrado: {description}")
                else:
                    print(f"  ⚠️ Não encontrado: {description}")
                    
            # Verificar tamanho do conteúdo
            print(f"  📏 Tamanho do conteúdo: {len(content)} caracteres")
            
        else:
            print(f"❌ Erro: {response.status_code}")
            print(f"Resposta: {response.text[:200]}...")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

def test_frontend_health():
    """Testa se o frontend está rodando"""
    try:
        print("\n🧪 Testando saúde do frontend...")
        
        url = "http://209.97.128.71:3000/"
        response = requests.get(url, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Frontend está rodando!")
        else:
            print(f"❌ Frontend com problemas: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

def main():
    print("🚀 Testando frontend e página de criar projeto...")
    test_frontend_health()
    test_create_project_page()
    print("\n🏁 Teste concluído!")

if __name__ == "__main__":
    main()
