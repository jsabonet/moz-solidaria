#!/usr/bin/env python3
"""
Script para testar e debugar a deleção de evidências
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
from django.contrib.auth.models import User

def debug_evidence_deletion():
    """Debug e teste da deleção de evidências"""
    try:
        # Listar todos os projetos
        projects = Project.objects.all()
        print(f"📋 Projetos disponíveis: {projects.count()}")
        for project in projects:
            print(f"  - {project.name} (slug: {project.slug})")
        
        print("\n" + "="*50)
        
        # Listar todas as evidências
        evidences = ProjectEvidence.objects.all().order_by('project__name', 'id')
        print(f"📁 Evidências no sistema: {evidences.count()}")
        
        if evidences.count() == 0:
            print("   Nenhuma evidência encontrada!")
            return
        
        print("\n📋 Lista de evidências:")
        current_project = None
        for evidence in evidences:
            if current_project != evidence.project.name:
                current_project = evidence.project.name
                print(f"\n🏗️ Projeto: {current_project}")
            
            print(f"   ID: {evidence.id} | {evidence.title} | Tipo: {evidence.type} | Data: {evidence.upload_date.strftime('%d/%m/%Y')}")
        
        print("\n" + "="*50)
        
        # Verificar evidências órfãs ou com problemas
        print("🔍 Verificando integridade das evidências...")
        
        problem_evidences = []
        for evidence in evidences:
            try:
                # Verificar se o arquivo existe
                if evidence.file and not evidence.file.storage.exists(evidence.file.name):
                    problem_evidences.append((evidence.id, "Arquivo não encontrado"))
                
                # Verificar se o projeto ainda existe
                if not evidence.project:
                    problem_evidences.append((evidence.id, "Projeto não encontrado"))
                    
            except Exception as e:
                problem_evidences.append((evidence.id, f"Erro: {e}"))
        
        if problem_evidences:
            print("⚠️ Evidências com problemas encontradas:")
            for evidence_id, problem in problem_evidences:
                print(f"   ID {evidence_id}: {problem}")
        else:
            print("✅ Todas as evidências estão íntegras")
        
        print("\n" + "="*50)
        
        # Simular teste de deleção
        if evidences.count() > 0:
            test_evidence = evidences.first()
            print(f"🧪 Teste de deleção simulado:")
            print(f"   Evidência de teste: ID {test_evidence.id} - {test_evidence.title}")
            print(f"   Projeto: {test_evidence.project.name}")
            print(f"   URL esperada: /api/v1/tracking/projects/{test_evidence.project.slug}/evidence/{test_evidence.id}/")
            
            # Verificar se existe
            try:
                exists = ProjectEvidence.objects.filter(id=test_evidence.id).exists()
                print(f"   Existe no banco: {'✅ Sim' if exists else '❌ Não'}")
            except Exception as e:
                print(f"   Erro ao verificar: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no debug: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 Debug da deleção de evidências...")
    print("=" * 50)
    
    success = debug_evidence_deletion()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Debug concluído!")
        print("\n📋 Próximos passos:")
        print("   1. Verifique se as correções no frontend resolveram o erro JSON")
        print("   2. Teste a deleção no frontend com IDs válidos")
        print("   3. Se ainda houver erro 404, verifique se a evidência realmente existe")
    else:
        print("❌ Debug falhou!"))
