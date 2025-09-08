# 🎯 SOLUÇÃO FINAL - ÚLTIMOS AJUSTES NO SERVIDOR

## ✅ **PROGRESSO DETECTADO:**
- ✅ Frontend build funcionando
- ✅ robots.txt funcionando (HTTP 200)
- ✅ Domínio mozsolidaria.org respondendo
- ❌ Sitemaps Django ainda 404

## 🔧 **DIAGNÓSTICO E CORREÇÃO:**

### 1️⃣ **VERIFICAR CONFIGURAÇÃO ATUAL NO SERVIDOR:**
```bash
# Você está em: /home/ubuntu/moz-solidaria/backend
# Primeiro, vamos ver como estão os settings.py

# Ver ALLOWED_HOSTS atual
grep -A 5 -B 5 "ALLOWED_HOSTS" moz_solidaria_api/settings.py

# Ver se Django está servindo na porta 8000
sudo netstat -tlnp | grep :8000

# Ver logs do Django
sudo journalctl -u mozsolidaria | tail -10
```

### 2️⃣ **TESTAR URLS DJANGO DIRETO:**
```bash
# Testar se Django está rodando
curl -I http://localhost:8000/admin/

# Ver todas as URLs Django
python manage.py show_urls | grep -E "(sitemap|robots)"

# Testar sitemap específico
curl -v http://localhost:8000/sitemap-index.xml
```

### 3️⃣ **TESTAR SITEMAPS SEM TESTSERVER:**
```bash
# Testar usando override de host
python manage.py shell << 'EOF'
from django.test import Client
from django.conf import settings

# Ver ALLOWED_HOSTS atual
print("ALLOWED_HOSTS atual:", settings.ALLOWED_HOSTS)

# Testar com host válido
client = Client(HTTP_HOST='localhost')
print("=== TESTANDO COM LOCALHOST ===")
print("Sitemap Index:", client.get('/sitemap-index.xml', HTTP_HOST='localhost').status_code)
print("Sitemap Static:", client.get('/sitemap-static.xml', HTTP_HOST='localhost').status_code)

# Se não funcionar, testar URLs registradas
from django.urls import reverse
try:
    print("URL sitemap-index:", reverse('sitemap_index'))
except:
    print("URL sitemap-index não encontrada")
EOF
```

### 4️⃣ **VERIFICAR NGINX PROXY:**
```bash
# Ver configuração nginx
sudo cat /etc/nginx/sites-available/mozsolidaria | grep -A 10 -B 10 location

# Testar se nginx está fazendo proxy correto
curl -H "Host: mozsolidaria.org" http://localhost/sitemap-index.xml
```

---

## 🚀 **COMANDOS RÁPIDOS DE DIAGNÓSTICO:**

```bash
# EXECUTE TUDO DE UMA VEZ:
cd /home/ubuntu/moz-solidaria/backend

echo "=== 1. VERIFICANDO DJANGO ==="
python manage.py check
python manage.py show_urls | head -20

echo "=== 2. TESTANDO SITEMAPS COM HOST CORRETO ==="
python manage.py shell << 'EOF'
from django.test import Client
client = Client(HTTP_HOST='localhost')
print("Sitemap Index (localhost):", client.get('/sitemap-index.xml').status_code)
print("Sitemap Static (localhost):", client.get('/sitemap-static.xml').status_code)
EOF

echo "=== 3. TESTANDO CURL DIRETO ==="
curl -I http://localhost:8000/
curl -I http://localhost:8000/sitemap-index.xml

echo "=== 4. VERIFICANDO NGINX ==="
curl -I http://localhost/sitemap-index.xml
```

---

## 🎯 **SE AINDA DER 404:**

### Opção A: Verificar se as URLs estão realmente registradas:
```bash
cd /home/ubuntu/moz-solidaria/backend
python manage.py shell -c "
from django.conf.urls import url
from django.urls import include, path
from django.conf import settings
from django.utils.module_loading import import_string
print('URLs principais:')
from moz_solidaria_api.urls import urlpatterns
for pattern in urlpatterns:
    print(f'  {pattern}')
"
```

### Opção B: Restart completo:
```bash
# Restart completo de tudo
sudo systemctl restart mozsolidaria
sudo systemctl restart nginx
sleep 5
curl -I http://localhost:8000/sitemap-index.xml
```

### Opção C: Verificar arquivo core/urls.py:
```bash
cat core/urls.py | grep -A 10 -B 10 sitemap
```

---

## 📋 **RESULTADOS ESPERADOS:**

Após executar os diagnósticos acima, me diga:

1. **O que mostra** `python manage.py show_urls | grep sitemap`
2. **Status code** do `curl -I http://localhost:8000/sitemap-index.xml`
3. **Conteúdo** do `cat core/urls.py`

---

**🔍 Execute os comandos de diagnóstico e me passe os resultados para identificarmos exatamente onde está o problema!**
