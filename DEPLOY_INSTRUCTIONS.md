# 📋 Instruções de Deploy - MOZ SOLIDÁRIA

## ✅ Deploy já realizado com sucesso!

Os arquivos foram transferidos via SCP para o servidor em:
- **Data:** 22/11/2025
- **Servidor:** root@209.97.128.71
- **Diretório:** /var/www/mozsolidaria/frontend/
- **Status:** ✅ Nginx recarregado com sucesso

## 🚀 Como fazer deploy futuro

### Método 1: SCP (Recomendado - Atual)

```powershell
# 1. Build local
npm run build

# 2. Transferir arquivos
scp -r dist/* root@209.97.128.71:/var/www/mozsolidaria/frontend/

# 3. Recarregar nginx
ssh root@209.97.128.71 "systemctl reload nginx"
```

### Método 2: Script PowerShell Automatizado

Execute o script já criado:
```powershell
.\deploy_quick.ps1
```

### Método 3: Configurar Git no Servidor (Opcional)

Se quiser usar Git no servidor:

```bash
# No servidor
cd /var/www/mozsolidaria
git init
git remote add origin https://github.com/jsabonet/moz-solidaria.git
git fetch origin main
git checkout -b main origin/main

# Criar script de deploy
nano deploy.sh
```

Conteúdo do deploy.sh:
```bash
#!/bin/bash
cd /var/www/mozsolidaria
git pull origin main
cd frontend
npm install
npm run build
systemctl reload nginx
echo "✅ Deploy concluído!"
```

## 📱 Alterações Deployadas (22/11/2025)

### BlogDetail.tsx - Responsivo Mobile
- ✅ Sidebar colapsável com botão toggle em mobile
- ✅ Animações suaves (slide + fade)
- ✅ Botão sticky no topo com badge "4 itens"
- ✅ Layout duas colunas desktop com sidebar sticky
- ✅ Posts relacionados responsivos (1→2→3 colunas)
- ✅ Breadcrumb otimizado para mobile

### Blog.tsx - Sistema de Paginação
- ✅ fetchAllPosts() com todos os artigos (28+)
- ✅ Paginação client-side (9 posts por página)
- ✅ Filtros de categoria interativos
- ✅ Cards modernos com hover effects
- ✅ Busca com debounce

### API Configuration
- ✅ Variáveis de ambiente configuradas (.env.production)
- ✅ API_BASE aponta para https://mozsolidaria.org/api/v1
- ✅ HTTPS enforcement em paginação

## 🧪 Como Testar

1. **Desktop:**
   - Visite: https://mozsolidaria.org/blog
   - Clique em qualquer artigo
   - Verifique sidebar fixa à direita
   - Teste scroll para ver sidebar sticky

2. **Mobile:**
   - Abra em dispositivo móvel ou DevTools (F12)
   - Clique em "Ver menu lateral (4 itens)"
   - Verifique animação suave
   - Teste botão de fechar (X)

3. **Limpar Cache:**
   - Windows: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`
   - Ou modo anônimo

## 📦 Backup

Arquivo ZIP de backup criado:
- `mozsolidaria-frontend-update.zip`
- Contém: dist completo com todas as melhorias

## 🔧 Troubleshooting

### Cache não limpa
```bash
# No servidor
ssh root@209.97.128.71
systemctl restart nginx
```

### Arquivos não atualizados
```powershell
# Verificar timestamp
ssh root@209.97.128.71 "ls -lh /var/www/mozsolidaria/frontend/assets/js/BlogDetail*"
```

### Nginx não recarrega
```bash
# Testar configuração
nginx -t

# Restart completo
systemctl restart nginx
```

## 📞 Suporte

Se precisar de ajuda, verifique:
1. Logs do nginx: `/var/log/nginx/error.log`
2. Status do serviço: `systemctl status nginx`
3. Permissões: `ls -la /var/www/mozsolidaria/frontend/`

---

**Última atualização:** 22/11/2025  
**Versão:** BlogDetail Mobile Responsive v2.0  
**Commit:** 3b1c2494 - feat: Add responsive mobile sidebar for BlogDetail
