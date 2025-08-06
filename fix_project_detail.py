#!/usr/bin/env python3
"""
Script para corrigir o arquivo ProjectDetail.tsx
"""

# Ler o arquivo original
with open(r'd:\Projectos\moz-solidaria-hub-main\src\pages\ProjectDetail.tsx.backup', 'r', encoding='utf-8') as f:
    content = f.read()

# Encontrar onde está o problema e corrigir
lines = content.split('\n')

# Remover linhas duplicadas ou problemáticas
corrected_lines = []
in_impact_section = False
impact_section_complete = False

for i, line in enumerate(lines):
    # Procurar pela seção de impacto e garantir que está bem formada
    if '/* Impacto */' in line or 'TabsContent value="impact"' in line:
        in_impact_section = True
        impact_section_complete = False
    
    # Se encontramos o final correto da seção de impacto
    if in_impact_section and '</TabsContent>' in line and not impact_section_complete:
        corrected_lines.append(line)
        corrected_lines.append('          </Tabs>')
        corrected_lines.append('        </div>')
        corrected_lines.append('      </section>')
        corrected_lines.append('')
        corrected_lines.append('      <Footer />')
        corrected_lines.append('    </div>')
        corrected_lines.append('  );')
        corrected_lines.append('};')
        corrected_lines.append('')
        corrected_lines.append('export default ProjectDetail;')
        impact_section_complete = True
        break
    
    corrected_lines.append(line)

# Salvar o arquivo corrigido
corrected_content = '\n'.join(corrected_lines)

with open(r'd:\Projectos\moz-solidaria-hub-main\src\pages\ProjectDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(corrected_content)

print("✅ Arquivo ProjectDetail.tsx corrigido com sucesso!")
