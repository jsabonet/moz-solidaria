#!/bin/bash

# Script rápido para corrigir o problema do PostgreSQL

echo "🔧 Corrigindo configuração do PostgreSQL..."

# 1. Criar arquivo .env com configurações corretas
cd /home/ubuntu/moz-solidaria/backend

cat > .env << 'EOF'
DEBUG=False
SECRET_KEY=moz-solidaria-production-key-2024-change-this
ALLOWED_HOSTS=167.99.93.20,localhost,127.0.0.1

# Database - Configuração correta
DATABASE_URL=postgresql://adamoabdala:Jeison2@@localhost:5432/moz_solidaria_db

# Static files
STATIC_ROOT=/home/ubuntu/moz-solidaria/static/
MEDIA_ROOT=/home/ubuntu/moz-solidaria/media/
EOF

echo "✅ Arquivo .env criado com configurações corretas"

# 2. Testar a conexão
source venv/bin/activate
echo "🧪 Testando conexão com Django..."
python manage.py check

echo "📊 Executando migrações..."
python manage.py migrate

echo "✅ PostgreSQL configurado com sucesso!"
