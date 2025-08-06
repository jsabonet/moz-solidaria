#!/usr/bin/env python3
"""
Criar evidências de exemplo para testar upload múltiplo
"""
import os
import sys
import django
from datetime import datetime

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from project_tracking.models import ProjectEvidence
from core.models import Project
from django.contrib.auth.models import User
from django.core.files.base import ContentFile

def create_multiple_evidence_samples():
    """Criar múltiplas evidências para simular upload múltiplo"""
    print("=== CRIANDO EVIDÊNCIAS MÚLTIPLAS DE EXEMPLO ===")
    
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
        
        # Simular upload múltiplo de imagens
        image_batch = [
            {
                'title': 'Fotos da Construção - Arquivo 1',
                'description': 'Primeira série de fotos mostrando o início da construção da infraestrutura.',
                'type': 'image',
                'category': 'Fotos de Progresso',
                'content': 'Imagem simulada - Fase inicial da construção'
            },
            {
                'title': 'Fotos da Construção - Arquivo 2', 
                'description': 'Segunda série de fotos mostrando o progresso da construção.',
                'type': 'image',
                'category': 'Fotos de Progresso',
                'content': 'Imagem simulada - Progresso da construção'
            },
            {
                'title': 'Fotos da Construção - Arquivo 3',
                'description': 'Terceira série de fotos mostrando detalhes da construção.',
                'type': 'image',
                'category': 'Fotos de Progresso', 
                'content': 'Imagem simulada - Detalhes da construção'
            }
        ]
        
        # Simular upload múltiplo de documentos
        document_batch = [
            {
                'title': 'Relatórios de Progresso - Arquivo 1',
                'description': 'Relatório detalhado do primeiro mês de execução do projeto.',
                'type': 'document',
                'category': 'Relatórios Mensais',
                'content': 'PDF simulado - Relatório mês 1'
            },
            {
                'title': 'Relatórios de Progresso - Arquivo 2',
                'description': 'Relatório detalhado do segundo mês de execução do projeto.',
                'type': 'document', 
                'category': 'Relatórios Mensais',
                'content': 'PDF simulado - Relatório mês 2'
            }
        ]
        
        all_batches = [
            ('Imagens', image_batch),
            ('Documentos', document_batch)
        ]
        
        created_evidence = []
        
        for batch_name, batch_data in all_batches:
            print(f"\n📤 Processando lote: {batch_name}")
            
            for i, evidence_data in enumerate(batch_data):
                # Simular arquivo
                file_content = f"{evidence_data['content']}\n"
                file_content += f"Criado em: {datetime.now()}\n"
                file_content += f"Descrição: {evidence_data['description']}\n"
                file_content += "Este é um arquivo de exemplo para demonstrar upload múltiplo."
                
                # Criar arquivo fictício
                file_extension = '.jpg' if evidence_data['type'] == 'image' else '.pdf'
                file_name = f"batch_{batch_name.lower()}_{i+1}{file_extension}"
                fake_file = ContentFile(file_content.encode('utf-8'), name=file_name)
                
                evidence = ProjectEvidence.objects.create(
                    project=project,
                    title=evidence_data['title'],
                    description=evidence_data['description'],
                    type=evidence_data['type'],
                    category=evidence_data['category'],
                    file=fake_file,
                    uploaded_by=author,
                    tags=['upload_multiplo', 'demo', evidence_data['category'].lower()]
                )
                
                created_evidence.append(evidence)
                print(f"   ✅ {evidence.title} ({evidence.type})")
        
        print(f"\n📊 Estado depois:")
        final_count = project.tracking_evidence.count()
        print(f"   Evidências existentes: {final_count}")
        print(f"   Evidências criadas: {final_count - initial_count}")
        
        print(f"\n📋 Resumo por tipo:")
        type_counts = {}
        for evidence in created_evidence:
            type_display = evidence.get_type_display()
            type_counts[type_display] = type_counts.get(type_display, 0) + 1
        
        for type_name, count in type_counts.items():
            print(f"   • {type_name}: {count} arquivo(s)")
        
        print(f"\n✅ {len(created_evidence)} evidências de upload múltiplo criadas com sucesso!")
        
    except Project.DoesNotExist:
        print("❌ Projeto 'Joel' não encontrado!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_multiple_evidence_samples()
