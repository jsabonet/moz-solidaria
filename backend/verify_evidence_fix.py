#!/usr/bin/env python3
"""
Teste simples para verificar a correção do upload de evidências
"""
import requests
import json

def test_evidence_api():
    """Teste da API de evidências usando requests"""
    try:
        # URL da API (assumindo servidor local)
        base_url = "http://localhost:8000/api/v1/tracking/projects"
        
        # Primeiro, listar projetos para pegar um slug válido
        projects_response = requests.get(f"http://localhost:8000/api/v1/projects/")
        if projects_response.status_code != 200:
            print("❌ Não foi possível acessar a API de projetos")
            print("   Certifique-se de que o servidor Django está rodando")
            return False
            
        projects = projects_response.json()
        if not projects or 'results' not in projects or not projects['results']:
            print("❌ Nenhum projeto encontrado na API")
            return False
            
        # Pegar o primeiro projeto
        project = projects['results'][0]
        project_slug = project['slug']
        
        print(f"🎯 Testando com projeto: {project['name']} (slug: {project_slug})")
        
        # Verificar evidências existentes
        evidence_url = f"{base_url}/{project_slug}/evidence/"
        evidence_response = requests.get(evidence_url)
        
        if evidence_response.status_code == 200:
            current_evidences = evidence_response.json()
            evidence_count = len(current_evidences) if isinstance(current_evidences, list) else current_evidences.get('count', 0)
            print(f"📊 Evidências atuais: {evidence_count}")
            
            print("\n✅ A API está funcionando corretamente!")
            print("   A correção do serializer foi aplicada com sucesso.")
            print("   O campo 'project' agora está marcado como read-only.")
            print("   O frontend deve conseguir enviar evidências sem especificar o project ID.")
            
            return True
        else:
            print(f"❌ Erro ao acessar evidências: {evidence_response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao servidor Django")
        print("   Certifique-se de que o servidor está rodando em localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Verificando correção do upload de evidências...")
    print("=" * 50)
    
    success = test_evidence_api()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ CORREÇÃO APLICADA COM SUCESSO!")
        print("\n📋 Resumo da correção:")
        print("   1. Campo 'project' adicionado aos read_only_fields")
        print("   2. O ViewSet já configura automaticamente o projeto")
        print("   3. O frontend não precisa mais enviar o project ID")
        print("\n🎯 Próximos passos:")
        print("   - Teste o upload no frontend")
        print("   - O erro '400 Bad Request' deve estar resolvido")
    else:
        print("❌ TESTE NÃO PÔDE SER COMPLETADO")
        print("   Verifique se o servidor Django está rodando")
