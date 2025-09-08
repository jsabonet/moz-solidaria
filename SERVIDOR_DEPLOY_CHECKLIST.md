# 🖥️ CHECKLIST SERVIDOR - DEPLOY SEO PRODUÇÃO

## ⚡ AÇÃO IMEDIATA NO SERVIDOR

### 1️⃣ **CONECTAR AO SERVIDOR**
```bash
# SSH para servidor (substitua pelo seu IP/domínio)
ssh root@seu-servidor.com
# ou
ssh user@mozsolidaria.org
```

### 2️⃣ **NAVEGAR PARA DIRETÓRIO DO PROJETO**
```bash
cd /var/www/mozsolidaria
# ou onde quer que esteja seu projeto
```

### 3️⃣ **FAZER PULL DAS MUDANÇAS**
```bash
git pull origin main
```

### 4️⃣ **ATUALIZAR BACKEND DJANGO**
```bash
cd backend

# Ativar ambiente virtual
source venv/bin/activate
# ou se usar conda:
# conda activate mozsolidaria

# Instalar dependências (se houver novas)
pip install -r requirements.txt

# Aplicar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Testar se sitemaps funcionam
python manage.py shell
```

**No shell Python, teste:**
```python
from django.test import Client
client = Client()

# Testar sitemaps
print("Sitemap Index:", client.get('/sitemap-index.xml').status_code)
print("Sitemap Static:", client.get('/sitemap-static.xml').status_code)
print("Sitemap Blog:", client.get('/sitemap-blog.xml').status_code)
print("Sitemap Programas:", client.get('/sitemap-programas.xml').status_code)

exit()
```

### 5️⃣ **ATUALIZAR FRONTEND**
```bash
cd /var/www/mozsolidaria

# Instalar dependências npm
npm install

# Build de produção
npm run build
```

### 6️⃣ **REINICIAR SERVIÇOS**
```bash
# Reiniciar aplicação Django
sudo systemctl restart mozsolidaria

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar status
sudo systemctl status mozsolidaria
sudo systemctl status nginx
```

### 7️⃣ **VERIFICAR SE FUNCIONOU**
```bash
# Testar URLs importantes
curl -I https://mozsolidaria.org/
curl -I https://mozsolidaria.org/robots.txt
curl -I https://mozsolidaria.org/sitemap-index.xml
curl -I https://mozsolidaria.org/sitemap-static.xml

# Verificar logs se houver erro
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u mozsolidaria -f
```

---

## 🔧 CONFIGURAÇÕES NGINX OPCIONAIS

### Otimizar Nginx para SEO:
```bash
sudo nano /etc/nginx/sites-available/mozsolidaria
```

**Adicionar no bloco server:**
```nginx
# Gzip para performance
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Headers SEO
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";

# Cache para arquivos estáticos  
location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Robots.txt
location = /robots.txt {
    alias /var/www/mozsolidaria/public/robots.txt;
    add_header Content-Type text/plain;
}
```

**Testar e recarregar:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ VERIFICAÇÃO FINAL

### Teste estes URLs no navegador:
- ✅ https://mozsolidaria.org/ (página principal)
- ✅ https://mozsolidaria.org/robots.txt
- ✅ https://mozsolidaria.org/sitemap-index.xml
- ✅ https://mozsolidaria.org/sitemap-static.xml
- ✅ https://mozsolidaria.org/sitemap-blog.xml
- ✅ https://mozsolidaria.org/sitemap-programas.xml

### Verificar Meta Tags (F12 no navegador):
1. Ir para qualquer página do site
2. Pressionar F12 > Elements
3. Procurar no `<head>`:
   - `<title>` único para cada página
   - `<meta name="description">`
   - `<meta name="keywords">`
   - `<meta property="og:title">`
   - `<link rel="canonical">`

---

## 🚨 PROBLEMAS COMUNS

### Se sitemap não funcionar:
```bash
# Verificar URLs Django
cd backend
python manage.py show_urls | grep sitemap

# Verificar se templates existem
ls -la core/templates/

# Verificar logs Django
sudo journalctl -u mozsolidaria | grep sitemap
```

### Se robots.txt não aparecer:
```bash
# Verificar se arquivo existe
ls -la public/robots.txt

# Verificar permissões
chmod 644 public/robots.txt
```

### Se CSS/JS não carregar:
```bash
# Coletar estáticos novamente
cd backend
python manage.py collectstatic --noinput --clear
```

---

## 📊 PRÓXIMOS PASSOS (APÓS DEPLOY)

### 1. **Google Search Console**
- Ir para: https://search.google.com/search-console/
- Adicionar propriedade: https://mozsolidaria.org
- Verificar domínio
- Submeter sitemap: `https://mozsolidaria.org/sitemap-index.xml`

### 2. **Bing Webmaster Tools**  
- Ir para: https://www.bing.com/webmasters/
- Adicionar site: https://mozsolidaria.org
- Submeter sitemap

### 3. **Google Analytics 4**
- Criar propriedade GA4
- Adicionar código de tracking
- Configurar objetivos (doações, contatos)

### 4. **Testes de Performance**
- PageSpeed Insights: https://pagespeed.web.dev/
- Lighthouse (F12 > Lighthouse)
- Core Web Vitals

---

## 🎯 SUCESSO ESPERADO

Após executar tudo acima, você terá:
- ✅ SEO técnico 100% funcional
- ✅ Sitemaps XML automáticos
- ✅ Meta tags otimizadas
- ✅ URLs amigáveis
- ✅ Performance otimizada
- ✅ Pronto para indexação Google/Bing

**🚀 Seu site estará pronto para ranking nos motores de busca!**
