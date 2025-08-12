#!/usr/bin/env python3
"""
Test para demonstrar quebra de títulos longos nos PDFs
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from reports.export_views import ExportViewSet

def test_title_breaking():
    """Testar quebra de títulos longos"""
    
    print("🔧 TESTING TITLE BREAKING FUNCTIONALITY")
    print("=" * 60)
    
    # Criar instância do ExportViewSet
    export_view = ExportViewSet()
    
    # Títulos de teste - alguns muito longos
    test_titles = [
        "donations_report_2024",
        "volunteers_comprehensive_analysis_detailed_report",
        "projects_strategic_portfolio_extensive_analysis_2024",
        "beneficiaries_impact_assessment_community_outreach_program_results",
        "super_long_filename_that_would_normally_break_the_pdf_layout_completely"
    ]
    
    print("📋 TESTING TITLE FORMATTING:")
    print("-" * 40)
    
    for i, filename in enumerate(test_titles, 1):
        print(f"\n{i}. Original: {filename}")
        
        # Testar formatação do título
        formatted_title = export_view._format_title(filename)
        print(f"   Formatted: {formatted_title}")
        
        # Mostrar se houve quebra
        if "<br/>" in formatted_title:
            lines = formatted_title.split("<br/>")
            print(f"   📏 Quebrado em {len(lines)} linhas:")
            for j, line in enumerate(lines, 1):
                print(f"      Linha {j}: '{line}' ({len(line)} chars)")
        else:
            print(f"   📏 Linha única: '{formatted_title}' ({len(formatted_title)} chars)")
    
    print("\n" + "=" * 60)
    print("✅ TITLE BREAKING TEST COMPLETED")
    print("🎯 Títulos longos agora são quebrados inteligentemente!")

if __name__ == "__main__":
    test_title_breaking()
