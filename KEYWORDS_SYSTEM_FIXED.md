# Sistema de Meta Keywords - Documentação

## ✅ PROBLEMA CORRIGIDO!

O sistema agora **prioriza as palavras-chave específicas inseridas no formulário** em vez de usar palavras genéricas.

## 🔧 Como Funciona Agora

### 1. **PRIORIDADE 1: Meta Keywords Específicas (Formulário)**
- Campo **"Palavras-chave (Meta Keywords)"** no formulário SEO
- O usuário insere palavras específicas do post
- Exemplo: `"educação cabo delgado, programas educacionais moçambique, transformação social comunitária"`

### 2. **FALLBACK: Geração Automática** 
- Só é usado se não há meta_keywords específicas
- Combina: Focus Keyword + Categoria + Tags

## 📝 Interface do Formulário

```typescript
interface SEOFormData {
  meta_keywords?: string;  // ← NOVO CAMPO ADICIONADO
  focus_keyword?: string;
  // ... outros campos
}
```

## 🎯 Exemplo Prático

### **Antes (Palavras Genéricas):**
```html
<meta name="keywords" content="moçambique, cabo delgado, ong, solidariedade">
```

### **Agora (Palavras Específicas do Post):**
```html
<meta name="keywords" content="educação cabo delgado, programas educacionais moçambique, transformação social comunitária, desenvolvimento sustentável, ensino inovador áfrica">
```

## 🔄 Lógica de Funcionamento

```typescript
// No SEOHead.tsx
if (post?.meta_keywords && post.meta_keywords.trim()) {
  // 1. USAR keywords específicas do formulário
  keywordsToUse = post.meta_keywords.trim();
} else if (post?.focus_keyword) {
  // 2. FALLBACK: gerar automaticamente
  // focus_keyword + categoria + tags
}
```

## 📋 Como Usar

1. **Editar Post**: Acesse o formulário de edição
2. **Seção SEO**: Encontre o campo "Palavras-chave (Meta Keywords)"
3. **Inserir Keywords**: Digite palavras específicas separadas por vírgula
4. **Exemplo**: `educação moçambique, cabo delgado desenvolvimento, programas sociais`
5. **Salvar**: As keywords aparecerão nas meta tags HTML

## 🧪 Como Verificar

### Opção 1: Desenvolvedor Tools
1. Acesse a página do post
2. F12 → Elements
3. Procure por `<meta name="keywords"`

### Opção 2: SEO Debugger
1. Vá para `/seo-test`
2. Veja a seção "Meta Keywords Detectadas"
3. Verifique se as palavras específicas aparecem

## ✅ Status dos Componentes

- ✅ **SEOForm.tsx**: Campo meta_keywords adicionado
- ✅ **SEOHead.tsx**: Lógica atualizada para priorizar meta_keywords
- ✅ **Interface BlogPost**: Campo meta_keywords incluído
- ✅ **MetaKeywordsTest**: Teste específico criado
- ✅ **Backend Django**: Campo já existia no modelo

## 🎉 Resultado

Agora as **palavras-chave são específicas de cada post** e vêm diretamente do formulário SEO, não mais palavras genéricas!
