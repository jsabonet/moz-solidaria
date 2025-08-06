#!/usr/bin/env python3
"""
Script para testar e debugar a deleção de evidências - versão corrigida
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from core.models import Project
from project_tracking.models import ProjectEvidence

def debug_evidence_deletion():
    """Debug e teste da deleção de evidências"""
    try:
        # Listar todas as evidências com seus IDs
        evidences = ProjectEvidence.objects.all().order_by('project__name', 'id')
        print(f"📁 Evidências no sistema: {evidences.count()}")
        
        if evidences.count() == 0:
            print("   Nenhuma evidência encontrada!")
            return True
        
        print("\n📋 Lista de evidências por projeto:")
        current_project = None
        for evidence in evidences:
            if current_project != evidence.project.name:
                current_project = evidence.project.name
                print(f"\n🏗️ Projeto: {current_project} (slug: {evidence.project.slug})")
            
            print(f"   ID: {evidence.id} | {evidence.title} | Tipo: {evidence.type}")
            print(f"      URL de deleção: /api/v1/tracking/projects/{evidence.project.slug}/evidence/{evidence.id}/")
        
        # Verificar se o ID 10 existe (que foi mencionado no erro)
        print(f"\n🔍 Verificando evidência ID 10...")
        try:
            evidence_10 = ProjectEvidence.objects.get(id=10)
            print(f"   ✅ Evidência ID 10 encontrada: {evidence_10.title}")
            print(f"   📍 Projeto: {evidence_10.project.name} (slug: {evidence_10.project.slug})")
        except ProjectEvidence.DoesNotExist:
            print("   ❌ Evidência ID 10 não existe no banco de dados")
            print("   📝 Isso explica o erro 404 que você está vendo")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no debug: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Debug da deleção de evidências...")
    print("=" * 50)
    
    success = debug_evidence_deletion()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Debug concluído!")
        print("\n🔧 Correções aplicadas:")
        print("   1. ✅ apiRequest agora lida com status 204 (No Content)")
        print("   2. ✅ Função de deleção trata erro 404 adequadamente")
        print("   3. ✅ Interface mostra mensagem adequada para cada situação")
        print("\n🎯 Próximos passos:")
        print("   - Teste novamente a deleção no frontend")
        print("   - O erro de JSON parsing deve estar resolvido")
        print("   - Para IDs inexistentes, verá mensagem de 'já foi excluída'")
    else:
        print("❌ Debug falhou!")
