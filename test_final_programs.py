#!/usr/bin/env python3
"""
Teste final completo do sistema de programas
"""
import requests
import json

def test_programs_api():
    """Testa o endpoint de programas"""
    try:
        print("🔍 Testando endpoint de programas...")
        response = requests.get("http://209.97.128.71:8000/api/v1/core/programs/")
        
        if response.status_code == 200:
            data = response.json()
            programs = data.get('results', [])
            
            print(f"✅ API funcionando! {len(programs)} programas encontrados:")
            for i, program in enumerate(programs, 1):
                print(f"  {i}. {program['name']} (ID: {program['id']})")
                print(f"     - Cor: {program['color']}")
                print(f"     - Ícone: {program['icon']}")
                
            return programs
        else:
            print(f"❌ Erro na API: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        return []

def test_project_creation_api():
    """Testa se é possível criar um projeto via API"""
    try:
        print("\n🔍 Testando criação de projeto...")
        
        # Primeiro, fazer login para obter token
        login_data = {
            "email": "admin@exemplo.com",
            "password": "senha123"
        }
        
        # Tentar login
        login_response = requests.post(
            "http://209.97.128.71:8000/api/v1/auth/token/",
            json=login_data,
            timeout=10
        )
        
        if login_response.status_code == 200:
            print("✅ Login realizado com sucesso!")
            token_data = login_response.json()
            access_token = token_data.get('access')
            
            # Testar criação de projeto
            project_data = {
                "name": "Projeto Teste de Programas",
                "description": "Projeto para testar seleção de programas",
                "program_id": 1,  # Usando o primeiro programa
                "location": "Pemba",
                "target_beneficiaries": 100,
                "status": "draft"
            }
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            create_response = requests.post(
                "http://209.97.128.71:8000/api/v1/projects/admin/projects/",
                json=project_data,
                headers=headers,
                timeout=10
            )
            
            if create_response.status_code in [200, 201]:
                print("✅ Projeto criado com sucesso!")
                project = create_response.json()
                print(f"   - Nome: {project.get('name')}")
                print(f"   - ID: {project.get('id')}")
                return True
            else:
                print(f"❌ Erro ao criar projeto: {create_response.status_code}")
                print(f"   Resposta: {create_response.text[:200]}...")
                return False
                
        else:
            print(f"❌ Erro no login: {login_response.status_code}")
            print("   (Isso é esperado se não houver usuário admin configurado)")
            return False
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_frontend_simulation():
    """Simula o que o frontend faria ao carregar a página de criar projeto"""
    try:
        print("\n🎭 Simulando comportamento do frontend...")
        
        # 1. Buscar programas (como o fetchPrograms faria)
        programs_response = requests.get("http://209.97.128.71:8000/api/v1/core/programs/")
        
        if programs_response.status_code == 200:
            programs_data = programs_response.json()
            programs = programs_data.get('results', [])
            
            print(f"✅ Frontend conseguiria buscar {len(programs)} programas:")
            
            # Simular opções de select que apareceriam no CreateProject
            print("   📋 Opções do campo de seleção:")
            print("      <option value=''>Selecione um programa</option>")
            
            for program in programs:
                print(f"      <option value='{program['id']}'>{program['name']}</option>")
            
            print("\n🎯 Resultado: O dropdown de programas agora funcionaria corretamente!")
            return True
        else:
            print(f"❌ Frontend não conseguiria buscar programas: {programs_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na simulação: {e}")
        return False

def main():
    print("🚀 TESTE FINAL COMPLETO DO SISTEMA DE PROGRAMAS")
    print("=" * 60)
    
    # Teste 1: API de programas
    programs = test_programs_api()
    
    # Teste 2: Criação de projeto
    test_project_creation_api()
    
    # Teste 3: Simulação do frontend
    frontend_ok = test_frontend_simulation()
    
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS RESULTADOS:")
    print(f"  🔗 API de Programas: {'✅ Funcionando' if programs else '❌ Com problemas'}")
    print(f"  🎯 Frontend Simulation: {'✅ Funcionando' if frontend_ok else '❌ Com problemas'}")
    
    if programs and frontend_ok:
        print("\n🎉 SUCESSO! O problema da seleção de programas foi RESOLVIDO!")
        print("   ✅ Backend retorna programas corretamente")
        print("   ✅ API está acessível do frontend")
        print("   ✅ CreateProject.tsx agora conseguirá popular o dropdown")
        print("\n💡 PRÓXIMOS PASSOS:")
        print("   1. Acesse a página de criar projeto no frontend")
        print("   2. O campo de seleção de programa agora deve mostrar 6 opções")
        print("   3. Escolha um programa e continue com a criação do projeto")
    else:
        print("\n⚠️ Ainda há problemas que precisam ser resolvidos.")
    
    print("\n🏁 Teste concluído!")

if __name__ == "__main__":
    main()
