# 🔧 CORREÇÃO URGENTE - PROBLEMAS IDENTIFICADOS NO SERVIDOR

## 🚨 **PROBLEMAS DETECTADOS:**
1. ❌ ALLOWED_HOSTS não inclui 'testserver'
2. ❌ Sitemaps retornando 404 
3. ❌ Build do frontend foi interrompido

## ⚡ **CORREÇÕES IMEDIATAS:**

### 1️⃣ **CORRIGIR ALLOWED_HOSTS:**
```bash
# Você está em: /home/ubuntu/moz-solidaria/backend
nano moz_solidaria_api/settings.py
```

**Procure por ALLOWED_HOSTS e adicione 'testserver':**
```python
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'mozsolidaria.org',
    'www.mozsolidaria.org',
    'testserver',  # ← ADICIONAR ESTA LINHA
    # Adicione seu IP do servidor aqui também
]
```

### 2️⃣ **VERIFICAR URLs DO DJANGO:**
```bash
# Verificar se URLs dos sitemaps estão configuradas
cd /home/ubuntu/moz-solidaria/backend
python manage.py show_urls | grep sitemap
```

### 3️⃣ **COMPLETAR BUILD FRONTEND:**
```bash
# Voltar para raiz e completar build
cd /home/ubuntu/moz-solidaria
npm run build
```

### 4️⃣ **TESTAR SITEMAPS CORRETAMENTE:**
```bash
cd /home/ubuntu/moz-solidaria/backend

# Testar com hostname correto
python manage.py shell << 'EOF'
from django.test import Client
from django.conf import settings

# Adicionar testserver temporariamente
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

client = Client()
print("=== TESTANDO SITEMAPS APÓS CORREÇÃO ===")
print("Sitemap Index:", client.get('/sitemap-index.xml').status_code)
print("Sitemap Static:", client.get('/sitemap-static.xml').status_code)
print("Sitemap Blog:", client.get('/sitemap-blog.xml').status_code)
print("Sitemap Programas:", client.get('/sitemap-programas.xml').status_code)
EOF
```

### 5️⃣ **REINICIAR SERVIÇOS:**
```bash
# Reiniciar após mudanças
sudo systemctl restart mozsolidaria
sudo systemctl restart nginx
```

### 6️⃣ **TESTAR URLS REAIS:**
```bash
# Testar com IP do servidor ou domínio
curl -I http://YOUR-SERVER-IP/robots.txt
curl -I http://YOUR-SERVER-IP/sitemap-index.xml

# Ou se domínio estiver configurado:
curl -I https://mozsolidaria.org/robots.txt
curl -I https://mozsolidaria.org/sitemap-index.xml
```

---

## 📝 **COMANDOS COMPLETOS PARA COPIAR:**

```bash
# 1. Editar settings.py
cd /home/ubuntu/moz-solidaria/backend
cp moz_solidaria_api/settings.py moz_solidaria_api/settings.py.backup

# Adicionar testserver ao ALLOWED_HOSTS (editar manualmente)
nano moz_solidaria_api/settings.py

# 2. Verificar URLs
python manage.py show_urls | grep sitemap

# 3. Completar build frontend
cd /home/ubuntu/moz-solidaria
npm run build

# 4. Testar sitemaps
cd backend
python manage.py shell << 'EOF'
from django.test import Client
from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')
client = Client()
print("Sitemap Index:", client.get('/sitemap-index.xml').status_code)
print("Sitemap Static:", client.get('/sitemap-static.xml').status_code)
EOF

# 5. Reiniciar serviços
sudo systemctl restart mozsolidaria
sudo systemctl restart nginx

# 6. Testar URLs finais
curl -I http://localhost:8000/robots.txt
curl -I http://localhost:8000/sitemap-index.xml
```

---

## 🔍 **DIAGNÓSTICO ADICIONAL:**

Se ainda der 404, verificar:

```bash
# Ver todas as URLs Django
cd /home/ubuntu/moz-solidaria/backend
python manage.py show_urls

# Ver configuração do URLs principal
cat moz_solidaria_api/urls.py

# Ver se core/urls.py tem os sitemaps
cat core/urls.py

# Ver logs do Django
sudo journalctl -u mozsolidaria | tail -20
```

---

**🎯 Execute essas correções e me diga o resultado de cada comando!**
