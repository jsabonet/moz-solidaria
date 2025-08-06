"""
Script para criar e popular as categorias de projetos
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Program, ProjectCategory, Project
from django.db import transaction


def create_project_categories():
    """Cria categorias iniciais para os projetos"""
    
    categories_data = [
        # Educação
        {
            'program_slug': 'educacao',
            'categories': [
                {
                    'name': 'Construção de Escolas',
                    'description': 'Projetos focados na construção e reforma de infraestrutura educacional',
                    'color': 'blue',
                    'icon': 'Building',
                    'order': 1
                },
                {
                    'name': 'Formação de Professores',
                    'description': 'Capacitação e treinamento de educadores locais',
                    'color': 'green',
                    'icon': 'GraduationCap',
                    'order': 2
                },
                {
                    'name': 'Material Escolar',
                    'description': 'Distribuição de livros, cadernos e material didático',
                    'color': 'yellow',
                    'icon': 'BookOpen',
                    'order': 3
                },
                {
                    'name': 'Bolsas de Estudo',
                    'description': 'Programas de apoio financeiro para estudantes',
                    'color': 'purple',
                    'icon': 'Heart',
                    'order': 4
                }
            ]
        },
        # Apoio Humanitário
        {
            'program_slug': 'apoio-humanitario',
            'categories': [
                {
                    'name': 'Distribuição de Alimentos',
                    'description': 'Projetos de segurança alimentar e nutrição',
                    'color': 'red',
                    'icon': 'Heart',
                    'order': 1
                },
                {
                    'name': 'Abrigos Temporários',
                    'description': 'Construção e manutenção de abrigos para deslocados',
                    'color': 'orange',
                    'icon': 'Home',
                    'order': 2
                },
                {
                    'name': 'Vestuário e Cobertores',
                    'description': 'Distribuição de roupas e itens de proteção',
                    'color': 'blue',
                    'icon': 'Shield',
                    'order': 3
                },
                {
                    'name': 'Apoio Psicossocial',
                    'description': 'Sessões de apoio psicológico e empoderamento',
                    'color': 'pink',
                    'icon': 'Users',
                    'order': 4
                }
            ]
        },
        # Saúde Pública
        {
            'program_slug': 'saude-publica',
            'categories': [
                {
                    'name': 'Campanhas de Vacinação',
                    'description': 'Projetos de prevenção e vacinação comunitária',
                    'color': 'purple',
                    'icon': 'Stethoscope',
                    'order': 1
                },
                {
                    'name': 'Construção de Postos',
                    'description': 'Infraestrutura de saúde básica',
                    'color': 'blue',
                    'icon': 'Building',
                    'order': 2
                },
                {
                    'name': 'Formação de Agentes',
                    'description': 'Capacitação de agentes comunitários de saúde',
                    'color': 'green',
                    'icon': 'Users',
                    'order': 3
                },
                {
                    'name': 'Medicamentos',
                    'description': 'Distribuição de medicamentos básicos',
                    'color': 'red',
                    'icon': 'Heart',
                    'order': 4
                }
            ]
        },
        # Infraestrutura
        {
            'program_slug': 'infraestrutura',
            'categories': [
                {
                    'name': 'Construção de Poços',
                    'description': 'Perfuração e construção de poços artesianos',
                    'color': 'blue',
                    'icon': 'Globe',
                    'order': 1
                },
                {
                    'name': 'Estradas e Pontes',
                    'description': 'Melhoria de vias de acesso e transporte',
                    'color': 'gray',
                    'icon': 'Building',
                    'order': 2
                },
                {
                    'name': 'Energia Solar',
                    'description': 'Instalação de sistemas de energia renovável',
                    'color': 'yellow',
                    'icon': 'Lightbulb',
                    'order': 3
                },
                {
                    'name': 'Saneamento',
                    'description': 'Projetos de saneamento básico e higiene',
                    'color': 'green',
                    'icon': 'Leaf',
                    'order': 4
                }
            ]
        },
        # Formação Juvenil
        {
            'program_slug': 'formacao-juvenil',
            'categories': [
                {
                    'name': 'Capacitação Profissional',
                    'description': 'Cursos técnicos e profissionalizantes',
                    'color': 'green',
                    'icon': 'Hammer',
                    'order': 1
                },
                {
                    'name': 'Empreendedorismo',
                    'description': 'Apoio ao desenvolvimento de negócios locais',
                    'color': 'purple',
                    'icon': 'Lightbulb',
                    'order': 2
                },
                {
                    'name': 'Esportes e Lazer',
                    'description': 'Atividades esportivas e recreativas',
                    'color': 'orange',
                    'icon': 'Users',
                    'order': 3
                },
                {
                    'name': 'Alfabetização de Adultos',
                    'description': 'Programas de alfabetização para jovens e adultos',
                    'color': 'blue',
                    'icon': 'BookOpen',
                    'order': 4
                }
            ]
        }
    ]

    with transaction.atomic():
        for program_data in categories_data:
            try:
                program = Program.objects.get(slug=program_data['program_slug'])
                print(f"Criando categorias para o programa: {program.name}")
                
                for cat_data in program_data['categories']:
                    category, created = ProjectCategory.objects.get_or_create(
                        program=program,
                        name=cat_data['name'],
                        defaults={
                            'description': cat_data['description'],
                            'color': cat_data['color'],
                            'icon': cat_data['icon'],
                            'order': cat_data['order'],
                            'is_active': True
                        }
                    )
                    
                    if created:
                        print(f"  ✓ Criada categoria: {category.name}")
                    else:
                        print(f"  - Categoria já existe: {category.name}")
                        
            except Program.DoesNotExist:
                print(f"❌ Programa não encontrado: {program_data['program_slug']}")
                continue


def update_existing_projects():
    """Atualiza projetos existentes com categorias apropriadas"""
    
    # Mapeamento de projetos para categorias (baseado nos nomes)
    project_category_mapping = {
        'escola': 'Construção de Escolas',
        'formação': 'Formação de Professores',
        'educação': 'Formação de Professores',
        'cestas': 'Distribuição de Alimentos',
        'alimentar': 'Distribuição de Alimentos',
        'vacinação': 'Campanhas de Vacinação',
        'saúde': 'Campanhas de Vacinação',
        'poço': 'Construção de Poços',
        'água': 'Construção de Poços',
        'marcenaria': 'Capacitação Profissional',
        'formação profissional': 'Capacitação Profissional',
        'psicológico': 'Apoio Psicossocial',
        'mulheres': 'Apoio Psicossocial',
    }
    
    projects = Project.objects.all()
    
    for project in projects:
        if project.category:
            continue  # Já tem categoria
            
        project_name_lower = project.name.lower()
        assigned_category = None
        
        for keyword, category_name in project_category_mapping.items():
            if keyword in project_name_lower:
                try:
                    category = ProjectCategory.objects.filter(
                        program=project.program,
                        name=category_name
                    ).first()
                    
                    if category:
                        project.category = category
                        project.save()
                        assigned_category = category_name
                        print(f"✓ Projeto '{project.name}' → Categoria '{category_name}'")
                        break
                        
                except Exception as e:
                    print(f"❌ Erro ao atribuir categoria para '{project.name}': {e}")
                    continue
        
        if not assigned_category:
            print(f"⚠️ Projeto '{project.name}' não teve categoria atribuída automaticamente")


def main():
    print("=== Criando Sistema de Categorias de Projetos ===\n")
    
    print("1. Criando categorias para cada programa...")
    create_project_categories()
    
    print("\n2. Atualizando projetos existentes...")
    update_existing_projects()
    
    print("\n=== Processo concluído! ===")
    
    # Estatísticas finais
    total_categories = ProjectCategory.objects.count()
    active_categories = ProjectCategory.objects.filter(is_active=True).count()
    projects_with_categories = Project.objects.exclude(category=None).count()
    total_projects = Project.objects.count()
    
    print(f"\n📊 Estatísticas:")
    print(f"   • Total de categorias: {total_categories}")
    print(f"   • Categorias ativas: {active_categories}")
    print(f"   • Projetos com categoria: {projects_with_categories}/{total_projects}")


if __name__ == '__main__':
    main()
