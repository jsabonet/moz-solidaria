#!/bin/bash

# Script completo para resolver o problema das habilidades de voluntários

echo "🔧 Resolvendo problema das habilidades de voluntários..."

echo "📋 DIAGNÓSTICO DO PROBLEMA:"
echo "No VolunteerDashboard, ao clicar em 'Gerenciar Habilidades',"
echo "nenhuma opção é carregada porque não existem habilidades no banco de dados."

echo ""
echo "🔍 CAUSA RAIZ:"
echo "A tabela 'volunteers_volunteerskill' está vazia."
echo "O endpoint GET /api/v1/volunteers/skills/ retorna lista vazia."

echo ""
echo "✅ SOLUÇÕES APLICADAS:"

echo "1. 🎯 Melhorado o frontend para mostrar mensagem quando não há habilidades"
echo "2. 📊 Adicionados logs de debug para identificar o problema"
echo "3. 📝 Criado script SQL para popular habilidades"

echo ""
echo "🚀 PARA APLICAR EM PRODUÇÃO:"
echo ""
echo "1. Fazer git commit e push das alterações do frontend:"
echo "   git add ."
echo "   git commit -m 'fix: melhorar exibição de habilidades vazias no VolunteerDashboard'"
echo "   git push"
echo ""
echo "2. No servidor de produção, popular as habilidades:"
echo "   # Conectar ao PostgreSQL"
echo "   sudo -u postgres psql mozsolidaria_db"
echo "   # Executar o conteúdo do arquivo populate_volunteer_skills.sql"
echo "   \\i /path/to/populate_volunteer_skills.sql"
echo ""
echo "3. Ou via Django shell no servidor:"
echo "   cd /home/ubuntu/moz-solidaria"
echo "   source venv/bin/activate"
echo "   python manage.py shell"
echo "   # Copiar e colar o código Python do populate_skills.py"
echo ""
echo "4. Restart do serviço:"
echo "   sudo systemctl restart mozsolidaria.service"

echo ""
echo "📝 VERIFICAÇÃO:"
echo "Após aplicar as correções, teste:"
echo "1. Login como voluntário"
echo "2. Ir para dashboard"
echo "3. Clicar em 'Gerenciar Habilidades'"
echo "4. Verificar se as habilidades aparecem na lista"

echo ""
echo "✅ Correção preparada para deploy!"
