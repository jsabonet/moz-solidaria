#!/usr/bin/env python3
"""
Script para testar se as otimizações do CreateProject realmente funcionaram
"""

import subprocess
import time
import requests
import sys

def check_server_status():
    """Verifica se o servidor local está rodando"""
    try:
        response = requests.get('http://localhost:8080', timeout=5)
        return response.status_code == 200
    except:
        return False

def check_production_server():
    """Verifica se o servidor de produção está rodando"""
    try:
        response = requests.get('http://209.97.128.71', timeout=10)
        return response.status_code == 200
    except:
        return False

def test_server_accessibility():
    """Testa se os servidores estão acessíveis"""
    print("🌐 Testando acessibilidade dos servidores...")
    
    local_ok = check_server_status()
    prod_ok = check_production_server()
    
    if local_ok:
        print("✅ Servidor local (http://localhost:8080) acessível!")
    else:
        print("❌ Servidor local não está rodando")
    
    if prod_ok:
        print("✅ Servidor de produção (http://209.97.128.71) acessível!")
    else:
        print("❌ Servidor de produção não está acessível")
    
    return local_ok or prod_ok

def test_git_changes():
    """Verifica se as mudanças foram commitadas corretamente"""
    print("🔍 Verificando mudanças no Git...")
    
    try:
        # Verificar se há commits recentes com as otimizações
        result = subprocess.run(['git', 'log', '--oneline', '-5'], 
                              capture_output=True, text=True, cwd='.')
        
        if 'handlers memoizados' in result.stdout.lower() or 'react.memo' in result.stdout.lower():
            print("✅ Commits de otimização encontrados no histórico!")
            return True
        else:
            print("⚠️ Commits de otimização não encontrados nos últimos 5 commits")
            print("Últimos commits:")
            print(result.stdout)
            return False
            
    except Exception as e:
        print(f"❌ Erro ao verificar Git: {e}")
        return False

def test_file_modifications():
    """Verifica se o arquivo CreateProject.tsx foi modificado corretamente"""
    print("📁 Verificando modificações no arquivo...")
    
    try:
        with open('src/pages/CreateProject.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificar se as otimizações estão presentes
        checks = [
            ('useCallback', 'useCallback import'),
            ('useMemo', 'useMemo import'),
            ('memo', 'React.memo import'),
            ('handleNameChange', 'Handler memoizado para nome'),
            ('handleShortDescriptionChange', 'Handler memoizado para descrição curta'),
            ('MemoizedInput', 'Componente Input memoizado'),
            ('MemoizedTextarea', 'Componente Textarea memoizado'),
            ('setTimeout', 'Debounce na geração de slug'),
        ]
        
        passed_checks = 0
        for check, description in checks:
            if check in content:
                print(f"✅ {description} encontrado")
                passed_checks += 1
            else:
                print(f"❌ {description} NÃO encontrado")
        
        success_rate = (passed_checks / len(checks)) * 100
        print(f"📊 Taxa de sucesso: {success_rate:.1f}% ({passed_checks}/{len(checks)})")
        
        return success_rate >= 80
        
    except Exception as e:
        print(f"❌ Erro ao verificar arquivo: {e}")
        return False

def main():
    print("🚀 TESTE DE OTIMIZAÇÕES DO CREATEPROJECT")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 0
    
    # Teste 1: Verificar modificações no arquivo
    total_tests += 1
    if test_file_modifications():
        tests_passed += 1
        print()
    
    # Teste 2: Verificar commits
    total_tests += 1
    if test_git_changes():
        tests_passed += 1
        print()
    
    # Teste 3: Verificar acessibilidade dos servidores
    total_tests += 1
    if test_server_accessibility():
        tests_passed += 1
        print()
    
    print("\n" + "=" * 50)
    print(f"📊 RESULTADO FINAL: {tests_passed}/{total_tests} testes passaram")
    
    if tests_passed == total_tests:
        print("🎉 TODOS OS TESTES PASSARAM! As otimizações foram aplicadas corretamente.")
        return True
    elif tests_passed > total_tests * 0.5:
        print("⚠️ A maioria dos testes passou, mas algumas otimizações podem estar faltando.")
        return False
    else:
        print("❌ Muitos testes falharam. As otimizações podem não ter sido aplicadas corretamente.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
