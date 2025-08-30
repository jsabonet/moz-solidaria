# INSTRUÇÕES PARA CORRIGIR O POSTGRESQL NO DIGITALOCEAN

## Problema Identificado
O Django está tentando conectar com o usuário 'joellasmim' ao invés de 'adamoabdala'.

## Solução Rápida

### 1. Criar arquivo .env no servidor
No servidor DigitalOcean, execute:

```bash
cd /home/ubuntu/moz-solidaria/backend

# Criar arquivo .env com configurações corretas
cat > .env << 'EOF'
DEBUG=False
SECRET_KEY=moz-solidaria-production-key-2024-change-this
ALLOWED_HOSTS=167.99.93.20,localhost,127.0.0.1

# Database - Configuração PostgreSQL
DATABASE_URL=postgresql://adamoabdala:Jeison2@@localhost:5432/moz_solidaria_db

# Paths
STATIC_ROOT=/home/ubuntu/moz-solidaria/static/
MEDIA_ROOT=/home/ubuntu/moz-solidaria/media/
EOF
```

### 2. Testar a configuração
```bash
# Ativar virtual environment
source venv/bin/activate

# Verificar configuração
python manage.py check

# Executar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Criar superusuário
python manage.py createsuperuser
```

### 3. Iniciar a aplicação
```bash
# Testar servidor de desenvolvimento
python manage.py runserver 0.0.0.0:8000

# OU iniciar com Gunicorn para produção
gunicorn --bind 0.0.0.0:8000 moz_solidaria_api.wsgi
```

## Verificação do Banco

Se ainda houver problemas, verifique o PostgreSQL:

```bash
# Conectar como postgres
sudo -u postgres psql

# Verificar usuários
\du

# Verificar bancos
\l

# Conectar no banco específico
\c moz_solidaria_db

# Sair
\q
```

## Configurações de Segurança

Depois que tudo funcionar, configure:

1. **Firewall:**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

2. **Nginx (se ainda não configurado):**
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

3. **SSL Certificate:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## Logs para Debug

Se houver problemas, verifique os logs:

```bash
# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*-main.log

# Logs do Django (quando rodando)
tail -f /home/ubuntu/moz-solidaria/backend/logs/*.log

# Status dos serviços
sudo systemctl status postgresql
sudo systemctl status nginx
```

## Comandos Úteis

```bash
# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar portas abertas
sudo netstat -tlnp | grep :5432
sudo netstat -tlnp | grep :8000

# Verificar processos Python
ps aux | grep python
```
