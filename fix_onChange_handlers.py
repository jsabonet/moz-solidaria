#!/usr/bin/env python3
"""
Script para substituir todos os onChange handlers inline por handlers memoizados
"""

import re

# Mapeamento de campos para seus handlers memoizados
field_mappings = {
    'description': 'handleDescriptionChange',
    'content': 'handleContentChange',
    'meta_keywords': 'handleMetaKeywordsChange',
    'location': 'handleLocationChange',
    'district': 'handleDistrictChange',
    'target_beneficiaries': 'handleTargetBeneficiariesChange',
    'budget': 'handleBudgetChange',
    'meta_description': 'handleMetaDescriptionChange'
}

def fix_onchange_handlers():
    file_path = "src/pages/CreateProject.tsx"
    
    # Ler o arquivo
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Substituir cada campo
    for field, handler in field_mappings.items():
        # Padrão para onChange inline com updateField
        pattern = rf"onChange=\{{\(e\) => updateField\('{field}', (.*?)\)\}}"
        replacement = f"onChange={{{handler}}}"
        
        content = re.sub(pattern, replacement, content)
        print(f"Substituído {field} -> {handler}")
    
    # Escrever o arquivo de volta
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Todas as substituições concluídas!")

if __name__ == "__main__":
    fix_onchange_handlers()
