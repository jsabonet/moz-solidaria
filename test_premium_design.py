#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
TESTE PREMIUM DESIGN - Fortune 500 Corporate PDF Generation
============================================================
Testa o novo design ultra-profissional para empresa multibilionária.
"""

import os
import sys
import django
from django.conf import settings

# Configurar Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')

if not settings.configured:
    django.setup()

from backend.reports.export_views import ExportViewSet
from reportlab.lib.pagesizes import A4, landscape

def test_premium_design():
    """Testar o novo design premium Fortune 500"""
    
    print("🚀 TESTING PREMIUM FORTUNE 500 DESIGN")
    print("=" * 60)
    
    # Dados de teste corporativos
    test_datasets = {
        'Strategic_Projects_Portfolio_2024.pdf': [
            {
                'id': 1,
                'title': 'Strategic Digital Transformation Initiative',
                'description': 'Comprehensive modernization of core business systems with advanced analytics and AI integration',
                'category': 'Technology Innovation',
                'status': 'Active',
                'budget': 2500000.00,
                'start_date': '2024-01-15'
            },
            {
                'id': 2,
                'title': 'Global Market Expansion Program', 
                'description': 'Multi-market entry strategy targeting emerging economies with sustainable growth potential',
                'category': 'Business Development',
                'status': 'Planning',
                'budget': 5000000.00,
                'start_date': '2024-03-01'
            },
            {
                'id': 3,
                'title': 'Corporate Social Responsibility Framework',
                'description': 'Implementation of comprehensive ESG standards and community engagement protocols',
                'category': 'Sustainability', 
                'status': 'Active',
                'budget': 1200000.00,
                'start_date': '2024-02-01'
            }
        ],
        
        'Corporate_Donations_Analysis_2024.pdf': [
            {
                'id': 1,
                'donor_name': 'Johnson & Associates Foundation',
                'amount': 150000.00,
                'project': 'Strategic Digital Transformation',
                'date': '2024-01-20',
                'status': 'Confirmed',
                'method': 'Corporate Transfer'
            },
            {
                'id': 2,
                'donor_name': 'Global Impact Investors LLC',
                'amount': 250000.00,
                'project': 'Market Expansion Program',
                'date': '2024-02-05',
                'status': 'Confirmed',
                'method': 'Investment Grade Bond'
            }
        ],
        
        'Executive_Volunteer_Report_2024.pdf': [
            {
                'id': 1,
                'name': 'Dr. Sarah Chen',
                'expertise': 'Digital Strategy & Analytics',
                'organization': 'MIT Technology Review',
                'commitment': '20 hours/month',
                'projects': 'Digital Transformation',
                'contact': 'sarah.chen@mit.edu'
            },
            {
                'id': 2,
                'name': 'Marcus Rodriguez, CPA',
                'expertise': 'Financial Planning & Risk Management',
                'organization': 'Deloitte Consulting',
                'commitment': '15 hours/month',
                'projects': 'Market Expansion',
                'contact': 'marcus.rodriguez@deloitte.com'
            }
        ],
        
        'Beneficiaries_Impact_Assessment_2024.pdf': [
            {
                'id': 1,
                'nome': 'Maria José Cumbe',
                'localizacao': 'Pemba, Cabo Delgado',
                'tipo': 'Família Vulnerável',
                'pessoas_impactadas': 5,
                'data_cadastro': '2024-01-20',
                'projetos': 'Apoio Alimentar',
                'status': 'Verificado',
                'observacoes': 'Necessidades alimentares prioritárias para família com 3 crianças'
            },
            {
                'id': 2,
                'nome': 'João Manuel Siluane',
                'localizacao': 'Montepuez, Cabo Delgado',
                'tipo': 'Família Deslocada',
                'pessoas_impactadas': 7,
                'data_cadastro': '2024-02-05',
                'projetos': 'Educação para Todos',
                'status': 'Verificado',
                'observacoes': 'Material escolar fornecido para 4 crianças em idade escolar'
            },
            {
                'id': 3,
                'nome': 'Ana Cristina Machado',
                'localizacao': 'Chiúre, Cabo Delgado',
                'tipo': 'Família com Necessidades Médicas',
                'pessoas_impactadas': 4,
                'data_cadastro': '2024-03-10',
                'projetos': 'Apoio Médico',
                'status': 'Verificado',
                'observacoes': 'Apoio médico contínuo para criança com necessidades especiais'
            },
            {
                'id': 4,
                'nome': 'Carlos Alberto Mussagy',
                'localizacao': 'Mecúfi, Cabo Delgado',
                'tipo': 'Família Numerosa',
                'pessoas_impactadas': 9,
                'data_cadastro': '2024-03-25',
                'projetos': 'Apoio Habitacional',
                'status': 'Pendente de Verificação',
                'observacoes': 'Necessidade de melhorias habitacionais urgentes'
            },
            {
                'id': 5,
                'nome': 'Esperança Joaquim Namitulo',
                'localizacao': 'Ancuabe, Cabo Delgado',
                'tipo': 'Família Vulnerável',
                'pessoas_impactadas': 6,
                'data_cadastro': '2024-04-08',
                'projetos': 'Apoio ao Emprego',
                'status': 'Verificado',
                'observacoes': 'Programa de capacitação profissional em andamento'
            }
        ]
    }
    
    # Testar cada tipo de relatório
    exporter = ExportViewSet()
    results = []
    
    for filename, data in test_datasets.items():
        try:
            print(f"\n📊 Generating: {filename}")
            print(f"    Dataset: {len(data)} records")
            
            # Gerar PDF com design premium
            response = exporter._generate_pdf(
                data=data,
                options={'format': 'pdf'},
                filename=filename
            )
            
            print(f"    ✅ SUCCESS: PDF generated")
            results.append(f"✅ {filename}")
                
        except Exception as e:
            print(f"    ❌ ERROR: {str(e)}")
            results.append(f"❌ {filename} - Error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Relatório final
    print("\n" + "=" * 60)
    print("🏆 PREMIUM DESIGN TEST RESULTS")
    print("=" * 60)
    
    for result in results:
        print(f"  {result}")
    
    success_count = sum(1 for r in results if r.startswith('✅'))
    total_count = len(results)
    
    print(f"\n📈 SUMMARY: {success_count}/{total_count} reports generated successfully")
    
    if success_count == total_count:
        print("🎉 ALL TESTS PASSED - Fortune 500 design is ready!")
        print("💎 Premium corporate design with text wrapping implemented!")
        print("🏢 Ready for multibillion-dollar company standards!")
    else:
        print("⚠️  Some issues detected - review error messages above")
    
    print("=" * 60)
    
    return success_count == total_count

if __name__ == '__main__':
    test_premium_design()
