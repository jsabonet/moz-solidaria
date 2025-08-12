#!/usr/bin/env python3
"""
Test independente para demonstrar quebra de títulos longos
"""

def _break_long_title(title):
    """Quebrar títulos longos para evitar sobreposição no PDF"""
    # Limite conservador para títulos (considerando fonte grande)
    max_title_length = 45  # Caracteres por linha para títulos
    
    if len(title) <= max_title_length:
        return title
    
    # === QUEBRA INTELIGENTE POR PALAVRAS ===
    words = title.split()
    lines = []
    current_line = ""
    
    for word in words:
        # Testar se adicionar a palavra ultrapassaria o limite
        test_line = f"{current_line} {word}".strip()
        
        if len(test_line) <= max_title_length:
            current_line = test_line
        else:
            # Se a linha atual não está vazia, finalizá-la
            if current_line:
                lines.append(current_line)
                current_line = word
            else:
                # Palavra muito longa sozinha - forçar quebra
                if len(word) > max_title_length:
                    lines.append(word[:max_title_length-3] + "...")
                    current_line = ""
                else:
                    current_line = word
    
    # Adicionar última linha se houver
    if current_line:
        lines.append(current_line)
    
    # === LIMITAR A 2 LINHAS PARA TÍTULOS ===
    if len(lines) > 2:
        # Combinar últimas linhas se necessário
        first_line = lines[0]
        remaining_text = " ".join(lines[1:])
        
        # Se o restante ainda é muito longo, cortá-lo
        if len(remaining_text) > max_title_length:
            second_line = remaining_text[:max_title_length-3] + "..."
        else:
            second_line = remaining_text
        
        lines = [first_line, second_line]
    
    return "<br/>".join(lines)

def _format_title(filename):
    """Formatar título em português baseado no tipo de relatório com quebra inteligente"""
    area_names = {
        'projects': {
            'title': 'PORTFÓLIO DE PROJETOS SOCIAIS',
            'subtitle': 'Análise de Iniciativas de Impacto Social'
        },
        'donations': {
            'title': 'RELATÓRIO DE CONTRIBUIÇÕES FINANCEIRAS',
            'subtitle': 'Visão Geral dos Investimentos Filantrópicos'
        },
        'volunteers': {
            'title': 'RELATÓRIO DE VOLUNTÁRIOS',
            'subtitle': 'Análise de Gestão de Recursos Humanos Voluntários'
        },
        'beneficiaries': {
            'title': 'AVALIAÇÃO DE IMPACTO COMUNITÁRIO',
            'subtitle': 'Resultados e Demografia dos Beneficiários'
        }
    }
    
    # Identificar o tipo baseado no filename
    title = None
    for key, content in area_names.items():
        if key in filename.lower():
            title = content['title']
            break
    
    # Fallback para título genérico
    if not title:
        clean_filename = filename.replace('_', ' ').title()
        title = f"RELATÓRIO EXECUTIVO: {clean_filename.upper()}"
    
    # === QUEBRA INTELIGENTE DE TÍTULOS LONGOS ===
    return _break_long_title(title)

def test_title_breaking():
    """Testar quebra de títulos longos"""
    
    print("🔧 TESTING TITLE BREAKING FUNCTIONALITY")
    print("=" * 60)
    
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
        formatted_title = _format_title(filename)
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
