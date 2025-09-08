# 🚀 COMANDOS PARA EXECUTAR NO SERVIDOR - MOZ SOLIDÁRIA

## ✅ SITUAÇÃO ATUAL:
- Você está em: `/home/ubuntu/moz-solidaria/backend`
- Git pull foi feito com sucesso
- Arquivos SEO foram baixados

## 📋 EXECUTE ESTES COMANDOS EM SEQUÊNCIA:

### 1️⃣ **VERIFICAR ESTRUTURA DO PROJETO**
```bash
# Você está em: /home/ubuntu/moz-solidaria/backend
# Verificar se manage.py está aqui
ls -la manage.py

# Se não estiver, voltar para diretório pai
cd /home/ubuntu/moz-solidaria
ls -la manage.py
```

### 2️⃣ **APLICAR MIGRAÇÕES DJANGO**
```bash
# Se manage.py está em /home/ubuntu/moz-solidaria/backend:
cd /home/ubuntu/moz-solidaria/backend

# Se manage.py está em /home/ubuntu/moz-solidaria:
cd /home/ubuntu/moz-solidaria

# Ativar ambiente virtual (se não estiver ativo)
source venv/bin/activate

# Aplicar migrações
python manage.py makemigrations
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput
```

### 3️⃣ **TESTAR SITEMAPS DJANGO**
```bash
# Testar se os sitemaps funcionam
python manage.py shell
```

**No shell Python, execute:**
```python
from django.test import Client
client = Client()

# Testar cada sitemap
print("=== TESTANDO SITEMAPS ===")
print("Sitemap Index:", client.get('/sitemap-index.xml').status_code)
print("Sitemap Static:", client.get('/sitemap-static.xml').status_code)  
print("Sitemap Blog:", client.get('/sitemap-blog.xml').status_code)
print("Sitemap Programas:", client.get('/sitemap-programas.xml').status_code)

# Sair do shell
exit()
```

### 4️⃣ **ATUALIZAR FRONTEND**
```bash
# Voltar para diretório raiz do projeto
cd /home/ubuntu/moz-solidaria

# Instalar dependências
npm install

# Build de produção
npm run build
```

### 5️⃣ **REINICIAR SERVIÇOS**
```bash
# Reiniciar aplicação Django
sudo systemctl restart mozsolidaria

# Verificar status
sudo systemctl status mozsolidaria

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

### 6️⃣ **VERIFICAR SE FUNCIONOU**
```bash
# Testar URLs importantes
echo "=== TESTANDO URLs ==="
curl -I http://localhost:8000/
curl -I http://localhost:8000/robots.txt
curl -I http://localhost:8000/sitemap-index.xml
curl -I http://localhost:8000/sitemap-static.xml

# Se estiver usando domínio público:
curl -I https://mozsolidaria.org/robots.txt
curl -I https://mozsolidaria.org/sitemap-index.xml
```

### 7️⃣ **VERIFICAR LOGS SE HOUVER PROBLEMAS**
```bash
# Logs da aplicação Django
sudo journalctl -u mozsolidaria -f

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 **COMANDOS ESPECÍFICOS PARA SEU CASO:**

**Execute exatamente isso no seu terminal:**

```bash
# 1. Voltar para diretório raiz
cd /home/ubuntu/moz-solidaria

# 2. Verificar se manage.py está aqui
ls -la manage.py

# 3. Se manage.py estiver no backend:
cd backend
ls -la manage.py

# 4. Aplicar mudanças Django
python manage.py makemigrations
python manage.py migrate  
python manage.py collectstatic --noinput

# 5. Testar sitemaps
python manage.py shell << EOF
from django.test import Client
client = Client()
print("Sitemap Index:", client.get('/sitemap-index.xml').status_code)
print("Sitemap Static:", client.get('/sitemap-static.xml').status_code)
print("Sitemap Blog:", client.get('/sitemap-blog.xml').status_code)
print("Sitemap Programas:", client.get('/sitemap-programas.xml').status_code)
EOF

# 6. Voltar para raiz e build frontend
cd /home/ubuntu/moz-solidaria
npm install
npm run build

# 7. Reiniciar serviços
sudo systemctl restart mozsolidaria
sudo systemctl restart nginx

# 8. Testar URLs
curl -I http://localhost:8000/robots.txt
curl -I http://localhost:8000/sitemap-index.xml
```

---

## ✅ **VERIFICAÇÃO FINAL:**

Após executar os comandos acima, teste estes URLs no navegador:

- **http://SEU-IP-DO-SERVIDOR/robots.txt**
- **http://SEU-IP-DO-SERVIDOR/sitemap-index.xml**
- **https://mozsolidaria.org/robots.txt** (se domínio configurado)
- **https://mozsolidaria.org/sitemap-index.xml** (se domínio configurado)

---

## 🚨 **SE ALGO DER ERRADO:**

### Erro de sitemap 404:
```bash
# Verificar se URLs estão configuradas
cd backend  # ou onde está manage.py
python manage.py show_urls | grep sitemap
```

### Erro de permissão:
```bash
# Dar permissões corretas
sudo chown -R www-data:www-data /home/ubuntu/moz-solidaria
sudo chmod -R 755 /home/ubuntu/moz-solidaria
```

### Erro de static files:
```bash
# Recolher arquivos estáticos
python manage.py collectstatic --noinput --clear
```

---

**🎯 Execute os comandos acima e me diga o resultado de cada etapa!**
