#!/usr/bin/env python3
"""
Script para converter todos os handlers complexos para o padrão simples do CreatePost
"""

import re

def simplify_onChange_handlers():
    file_path = "src/pages/CreateProject.tsx"
    
    # Ler o arquivo
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Mapeamento de handlers para campos simples
    replacements = [
        # Description fields
        (r'onChange={handleDescriptionChange}', 'onChange={(e) => setFormData({ ...formData, description: e.target.value })}'),
        (r'onChange={handleContentChange}', 'onChange={(e) => setFormData({ ...formData, content: e.target.value })}'),
        (r'onChange={handleMetaKeywordsChange}', 'onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}'),
        (r'onChange={handleLocationChange}', 'onChange={(e) => setFormData({ ...formData, location: e.target.value })}'),
        (r'onChange={handleDistrictChange}', 'onChange={(e) => setFormData({ ...formData, district: e.target.value })}'),
        (r'onChange={handleTargetBeneficiariesChange}', 'onChange={(e) => setFormData({ ...formData, target_beneficiaries: parseInt(e.target.value) || 0 })}'),
        (r'onChange={handleBudgetChange}', 'onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}'),
        (r'onChange={handleMetaDescriptionChange}', 'onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}'),
    ]
    
    # Aplicar todas as substituições
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
        print(f"Substituído: {pattern.split('{')[1].split('}')[0]} -> padrão simples")
    
    # Escrever o arquivo de volta
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Todas as substituições concluídas!")

if __name__ == "__main__":
    simplify_onChange_handlers()
