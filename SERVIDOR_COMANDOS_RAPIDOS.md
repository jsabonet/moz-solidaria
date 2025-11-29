# 🚀 Guia Rápido de Deploy - Execute no Servidor

## Você está no servidor em: /home/ubuntu/moz-solidaria

### 1️⃣ Upload e Executar Script de Configuração Nginx

```bash
# Você já está conectado via SSH. Execute:

# Tornar o script executável
chmod +x deploy_nginx_config.sh

# Executar o script
./deploy_nginx_config.sh
```

---

### 2️⃣ Verificar Django Settings

```bash
# Ver configuração de MEDIA_ROOT e MEDIA_URL
grep -E "MEDIA_ROOT|MEDIA_URL|STATIC_ROOT|STATIC_URL" backend/mozsolidaria/settings.py

# Se necessário, editar:
nano backend/mozsolidaria/settings.py
```

**Configuração esperada:**
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, '../media')  # ou '/home/ubuntu/moz-solidaria/media'

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, '../staticfiles')
```

---

### 3️⃣ Coletar Arquivos Estáticos do Django

```bash
cd /home/ubuntu/moz-solidaria/backend

# Ativar ambiente virtual se existir
source venv/bin/activate  # ou source ../venv/bin/activate

# Coletar static files
python manage.py collectstatic --noinput
```

---

### 4️⃣ Verificar Arquivos de Media

```bash
# Ver quantos arquivos de media existem
find /home/ubuntu/moz-solidaria/media -type f | wc -l

# Ver estrutura de diretórios
tree -L 3 /home/ubuntu/moz-solidaria/media || ls -R /home/ubuntu/moz-solidaria/media

# Ver onde o Django está salvando uploads
find /home/ubuntu -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" 2>/dev/null | head -20
```

---

### 5️⃣ Restart Services

```bash
# Restart Gunicorn
sudo systemctl restart gunicorn
sudo systemctl status gunicorn

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

### 6️⃣ Testes

```bash
# Testar site
curl -I https://mozsolidaria.org

# Testar API
curl -I https://mozsolidaria.org/api/

# Testar media (deve retornar 404 ou redirect para fallback)
curl -I https://mozsolidaria.org/media/blog_images/

# Ver logs de erro
tail -f /var/log/nginx/mozsolidaria_error.log
```

---

### 7️⃣ Verificar Permissões

```bash
# Ajustar permissões se necessário
sudo chown -R www-data:www-data /home/ubuntu/moz-solidaria/media
sudo chown -R www-data:www-data /home/ubuntu/moz-solidaria/staticfiles
sudo chmod -R 755 /home/ubuntu/moz-solidaria/media
sudo chmod -R 755 /home/ubuntu/moz-solidaria/staticfiles
```

---

### 8️⃣ Se Precisar Copiar Arquivos de Media Existentes

```bash
# Encontrar onde estão os arquivos antigos
find /home -name "blog_images" -type d 2>/dev/null

# Se encontrar em outro local, copiar:
# cp -r /caminho/antigo/media/* /home/ubuntu/moz-solidaria/media/
```

---

### ❓ Troubleshooting

**Se as imagens ainda derem 404:**

```bash
# Verificar se os arquivos existem
ls -lh /home/ubuntu/moz-solidaria/media/blog_images/ | head -20

# Verificar configuração do Nginx
cat /etc/nginx/sites-enabled/mozsolidaria | grep -A 5 "location /media"

# Ver erros específicos
grep "404" /var/log/nginx/mozsolidaria_error.log | tail -20

# Verificar se Nginx pode acessar os arquivos
sudo -u www-data ls /home/ubuntu/moz-solidaria/media/blog_images/
```

---

### 🎯 Checklist Final

- [ ] Script de configuração executado com sucesso
- [ ] Django settings configurado corretamente
- [ ] Collectstatic executado
- [ ] Arquivos de media existem em `/home/ubuntu/moz-solidaria/media/`
- [ ] Permissões corretas (www-data:www-data, 755)
- [ ] Gunicorn rodando
- [ ] Nginx configurado e recarregado
- [ ] Site acessível: https://mozsolidaria.org
- [ ] Console do navegador sem erros de manifest
- [ ] Imagens carregando ou fallback funcionando

---

**Última atualização:** 2025-11-29
**Servidor:** 209.97.128.71 (Ubuntu 25.04)
**Path:** /home/ubuntu/moz-solidaria/
