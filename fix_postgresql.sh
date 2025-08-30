#!/bin/bash

# =================================================================
# SCRIPT PARA CORRIGIR CONFIGURAÇÃO DO POSTGRESQL NO DIGITALOCEAN
# =================================================================

echo "🔧 Configurando PostgreSQL para MOZ SOLIDÁRIA..."

# 1. Parar o PostgreSQL para reconfiguração
echo "📦 Parando PostgreSQL..."
sudo systemctl stop postgresql

# 2. Verificar e corrigir usuários no PostgreSQL
echo "👤 Configurando usuários do PostgreSQL..."
sudo -u postgres psql <<EOF
-- Remover usuário antigo se existir
DROP USER IF EXISTS joellasmim;

-- Verificar se usuário adamoabdala existe, se não criar
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'adamoabdala') THEN
        CREATE USER adamoabdala WITH PASSWORD 'Jeison2@@';
    END IF;
END
\$\$;

-- Alterar senha do usuário (caso já exista)
ALTER USER adamoabdala WITH PASSWORD 'Jeison2@@';

-- Verificar se banco existe, se não criar
SELECT 'CREATE DATABASE moz_solidaria_db OWNER adamoabdala'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'moz_solidaria_db')\gexec

-- Conceder todos os privilégios
GRANT ALL PRIVILEGES ON DATABASE moz_solidaria_db TO adamoabdala;

-- Conceder privilégios para criar databases (para testes)
ALTER USER adamoabdala CREATEDB;

-- Listar usuários para verificação
\du

-- Sair
\q
EOF

# 3. Reiniciar PostgreSQL
echo "🔄 Reiniciando PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Verificar status
echo "✅ Verificando status do PostgreSQL..."
sudo systemctl status postgresql --no-pager -l

# 5. Testar conexão
echo "🧪 Testando conexão com banco..."
PGPASSWORD='Jeison2@@' psql -h localhost -U adamoabdala -d moz_solidaria_db -c "SELECT version();" || echo "❌ Erro na conexão"

# 6. Configurar variáveis de ambiente
echo "📝 Configurando variáveis de ambiente..."
cd /home/ubuntu/moz-solidaria/backend

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
    cat > .env << 'EOL'
# DigitalOcean Production Environment
DEBUG=False
SECRET_KEY=moz-solidaria-super-secret-key-production-2024-change-this
ALLOWED_HOSTS=167.99.93.20,localhost,127.0.0.1

# Database Configuration
DATABASE_URL=postgresql://adamoabdala:Jeison2@@localhost:5432/moz_solidaria_db
DB_NAME=moz_solidaria_db
DB_USER=adamoabdala
DB_PASSWORD=Jeison2@@
DB_HOST=localhost
DB_PORT=5432

# Static and Media
STATIC_ROOT=/home/ubuntu/moz-solidaria/static/
MEDIA_ROOT=/home/ubuntu/moz-solidaria/media/

# Logging
LOG_LEVEL=INFO
EOL
    echo "✅ Arquivo .env criado"
else
    echo "ℹ️  Arquivo .env já existe"
fi

# 7. Ativar virtual environment e testar Django
echo "🐍 Testando Django com as novas configurações..."
source venv/bin/activate

# Verificar se consegue conectar no banco
python manage.py check --database default

if [ $? -eq 0 ]; then
    echo "✅ Django consegue conectar no banco!"
    
    # Fazer migrações
    echo "📊 Executando migrações..."
    python manage.py migrate
    
    # Coletar arquivos estáticos
    echo "📁 Coletando arquivos estáticos..."
    python manage.py collectstatic --noinput
    
    echo "🎉 Configuração do PostgreSQL concluída com sucesso!"
    echo ""
    echo "🔧 Próximos passos:"
    echo "1. Criar superusuário: python manage.py createsuperuser"
    echo "2. Iniciar servidor: gunicorn --bind 0.0.0.0:8000 moz_solidaria_api.wsgi"
    echo "3. Configurar Nginx para servir a aplicação"
    
else
    echo "❌ Erro: Django não consegue conectar no banco"
    echo "Verifique as configurações e tente novamente"
fi

echo "📋 Informações do banco:"
echo "Host: localhost"
echo "Port: 5432"
echo "Database: moz_solidaria_db"
echo "User: adamoabdala"
echo "Password: Jeison2@@"
