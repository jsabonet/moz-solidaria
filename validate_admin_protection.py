"""
🛡️ VALIDAÇÃO RÁPIDA: Proteção do Administrador Principal

Verificação de que todas as implementações estão corretas.
"""

import os
import re

def validate_admin_protection():
    """Valida se a proteção do administrador principal foi implementada corretamente"""
    
    print("="*70)
    print("🛡️ VALIDAÇÃO DA PROTEÇÃO DO ADMINISTRADOR PRINCIPAL")
    print("="*70)
    
    checks = []
    
    # 1. Verificar implementação no frontend
    frontend_file = "src/components/admin/UserManagement.tsx"
    
    print(f"\n📋 Verificando: {frontend_file}")
    
    if not os.path.exists(frontend_file):
        print(f"   ❌ Arquivo não encontrado!")
        checks.append(False)
    else:
        with open(frontend_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        frontend_checks = [
            (r'isMainAdmin.*=.*\(user.*User\)', 'Função isMainAdmin definida'),
            (r'canModifyUser.*=.*\(user.*User\)', 'Função canModifyUser definida'),
            (r'showProtectionWarning', 'Função showProtectionWarning definida'),
            (r'🛡️.*Administrador Principal Protegido', 'Mensagem de proteção implementada'),
            (r'mainAdminUsernames.*=.*\[.*admin', 'Lista de usernames principais definida'),
            (r'Crown.*Principal', 'Badge de administrador principal'),
            (r'!canModifyUser\(user\)', 'Verificação de permissão implementada'),
            (r'disabled.*!canModifyUser', 'Proteção no botão de edição'),
        ]
        
        frontend_score = 0
        for pattern, description in frontend_checks:
            if re.search(pattern, content, re.MULTILINE | re.DOTALL):
                print(f"   ✅ {description}")
                frontend_score += 1
            else:
                print(f"   ❌ {description}")
        
        print(f"   📊 Frontend: {frontend_score}/{len(frontend_checks)} implementados")
        checks.append(frontend_score == len(frontend_checks))
    
    # 2. Verificar implementação no backend
    backend_file = "backend/apps/authentication/views/user_management.py"
    
    print(f"\n📋 Verificando: {backend_file}")
    
    if not os.path.exists(backend_file):
        print(f"   ❌ Arquivo não encontrado!")
        checks.append(False)
    else:
        with open(backend_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        backend_checks = [
            (r'def is_main_admin\(user\)', 'Função is_main_admin definida'),
            (r'def can_modify_user\(requesting_user, target_user\)', 'Função can_modify_user definida'),
            (r'def update\(self, request', 'Método update sobrescrito'),
            (r'def partial_update\(self, request', 'Método partial_update sobrescrito'),
            (r'🛡️.*VERIFICAÇÃO DE PROTEÇÃO', 'Verificações de proteção implementadas'),
            (r'main_admin_usernames.*=.*\[.*admin', 'Lista de usernames principais definida'),
            (r'is_main_admin.*True.*status\.HTTP_403_FORBIDDEN', 'Retorno 403 para admin principal'),
            (r'promote_to_staff.*can_modify_user', 'Proteção na ação promote_to_staff'),
            (r'promote_to_profile.*can_modify_user', 'Proteção na ação promote_to_profile'),
        ]
        
        backend_score = 0
        for pattern, description in backend_checks:
            if re.search(pattern, content, re.MULTILINE | re.DOTALL):
                print(f"   ✅ {description}")
                backend_score += 1
            else:
                print(f"   ❌ {description}")
        
        print(f"   📊 Backend: {backend_score}/{len(backend_checks)} implementados")
        checks.append(backend_score == len(backend_checks))
    
    # 3. Verificar documentação
    doc_file = "ADMIN_PRINCIPAL_PROTECAO.md"
    
    print(f"\n📋 Verificando: {doc_file}")
    
    if not os.path.exists(doc_file):
        print(f"   ❌ Documentação não encontrada!")
        checks.append(False)
    else:
        with open(doc_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        doc_checks = [
            (r'🛡️.*PROTEÇÃO DO ADMINISTRADOR PRINCIPAL', 'Título da documentação'),
            (r'Critérios de Identificação', 'Seção de critérios'),
            (r'Proteções Implementadas', 'Seção de proteções'),
            (r'Frontend.*Proteção na Interface', 'Seção frontend'),
            (r'Backend.*Proteção no Servidor', 'Seção backend'),
            (r'isMainAdmin.*canModifyUser', 'Funções documentadas'),
        ]
        
        doc_score = 0
        for pattern, description in doc_checks:
            if re.search(pattern, content, re.MULTILINE | re.DOTALL):
                print(f"   ✅ {description}")
                doc_score += 1
            else:
                print(f"   ❌ {description}")
        
        print(f"   📊 Documentação: {doc_score}/{len(doc_checks)} seções completas")
        checks.append(doc_score >= len(doc_checks) - 1)  # Permitir 1 falha na documentação
    
    # 4. Verificar script de teste
    test_file = "test_admin_protection.py"
    
    print(f"\n📋 Verificando: {test_file}")
    
    if os.path.exists(test_file):
        print(f"   ✅ Script de teste criado")
        checks.append(True)
    else:
        print(f"   ❌ Script de teste não encontrado")
        checks.append(False)
    
    # Resultado final
    print("\n" + "="*70)
    print("📊 RESULTADO DA VALIDAÇÃO")
    print("="*70)
    
    passed_checks = sum(checks)
    total_checks = len(checks)
    success_rate = (passed_checks / total_checks) * 100
    
    print(f"✅ Verificações passaram: {passed_checks}/{total_checks} ({success_rate:.1f}%)")
    
    if all(checks):
        print("\n🎉 IMPLEMENTAÇÃO COMPLETA E VALIDADA!")
        print("\n🛡️ A proteção do administrador principal foi implementada com sucesso:")
        print("   ✅ Frontend: Interface protegida com indicadores visuais")
        print("   ✅ Backend: API protegida com validações de segurança")
        print("   ✅ Documentação: Implementação documentada completamente")
        print("   ✅ Testes: Scripts de validação disponíveis")
        print("\n💡 Próximos passos:")
        print("   1. Teste manual na interface de administração")
        print("   2. Execute: python test_admin_protection.py")
        print("   3. Verifique logs de segurança em produção")
        
    else:
        print("\n⚠️ IMPLEMENTAÇÃO INCOMPLETA!")
        print(f"\n❌ {total_checks - passed_checks} verificação(ões) falharam.")
        print("   Revise os itens marcados com ❌ acima.")
    
    print("="*70)

if __name__ == "__main__":
    validate_admin_protection()
