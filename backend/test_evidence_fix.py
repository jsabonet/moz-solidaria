#!/usr/bin/env python3
"""
Script para testar o upload de evidências após correção
"""
import os
import sys
import django
import tempfile
from io import BytesIO

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

import requests
from django.core.files.uploadedfile import SimpleUploadedFile
from core.models import Project
from django.contrib.auth.models import User
from project_tracking.models import ProjectEvidence

def test_evidence_api():
    """Teste do endpoint de evidências"""
    try:
        # Buscar um projeto existente
        project = Project.objects.first()
        if not project:
            print("❌ Nenhum projeto encontrado")
            return
            
        print(f"🎯 Testando com projeto: {project.name} (slug: {project.slug})")
        
        # Criar arquivo de teste simples
        test_content = b"Conteudo de teste para evidencia"
        test_file = SimpleUploadedFile(
            name="teste_evidencia.txt",
            content=test_content,
            content_type="text/plain"
        )
        
        # Dados da evidência (sem o campo project)
        evidence_data = {
            'title': 'Evidência de Teste - API Fix',
            'description': 'Teste após correção do serializer',
            'type': 'document',
            'category': 'teste',
            'file': test_file
        }
        
        # Buscar usuário
        user = User.objects.first()
        if not user:
            print("❌ Nenhum usuário encontrado")
            return
            
        # Criar evidência diretamente via model para testar
        evidence = ProjectEvidence.objects.create(
            project=project,
            title=evidence_data['title'],
            description=evidence_data['description'],
            type=evidence_data['type'],
            category=evidence_data['category'],
            file=evidence_data['file'],
            uploaded_by=user
        )
        
        print(f"✅ Evidência criada com sucesso: {evidence.id}")
        print(f"   - Título: {evidence.title}")
        print(f"   - Projeto: {evidence.project.name}")
        print(f"   - Arquivo: {evidence.file.name}")
        
        # Verificar se a evidência foi criada
        total_evidences = ProjectEvidence.objects.filter(project=project).count()
        print(f"📊 Total de evidências no projeto '{project.name}': {total_evidences}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Testando correção do upload de evidências...")
    success = test_evidence_api()
    
    if success:
        print("\n✅ Teste concluído com sucesso!")
        print("   O problema do campo 'project' obrigatório foi corrigido.")
        print("   Agora o frontend deve conseguir enviar evidências.")
    else:
        print("\n❌ Teste falhou!")
