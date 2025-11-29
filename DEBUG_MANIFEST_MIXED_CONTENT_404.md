# 🔧 Guia de Debug - Problemas de Manifest, Mixed Content e Imagens 404

## 📋 Resumo dos Problemas

### 1. **Manifest Syntax Error**
- ❌ Problema: `Manifest: Line: 1, column: 1, Syntax error`
- ✅ Solução: Criado arquivo `public/manifest.webmanifest` com JSON válido e linkado no `index.html`

### 2. **Mixed Content Warnings**
- ❌ Problema: Página HTTPS carregando recursos HTTP (auto-upgrade acontecendo)
- ✅ Solução: 
  - Adicionado meta tag CSP `upgrade-insecure-requests` no `index.html`
  - Configuração Nginx para forçar HTTPS e adicionar headers de segurança

### 3. **404 nas Imagens do Blog**
- ❌ Problema: Imagens em `/media/blog_images/` retornando 404
- ✅ Solução:
  - Imagens frontend já têm fallback para Unsplash via `onError`
  - Configuração Nginx para servir `/media/` corretamente
  - Fallback no Nginx para imagens ausentes

---

## 🚀 Implementações Realizadas

### ✅ Frontend (Local)

1. **Manifest Web App** (`public/manifest.webmanifest`)
   ```json
   {
     "name": "MOZ Solidária",
     "short_name": "MozSolidária",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#dc2626"
   }
   ```

2. **Content Security Policy** (`index.html`)
   ```html
   <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
   <link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials" />
   ```

3. **Fallback de Imagens** (já implementado)
   - `BlogDetailNew.tsx`: ✅ Todas imagens com `onError` handler
   - `BlogDetail.tsx`: ✅ Todas imagens com `onError` handler
   - Fallback para: `https://images.unsplash.com/photo-1567057420215-0afa9aa9253a`

---

## 🖥️ Configuração do Servidor (209.97.128.71)

### Passo 1: Conectar ao Servidor
```bash
ssh root@209.97.128.71
```

### Passo 2: Fazer Upload do Script
```bash
# Do seu computador local:
scp deploy_nginx_config.sh root@209.97.128.71:/root/
```

### Passo 3: Executar Script no Servidor
```bash
ssh root@209.97.128.71
chmod +x /root/deploy_nginx_config.sh
/root/deploy_nginx_config.sh
```

---

## 🔍 Verificações no Servidor

### 1. **Verificar Configuração Atual do Nginx**
```bash
# Ver arquivo de configuração atual
cat /etc/nginx/sites-available/mozsolidaria

# Testar configuração
nginx -t

# Ver status do Nginx
systemctl status nginx
```

### 2. **Verificar Estrutura de Diretórios**
```bash
# Verificar diretórios existentes
ls -la /var/www/mozsolidaria/
ls -la /var/www/mozsolidaria/media/blog_images/

# Verificar permissões
ls -ld /var/www/mozsolidaria/media
```

### 3. **Verificar Arquivos de Media**
```bash
# Contar imagens
find /var/www/mozsolidaria/media/blog_images -type f | wc -l

# Listar imagens recentes
ls -lht /var/www/mozsolidaria/media/blog_images/ | head -20

# Verificar permissões das imagens
ls -l /var/www/mozsolidaria/media/blog_images/ | grep "download_2_mqoZi3K.jpeg"
```

### 4. **Verificar Django Settings**
```bash
# Verificar settings do Django
grep -E "MEDIA_ROOT|MEDIA_URL" /var/www/mozsolidaria/backend/mozsolidaria/settings.py
```

### 5. **Testar Nginx Serving**
```bash
# Testar se Nginx está servindo arquivos
curl -I https://mozsolidaria.org/media/blog_images/1000231326.jpg

# Ver logs de erro
tail -f /var/log/nginx/mozsolidaria_error.log
```

---

## 🐛 Debug de Problemas Específicos

### Problema: Imagens Retornam 404

**Causa Provável:**
1. Arquivos não existem no servidor
2. Permissões incorretas
3. Nginx não configurado para servir `/media/`
4. Django não configurado corretamente

**Debug:**
```bash
# 1. Verificar se arquivo existe
ls -l /var/www/mozsolidaria/media/blog_images/download_2_mqoZi3K.jpeg

# 2. Verificar permissões
stat /var/www/mozsolidaria/media/blog_images/download_2_mqoZi3K.jpeg

# 3. Verificar configuração Nginx
grep -A 10 "location /media/" /etc/nginx/sites-available/mozsolidaria

# 4. Testar acesso direto
curl https://mozsolidaria.org/media/blog_images/download_2_mqoZi3K.jpeg -o /tmp/test.jpg
file /tmp/test.jpg
```

