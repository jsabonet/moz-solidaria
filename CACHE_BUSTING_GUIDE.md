# 🚀 Guia Completo: Cache Busting para Django + React

Este guia implementa uma solução completa para garantir que usuários sempre recebam a versão mais recente do seu site/app, eliminando problemas de cache em navegadores.

## 📋 Sumário

1. [Problema do Cache](#problema-do-cache)
2. [Solução Implementada](#solução-implementada)
3. [Configurações Aplicadas](#configurações-aplicadas)
4. [Como Usar](#como-usar)
5. [Verificação e Testes](#verificação-e-testes)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Problema do Cache

**Sintomas observados:**
- Usuários veem erros antigos mesmo após correções
- Problema mais comum em dispositivos móveis
- Desaparece após algum tempo ou limpeza manual de cache
- Inconsistência entre usuários

**Causas principais:**
- Cache do navegador armazena arquivos antigos
- Service Workers podem servir conteúdo desatualizado  
- Headers de cache inadequados no servidor
- Ausência de cache busting nos assets

---

## ✅ Solução Implementada

### 1. **Cache Busting Automático (Vite)**
- Geração de hashes únicos para todos os assets
- Organização por tipo (JS, CSS, imagens, fontes)
- Manifest com informações de build
- Limpeza automática do diretório de saída

### 2. **Sistema de Versionamento**
- Incremento automático de versão
- Build ID único com timestamp e git hash
- Arquivo `build-info.json` para verificação

### 3. **Headers de Cache Inteligentes (Nginx)**
- HTML: Sem cache (sempre busca versão mais recente)
- Assets com hash: Cache longo (1 ano, immutable)
- Assets sem hash: Cache curto (1 hora)
- Service Workers: Sem cache

### 4. **Detecção Automática de Atualizações**
- Componente React monitora novas versões
- Notificações automáticas aos usuários
- Limpeza inteligente de cache
- Verificação na mudança de foco da aba

---

## ⚙️ Configurações Aplicadas

### **Vite Configuration** (`vite.config.ts`)
```typescript
build: {
  rollupOptions: {
    output: {
      chunkFileNames: 'assets/js/[name]-[hash].js',
      assetFileNames: (assetInfo) => {
        // Organiza por tipo com hash único
        if (/\.(css)$/.test(assetInfo.name || '')) {
          return `assets/css/[name]-[hash].${extType}`;
        }
        // ... outras extensões
      },
      entryFileNames: 'assets/js/[name]-[hash].js',
    },
  },
  manifest: true, // Gera manifest.json com mapeamento de hashes
}
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "build:production": "npm run version:patch && npm run build:server && npm run generate:build-info",
    "version:patch": "npm version patch --no-git-tag-version",
    "generate:build-info": "node scripts/generate-build-info.js"
  }
}
```

### **Nginx Configuration** (`nginx.conf`)
```nginx
# HTML - Sem cache (sempre buscar nova versão)
location ~* \.(html)$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# Assets com hash - Cache longo
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    if ($uri ~ ".*-[a-f0-9]{8,}\.(js|css|...)$") {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Build info - Sem cache
location = /build-info.json {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

---

## 🚀 Como Usar

### **1. Desenvolvimento Local**

```bash
# Build com cache busting
npm run build:production

# Ou build simples
npm run build

# Preview local
npm run preview
```

### **2. Deploy Automático (Windows)**

```powershell
# Executar script de deploy
.\scripts\deploy-cache-busting.ps1 -Environment production

# Com opções
.\scripts\deploy-cache-busting.ps1 -Environment production -Force
```

### **3. Deploy no Servidor (Linux)**

```bash
# Tornar executável
chmod +x scripts/deploy-with-cache-busting.sh

# Executar deploy
./scripts/deploy-with-cache-busting.sh
```

### **4. Adicionar Detecção de Atualizações**

No seu componente principal (App.tsx):

```tsx
import { UpdateChecker } from '@/components/UpdateChecker';

function App() {
  return (
    <div>
      {/* Seu app aqui */}
      
      {/* Adicionar detector de atualizações */}
      <UpdateChecker checkInterval={300000} showToast={true} />
    </div>
  );
}
```

Ou usando o hook:

```tsx
import { useUpdateChecker } from '@/components/UpdateChecker';

function MyComponent() {
  const { updateAvailable, buildId, forceUpdate } = useUpdateChecker();
  
  return (
    <div>
      {updateAvailable && (
        <button onClick={forceUpdate}>
          Nova versão disponível! Clique para atualizar
        </button>
      )}
    </div>
  );
}
```

---

## ✅ Verificação e Testes

### **1. Verificar Build Local**

```bash
# Build de produção
npm run build:production

# Verificar arquivos gerados
ls -la dist/assets/

# Deve mostrar arquivos como:
# - index-a1b2c3d4.js
# - style-e5f6g7h8.css
# - logo-i9j0k1l2.png
```

### **2. Verificar no Servidor**

```bash
# Verificar build info
curl -H "Cache-Control: no-cache" https://mozsolidaria.org/build-info.json

# Verificar headers de cache
curl -I https://mozsolidaria.org/assets/js/index-[hash].js

# Deve retornar:
# Cache-Control: public, immutable
# Expires: [data futura]
```

### **3. Teste de Atualização**

1. **Fazer mudança no código**
2. **Executar novo build**: `npm run build:production`
3. **Deploy no servidor**
4. **Abrir site em navegador**
5. **Verificar se notificação aparece** (ou console do desenvolvedor)

### **4. Verificar Headers no Navegador**

1. Abrir DevTools (F12)
2. Aba Network
3. Recarregar página
4. Verificar headers dos arquivos:
   - `index.html`: `Cache-Control: no-cache`
   - `index-[hash].js`: `Cache-Control: public, immutable`

---

## 🔧 Troubleshooting

### **Problema: Usuários ainda veem versão antiga**

**Soluções:**
```bash
# 1. Verificar se nginx foi recarregado
sudo nginx -t && sudo systemctl reload nginx

# 2. Limpar cache do Nginx (se configurado)
sudo find /var/cache/nginx -type f -delete

# 3. Verificar se build-info.json foi atualizado
curl https://mozsolidaria.org/build-info.json
```

### **Problema: Assets não carregam (404)**

```bash
# Verificar se arquivos com hash existem
ls -la /var/www/mozsolidaria/frontend/dist/assets/

# Verificar nginx config
sudo nginx -t

# Ver logs do nginx
sudo tail -f /var/log/nginx/error.log
```

### **Problema: Notificação de atualização não aparece**

```javascript
// Verificar no console do navegador
console.log('Verificando build info...');
fetch('/build-info.json', { cache: 'no-cache' })
  .then(r => r.json())
  .then(info => console.log('Build atual:', info));

// Comparar com localStorage
console.log('Build armazenado:', localStorage.getItem('app-build-id'));
```

### **Problema: Service Worker conflitando**

```javascript
// Limpar todos os service workers (console do navegador)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
}

// Limpar cache do navegador
if ('caches' in window) {
  caches.keys().then(names => 
    names.forEach(name => caches.delete(name))
  );
}
```

---

## 📊 Monitoramento

### **1. Logs de Deploy**

```bash
# Ver últimos deploys
tail -f /var/log/nginx/access.log | grep "build-info.json"

# Ver builds realizados
ls -la /var/www/mozsolidaria/frontend/backups/
```

### **2. Analytics de Cache**

Adicionar no Google Analytics ou similar:

```javascript
// Rastrear atualizações forçadas
gtag('event', 'app_update', {
  'event_category': 'cache_busting',
  'event_label': buildId
});
```

### **3. Alertas Automáticos**

Configurar webhook no script de deploy:

```bash
# No final do deploy-with-cache-busting.sh
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Deploy realizado! Build: $BUILD_ID\"}" \
        "$SLACK_WEBHOOK_URL"
fi
```

---

## 🎯 Resultados Esperados

Após implementação completa:

✅ **Usuários recebem atualizações imediatamente**  
✅ **Notificações automáticas de nova versão**  
✅ **Cache otimizado (performance + atualização)**  
✅ **Compatibilidade com todos os navegadores**  
✅ **Deploy automatizado e confiável**  
✅ **Monitoramento e debugging facilitados**

---

## 📚 Referências

- [Vite Build Options](https://vitejs.dev/config/build-options.html)
- [Nginx Caching Guide](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Desenvolvido para Moz Solidária** 🇲🇿
