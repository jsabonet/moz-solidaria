#!/usr/bin/env python3
"""
Criar evidências de exemplo para o projeto Joel
"""
import os
import sys
import django
from datetime import datetime, date, timedelta

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.models import ProjectEvidence
from core.models import Project
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile

def create_sample_evidence():
    """Criar evidências de exemplo"""
    print("=== CRIANDO EVIDÊNCIAS DE EXEMPLO ===")
    
    try:
        project = Project.objects.get(slug='Joel')
        
        # Obter ou criar usuário para o autor
        author, created = User.objects.get_or_create(
            username='admin_user',
            defaults={'email': 'admin@example.com'}
        )
        
        print(f"\n📊 Estado antes:")
        initial_count = project.tracking_evidence.count()
        print(f"   Evidências existentes: {initial_count}")
        
        # Lista de evidências de exemplo
        evidence_samples = [
            {
                'title': 'Relatório de Progresso - Julho 2025',
                'description': 'Relatório detalhado do progresso do projeto durante o mês de julho, incluindo conquistas e desafios.',
                'type': 'report',
                'category': 'Relatórios Mensais',
            },
            {
                'title': 'Contrato de Fornecimento de Materiais',
                'description': 'Documento oficial do contrato firmado com fornecedores locais para aquisição de materiais de construção.',
                'type': 'document',
                'category': 'Contratos',
            },
            {
                'title': 'Fotos da Construção - Fase 1',
                'description': 'Registro fotográfico do início das obras de construção da infraestrutura básica.',
                'type': 'image',
                'category': 'Documentação Visual',
            },
            {
                'title': 'Vídeo de Treinamento da Comunidade',
                'description': 'Vídeo documentando o treinamento fornecido à comunidade local sobre manutenção da infraestrutura.',
                'type': 'video',
                'category': 'Treinamento',
            },
            {
                'title': 'Certificado de Conformidade Ambiental',
                'description': 'Certificado emitido pelas autoridades ambientais confirmando conformidade do projeto.',
                'type': 'certificate',
                'category': 'Certificações',
            },
            {
                'title': 'Lista de Beneficiários',
                'description': 'Documento oficial listando todas as famílias e indivíduos beneficiados pelo projeto.',
                'type': 'document',
                'category': 'Beneficiários',
            }
        ]
        
        created_evidence = []
        
        for i, evidence_data in enumerate(evidence_samples):
            # Simular arquivo (criar um arquivo de texto simples)
            file_content = f"Documento de exemplo: {evidence_data['title']}\n"
            file_content += f"Criado em: {datetime.now()}\n"
            file_content += f"Descrição: {evidence_data['description']}\n"
            file_content += "Este é um arquivo de exemplo para demonstrar a funcionalidade de evidências."
            
            # Criar arquivo fictício
            file_name = f"evidencia_{i+1}_{evidence_data['type']}.txt"
            fake_file = ContentFile(file_content.encode('utf-8'), name=file_name)
            
            evidence = ProjectEvidence.objects.create(
                project=project,
                title=evidence_data['title'],
                description=evidence_data['description'],
                type=evidence_data['type'],
                category=evidence_data['category'],
                file=fake_file,
                uploaded_by=author,
                tags=['exemplo', 'demo', evidence_data['category'].lower()]
            )
            
            created_evidence.append(evidence)
            print(f"✅ Evidência criada: {evidence.title} ({evidence.type})")
        
        print(f"\n📊 Estado depois:")
        final_count = project.tracking_evidence.count()
        print(f"   Evidências existentes: {final_count}")
        print(f"   Evidências criadas: {final_count - initial_count}")
        
        print(f"\n📋 Resumo das evidências criadas:")
        for evidence in created_evidence:
            print(f"   • {evidence.title}")
            print(f"     Tipo: {evidence.get_type_display()}")
            print(f"     Categoria: {evidence.category}")
            print(f"     Arquivo: {evidence.file.name}")
            print(f"     Tags: {evidence.tags}")
            print()
        
        print(f"\n✅ {len(created_evidence)} evidências de exemplo criadas com sucesso!")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_sample_evidence()