**Solução:**
```bash
# Ajustar permissões
chown -R www-data:www-data /var/www/mozsolidaria/media
chmod -R 755 /var/www/mozsolidaria/media

# Recarregar Nginx
systemctl reload nginx
```

---

### Problema: Mixed Content

**Causa:** URLs HTTP sendo requisitadas em página HTTPS

**Debug:**
```bash
# Verificar headers de resposta
curl -I https://mozsolidaria.org | grep -i "content-security"

# Verificar se HTTPS redirect está funcionando
curl -I http://mozsolidaria.org
```

**Solução no Nginx:**
```nginx
# Forçar redirect HTTP -> HTTPS
server {
    listen 80;
    server_name mozsolidaria.org www.mozsolidaria.org;
    return 301 https://$server_name$request_uri;
}

# Adicionar header CSP
add_header Content-Security-Policy "upgrade-insecure-requests" always;
```

---

### Problema: Manifest Syntax Error

**Causa:** Arquivo manifest mal formado ou inexistente

**Debug:**
```bash
# Verificar se manifest existe
ls -l /var/www/mozsolidaria/frontend/dist/manifest.webmanifest

# Validar JSON
cat /var/www/mozsolidaria/frontend/dist/manifest.webmanifest | python3 -m json.tool
```

**Solução:** Já implementado no frontend (arquivo `public/manifest.webmanifest`)

---

## 📊 Comandos de Monitoramento

### Logs em Tempo Real
```bash
# Nginx access log
tail -f /var/log/nginx/mozsolidaria_access.log

# Nginx error log
tail -f /var/log/nginx/mozsolidaria_error.log

# Gunicorn logs
journalctl -u gunicorn -f

# Logs combinados
multitail /var/log/nginx/mozsolidaria_error.log /var/log/nginx/mozsolidaria_access.log
```

### Verificar Certificado SSL
```bash
# Status do certificado
certbot certificates

# Renovar certificado
certbot renew --dry-run

# Verificar validade
openssl s_client -connect mozsolidaria.org:443 -servername mozsolidaria.org < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## ✅ Checklist de Deploy

- [ ] Upload do frontend build para `/var/www/mozsolidaria/frontend/dist/`
- [ ] Verificar `manifest.webmanifest` está presente no dist
- [ ] Configurar Nginx com script `deploy_nginx_config.sh`
- [ ] Testar configuração: `nginx -t`
- [ ] Recarregar Nginx: `systemctl reload nginx`
- [ ] Verificar permissões de `/media/` e `/static/`
- [ ] Testar URL: `https://mozsolidaria.org`
- [ ] Testar imagens: `https://mozsolidaria.org/media/blog_images/`
- [ ] Verificar console do navegador (sem erros de manifest ou mixed content)
- [ ] Verificar fallback de imagens está funcionando
- [ ] Testar redirect HTTP -> HTTPS

---

## 🎯 Configuração Recomendada do Django

```python
# settings.py

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = '/var/www/mozsolidaria/media/'

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = '/var/www/mozsolidaria/static/'

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
```

---

## 🔄 Processo de Deploy Completo

```bash
# 1. Build do frontend (local)
npm run build

# 2. Upload para servidor
rsync -avz --delete dist/ root@209.97.128.71:/var/www/mozsolidaria/frontend/dist/

# 3. Configurar Nginx (se necessário)
ssh root@209.97.128.71 'bash /root/deploy_nginx_config.sh'

# 4. Coletar static files do Django (no servidor)
ssh root@209.97.128.71 'cd /var/www/mozsolidaria/backend && python manage.py collectstatic --noinput'

# 5. Restart services (no servidor)
ssh root@209.97.128.71 'systemctl restart gunicorn && systemctl reload nginx'

# 6. Verificar
curl -I https://mozsolidaria.org
```

---

## 📞 Suporte

Se os problemas persistirem após seguir este guia:

1. Verificar logs: `/var/log/nginx/mozsolidaria_error.log`
2. Verificar status do Gunicorn: `systemctl status gunicorn`
3. Testar conectividade: `curl -v https://mozsolidaria.org/api/health`
4. Verificar firewall: `ufw status`

---

**Última atualização:** 2025-11-29
**Servidor:** 209.97.128.71
**Domínio:** mozsolidaria.org
