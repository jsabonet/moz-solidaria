#!/bin/bash

# Script para corrigir definitivamente o PostgreSQL no DigitalOcean

echo "🔧 Corrigindo PostgreSQL - Solução Definitiva..."

# 1. Recriar usuário PostgreSQL completamente
echo "👤 Recriando usuário PostgreSQL..."

sudo -u postgres psql <<EOF
-- Encerrar todas as conexões do usuário
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = 'adamoabdala';

-- Remover usuário se existir
DROP USER IF EXISTS adamoabdala;

-- Recriar usuário com todas as permissões
CREATE USER adamoabdala WITH PASSWORD 'Jeison2@@' CREATEDB CREATEROLE LOGIN;

-- Alterar senha para ter certeza
ALTER USER adamoabdala WITH PASSWORD 'Jeison2@@';

-- Verificar se banco existe
SELECT 'CREATE DATABASE moz_solidaria_db OWNER adamoabdala' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'moz_solidaria_db')\gexec

-- Dar todos os privilégios
GRANT ALL PRIVILEGES ON DATABASE moz_solidaria_db TO adamoabdala;

-- Conectar no banco
\c moz_solidaria_db

-- Dar privilégios no schema
GRANT ALL ON SCHEMA public TO adamoabdala;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO adamoabdala;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO adamoabdala;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO adamoabdala;

-- Dar privilégios por padrão para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO adamoabdala;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO adamoabdala;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO adamoabdala;

-- Listar usuários para confirmar
\du

-- Sair
\q
EOF

# 2. Verificar configuração pg_hba.conf
echo "🔐 Verificando configuração de autenticação..."

# Backup do arquivo original
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Garantir que a autenticação md5 está habilitada
sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' /etc/postgresql/*/main/pg_hba.conf

# Adicionar linha para garantir acesso local
echo "host    all             all             127.0.0.1/32            md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# 3. Reiniciar PostgreSQL
echo "🔄 Reiniciando PostgreSQL..."
sudo systemctl restart postgresql
sudo systemctl status postgresql --no-pager

# 4. Testar conexão direta
echo "🧪 Testando conexão..."
PGPASSWORD='Jeison2@@' psql -h 127.0.0.1 -U adamoabdala -d moz_solidaria_db -c "SELECT current_user, version();"

if [ $? -eq 0 ]; then
    echo "✅ Conexão PostgreSQL funcionando!"
    
    # 5. Atualizar .env no projeto
    cd /home/ubuntu/moz-solidaria/backend
    cat > .env << 'EOL'
DEBUG=False
SECRET_KEY=moz-solidaria-production-secret-key-2024
ALLOWED_HOSTS=127.0.0.1,167.99.93.20,209.97.128.71

# Database Configuration
DATABASE_URL=postgresql://adamoabdala:Jeison2@@127.0.0.1:5432/moz_solidaria_db

# PostgreSQL Configuration
DB_NAME=moz_solidaria_db
DB_USER=adamoabdala
DB_PASSWORD=Jeison2@@
DB_HOST=127.0.0.1
DB_PORT=5432

# Static files
STATIC_ROOT=/home/ubuntu/moz-solidaria/static/
MEDIA_ROOT=/home/ubuntu/moz-solidaria/media/

# JWT Configuration
JWT_SECRET_KEY=moz-solidaria-jwt-secret-key-2024
EOL

    # 6. Testar Django
    source venv/bin/activate
    echo "🐍 Testando Django..."
    python manage.py check
    
    if [ $? -eq 0 ]; then
        echo "✅ Django funcionando!"
        python manage.py migrate
        echo "🎉 Migração concluída!"
    else
        echo "❌ Erro no Django"
    fi
else
    echo "❌ Erro na conexão PostgreSQL"
fi

echo "📋 Log de diagnóstico:"
echo "PostgreSQL status:"
sudo systemctl is-active postgresql
echo "Portas abertas:"
sudo ss -tlnp | grep :5432
echo "Usuários PostgreSQL:"
sudo -u postgres psql -c "\du"
