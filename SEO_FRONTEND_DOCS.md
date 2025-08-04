# Sistema SEO - Documentação Frontend

## Visão Geral

O sistema SEO do frontend está integrado com o backend Django e oferece uma experiência completa de otimização para motores de busca.

## Componentes

### 1. SEOForm

Formulário completo para configuração de SEO durante a criação/edição de posts.

**Localização:** `src/components/SEOForm.tsx`

**Funcionalidades:**
- Interface com abas (Geral, Redes Sociais, Avançado)
- Análise em tempo real de título e meta descrição
- Preview do Google
- Auto-preenchimento de dados sociais
- Configurações de indexação

**Uso:**
```tsx
import SEOForm, { SEOFormData } from '@/components/SEOForm';

const [seoData, setSeoData] = useState<SEOFormData>({
  meta_title: '',
  meta_description: '',
  focus_keyword: '',
  // ... outros campos
});

<SEOForm
  data={seoData}
  onChange={setSeoData}
  postTitle={formData.title}
  postContent={formData.content}
/>
```

### 2. SEOHead

Componente para gestão de meta tags na página.

**Localização:** `src/components/SEOHead.tsx`

**Funcionalidades:**
- Meta tags básicas (title, description)
- Open Graph para Facebook
- Twitter Cards
- Schema.org JSON-LD
- Canonical URLs
- Meta robots (noindex, nofollow)

**Uso:**
```tsx
import SEOHead from '@/components/SEOHead';

<SEOHead 
  post={post}
  title="Título customizado"
  description="Descrição customizada"
  image="/imagem.jpg"
  type="article"
/>
```

### 3. SEOAnalysis

Componente para exibir análise SEO e recomendações.

**Localização:** `src/components/SEOAnalysis.tsx`

**Funcionalidades:**
- Score SEO visual
- Análise de legibilidade
- Checklist de fatores SEO
- Recomendações personalizadas
- Estatísticas do post

**Uso:**
```tsx
import SEOAnalysis from '@/components/SEOAnalysis';

<SEOAnalysis post={post} />
```

## Integração com CreatePost

O formulário de criação de posts (`src/pages/CreatePost.tsx`) foi atualizado para incluir:

1. **Estado SEO:** Novo estado `seoData` para armazenar configurações SEO
2. **Formulário SEO:** Seção recolhível com todas as configurações
3. **Envio de dados:** Inclusão automática dos dados SEO no payload

### Campos SEO enviados:

```typescript
{
  // Campos básicos
  meta_title: string,
  meta_description: string,
  focus_keyword: string,
  canonical_url: string,
  
  // Open Graph
  og_title: string,
  og_description: string,
  og_type: string,
  
  // Twitter
  twitter_title: string,
  twitter_description: string,
  twitter_card: string,
  
  // Configurações avançadas
  noindex: boolean,
  nofollow: boolean
}
```

## Integração com BlogDetail

A página de detalhes do blog (`src/pages/BlogDetail.tsx`) foi atualizada para:

1. **SEO Head:** Inclusão automática do componente SEOHead
2. **Dados dinâmicos:** Uso dos dados SEO do post para meta tags
3. **Fallbacks:** Valores padrão quando dados SEO não existem

## Interface TypeScript

A interface `BlogPost` em `src/lib/api.ts` foi estendida com todos os campos SEO:

```typescript
interface BlogPost {
  // ... campos existentes
  
  // Campos SEO
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_type?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_card?: string;
  seo_score?: number;
  readability_score?: number;
  read_time?: number;
  views_count?: number;
  noindex?: boolean;
  nofollow?: boolean;
}
```

## Fluxo de Trabalho

### 1. Criação de Post
1. Usuário preenche conteúdo básico
2. Clica em "Configurar SEO"
3. Preenche dados SEO nas abas
4. Visualiza preview e análise em tempo real
5. Salva o post com todos os dados

### 2. Visualização do Post
1. Sistema carrega dados SEO do backend
2. SEOHead injeta meta tags apropriadas
3. Motores de busca indexam com otimizações
4. Redes sociais usam dados Open Graph/Twitter

### 3. Análise e Melhorias
1. SEOAnalysis mostra pontuação atual
2. Lista recomendações específicas
3. Usuário pode editar e melhorar
4. Sistema recalcula scores automaticamente

## Características Técnicas

### Responsividade
- Todos os componentes são totalmente responsivos
- Interface adaptada para desktop e mobile
- Formulários otimizados para touch

### Performance
- Componentes otimizados com React.memo onde necessário
- Lazy loading de dados não críticos
- Debounce em análises em tempo real

### Acessibilidade
- Todas as interfaces seguem padrões WCAG
- Navegação por teclado completa
- Screen reader friendly

### SEO Técnico
- Meta tags dinâmicas
- Schema.org estruturado
- Open Graph completo
- Twitter Cards otimizados
- Canonical URLs
- Meta robots apropriados

## Próximos Passos

1. **Testes:** Implementar testes unitários para componentes SEO
2. **Analytics:** Integrar Google Analytics para tracking
3. **Sitemap:** Gerar sitemap.xml automaticamente
4. **Rich Snippets:** Expandir Schema.org com mais tipos
5. **Performance:** Implementar lazy loading de imagens
6. **A/B Testing:** Sistema para testar diferentes títulos/descrições

## Suporte e Troubleshooting

### Problemas Comuns

1. **Meta tags não aparecem**
   - Verificar se SEOHead está incluído na página
   - Confirmar se dados SEO estão sendo carregados do backend

2. **Preview não funciona**
   - Verificar se dados estão sendo passados corretamente
   - Confirmar se componente está recebendo props atualizadas

3. **Scores não calculam**
   - Verificar se backend está retornando seo_score
   - Confirmar se análise está sendo executada

### Debug

Para debugar problemas SEO:

1. Abrir DevTools do navegador
2. Verificar aba "Elements" para meta tags
3. Conferir aba "Network" para chamadas da API
4. Usar Facebook Debugger para Open Graph
5. Usar Twitter Card Validator para Twitter Cards

## Configuração de Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificar tipos TypeScript
npm run type-check
```

## Conclusão

O sistema SEO frontend está completamente integrado e pronto para uso. Ele oferece uma experiência rica para criação de conteúdo otimizado e visualização com todas as otimizações necessárias para motores de busca e redes sociais.
