# Guia de Aplicação das Melhorias - Sistema de Formulários

## 🎯 Como Aplicar as Melhorias aos Outros Formulários

Este guia mostra como migrar os formulários existentes para usar o novo sistema de validação e componentes melhorados.

## 📝 Exemplo: Migrando CreatePost.tsx

### Antes (Código Original)
```typescript
// CreatePost.tsx - Versão Antiga
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CreatePost: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validação manual e inconsistente
    if (field === 'title' && value.length < 3) {
      setErrors(prev => ({ ...prev, title: 'Título muito curto' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validação manual repetitiva
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Título é obrigatório';
    if (!formData.content) newErrors.content = 'Conteúdo é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submissão...
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Título</label>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
        />
        {errors.title && <span className="text-red-500">{errors.title}</span>}
      </div>
      
      <div>
        <label>Conteúdo</label>
        <Textarea
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
        />
        {errors.content && <span className="text-red-500">{errors.content}</span>}
      </div>
      
      <button type="submit">Criar Post</button>
    </form>
  );
};
```

### Depois (Com Melhorias Aplicadas)
```typescript
// CreatePost.tsx - Versão Melhorada
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, FileText, Settings, Eye, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Imports do sistema melhorado
import { useFormValidation } from '@/hooks/useFormValidation';
import { validationSchemas } from '@/lib/validation';
import { 
  EnhancedInput, 
  EnhancedTextarea, 
  EnhancedSelect,
  FormSection,
  ValidationSummary 
} from '@/components/ui/enhanced-form';
import { createPost, updatePost, fetchPostDetail, isAuthenticated } from '@/lib/api';

// Interface do formulário
interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  meta_description: string;
  tags: string[];
}

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEditing = !!slug;
  const [activeTab, setActiveTab] = useState('content');
  const [loadingData, setLoadingData] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);

  // Dados iniciais do formulário
  const initialFormData: PostFormData = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    status: 'draft',
    is_featured: false,
    meta_description: '',
    tags: []
  };

  // Hook de validação do sistema melhorado
  const {
    formData,
    errors,
    warnings,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    lastSaved,
    updateField,
    updateFields,
    handleSubmit: submitForm,
    reset,
    validateAll,
    getFieldProps,
    getFieldStatus,
    checkUnsavedChanges
  } = useFormValidation({
    initialData: initialFormData,
    validationSchema: validationSchemas.post, // Schema específico para posts
    onSubmit: async (data) => {
      await handleFormSubmit(data, false);
    },
    enableRealTimeValidation: true,
    autosave: {
      enabled: true,
      interval: 2000,
      key: isEditing ? `edit_post_${slug}` : 'create_post'
    }
  });

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para criar posts.');
      navigate('/dashboard?tab=posts');
      return;
    }
  }, [navigate]);

  // Carregar dados do post para edição
  useEffect(() => {
    if (isEditing && slug) {
      const loadPostData = async () => {
        try {
          setLoadingData(true);
          const postData = await fetchPostDetail(slug);
          
          setPostId(postData.id);
          
          const loadedData: PostFormData = {
            title: postData.title || '',
            slug: postData.slug || '',
            content: postData.content || '',
            excerpt: postData.excerpt || '',
            category_id: postData.category?.id?.toString() || '',
            status: postData.status || 'draft',
            is_featured: postData.is_featured || false,
            meta_description: postData.meta_description || '',
            tags: postData.tags || []
          };
          
          updateFields(loadedData);
          toast.success('Dados do post carregados com sucesso!');
        } catch (error) {
          console.error('Erro ao carregar dados do post:', error);
          toast.error('Erro ao carregar dados do post');
          navigate('/dashboard?tab=posts');
        } finally {
          setLoadingData(false);
        }
      };

      loadPostData();
    }
  }, [isEditing, slug, navigate, updateFields]);

  // Auto-gerar slug baseado no título
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      updateField('slug', slug);
    }
  }, [formData.title, updateField, isEditing]);

  // Função principal para submissão
  const handleFormSubmit = async (data: PostFormData, isDraft: boolean = false) => {
    try {
      const submitData = {
        ...data,
        status: isDraft ? 'draft' : data.status
      };

      let response;
      if (isEditing && postId) {
        response = await updatePost(postId, submitData);
        toast.success(`Post ${isDraft ? 'salvo como rascunho' : 'atualizado'} com sucesso!`);
      } else {
        response = await createPost(submitData);
        toast.success(`Post ${isDraft ? 'salvo como rascunho' : 'criado'} com sucesso!`);
      }
      
      navigate('/dashboard?tab=posts');

    } catch (error: any) {
      console.error('Erro ao processar post:', error);
      throw error; // Re-throw para o hook de validação tratar
    }
  };

  // Função para salvar como rascunho
  const handleSaveDraft = async () => {
    try {
      await handleFormSubmit(formData, true);
    } catch (error) {
      // Erro já tratado no handleFormSubmit
    }
  };

  // Loading state
  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isDirty && !checkUnsavedChanges()) return;
                navigate('/dashboard?tab=posts');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Editar Post' : 'Criar Novo Post'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Modifique as informações do post' : 'Preencha as informações para criar um novo post'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {lastSaved && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Salvo {format(lastSaved, 'HH:mm', { locale: ptBR })}
              </Badge>
            )}
            {isDirty && (
              <Badge variant="secondary" className="text-xs">
                Alterações não salvas
              </Badge>
            )}
          </div>
        </div>

        {/* Validation Summary */}
        <ValidationSummary errors={errors} warnings={warnings} />

        {/* Form */}
        <form onSubmit={submitForm} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Config
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo */}
            <TabsContent value="content">
              <FormSection
                title="Conteúdo do Post"
                description="Informações principais do post"
                icon={<FileText className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EnhancedInput
                      {...getFieldProps('title')}
                      label="Título do Post"
                      placeholder="Digite o título do post"
                      showCharCount
                      maxLength={200}
                      required
                      {...getFieldStatus('title')}
                    />

                    <EnhancedInput
                      {...getFieldProps('slug')}
                      label="Slug (URL)"
                      placeholder="url-amigavel-do-post"
                      helpText="URL amigável gerada automaticamente"
                      disabled={isEditing}
                      {...getFieldStatus('slug')}
                    />
                  </div>

                  <EnhancedTextarea
                    {...getFieldProps('excerpt')}
                    label="Resumo"
                    placeholder="Resumo do post para exibição em listas"
                    showCharCount
                    showWordCount
                    maxLength={300}
                    minRows={3}
                    maxRows={5}
                    {...getFieldStatus('excerpt')}
                  />

                  <EnhancedTextarea
                    {...getFieldProps('content')}
                    label="Conteúdo Completo"
                    placeholder="Escreva o conteúdo completo do post"
                    showCharCount
                    showWordCount
                    maxLength={10000}
                    minRows={8}
                    maxRows={20}
                    required
                    {...getFieldStatus('content')}
                  />
                </div>
              </FormSection>
            </TabsContent>

            {/* SEO */}
            <TabsContent value="seo">
              <FormSection
                title="Otimização para Motores de Busca"
                description="Configure meta tags e descrições"
                icon={<Eye className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <EnhancedTextarea
                    {...getFieldProps('meta_description')}
                    label="Meta Descrição"
                    placeholder="Descrição para motores de busca"
                    showCharCount
                    maxLength={160}
                    minRows={3}
                    maxRows={4}
                    helpText="Descrição otimizada para SEO (120-160 caracteres ideal)"
                    {...getFieldStatus('meta_description')}
                  />

                  <EnhancedSelect
                    id="category_id"
                    label="Categoria"
                    placeholder="Selecione uma categoria"
                    value={formData.category_id}
                    onValueChange={(value) => updateField('category_id', value)}
                    options={[
                      { value: '1', label: 'Notícias' },
                      { value: '2', label: 'Eventos' },
                      { value: '3', label: 'Educação' },
                      { value: '4', label: 'Saúde' },
                      { value: '5', label: 'Comunidade' }
                    ]}
                    {...getFieldStatus('category_id')}
                  />
                </div>
              </FormSection>
            </TabsContent>

            {/* Configurações */}
            <TabsContent value="settings">
              <FormSection
                title="Configurações de Publicação"
                description="Status e visibilidade do post"
                icon={<Settings className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <EnhancedSelect
                    id="status"
                    label="Status"
                    value={formData.status}
                    onValueChange={(value) => updateField('status', value)}
                    options={[
                      { value: 'draft', label: 'Rascunho' },
                      { value: 'published', label: 'Publicado' },
                      { value: 'archived', label: 'Arquivado' }
                    ]}
                    {...getFieldStatus('status')}
                  />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Post em Destaque</label>
                      <p className="text-xs text-muted-foreground">
                        Aparece na seção de posts destacados
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => updateField('is_featured', checked)}
                    />
                  </div>
                </div>
              </FormSection>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isValid ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Formulário válido
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {Object.keys(errors).length} erro{Object.keys(errors).length > 1 ? 's' : ''} encontrado{Object.keys(errors).length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Rascunho
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {isEditing ? 'Atualizando...' : 'Criando...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? 'Atualizar Post' : 'Criar Post'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
```

## 🔧 Pontos-Chave da Migração

### 1. Imports Necessários
```typescript
// Sistema de validação
import { useFormValidation } from '@/hooks/useFormValidation';
import { validationSchemas } from '@/lib/validation';

// Componentes melhorados
import { 
  EnhancedInput, 
  EnhancedTextarea, 
  EnhancedSelect,
  FormSection,
  ValidationSummary 
} from '@/components/ui/enhanced-form';
```

### 2. Hook de Validação
```typescript
const {
  formData,           // Estado do formulário
  errors,             // Erros de validação
  warnings,           // Avisos
  touched,            // Campos tocados
  isSubmitting,       // Estado de submissão
  isValid,            // Formulário válido
  isDirty,            // Formulário modificado
  lastSaved,          // Última vez salvo
  updateField,        // Atualizar um campo
  updateFields,       // Atualizar múltiplos campos
  handleSubmit,       // Submeter formulário
  getFieldProps,      // Props para campos
  getFieldStatus,     // Status de validação
  checkUnsavedChanges // Verificar alterações
} = useFormValidation({
  initialData: initialFormData,
  validationSchema: validationSchemas.post,
  onSubmit: handleFormSubmit,
  enableRealTimeValidation: true,
  autosave: {
    enabled: true,
    interval: 2000,
    key: 'unique_form_key'
  }
});
```

### 3. Componentes Melhorados
```typescript
// Input básico melhorado
<EnhancedInput
  {...getFieldProps('title')}      // Props automáticas
  label="Título"
  placeholder="Digite o título"
  showCharCount
  maxLength={200}
  required
  {...getFieldStatus('title')}     // Status de validação
/>

// Textarea com contadores
<EnhancedTextarea
  {...getFieldProps('content')}
  label="Conteúdo"
  showCharCount
  showWordCount
  maxLength={1000}
  minRows={4}
  {...getFieldStatus('content')}
/>

// Select melhorado
<EnhancedSelect
  id="category"
  label="Categoria"
  value={formData.category}
  onValueChange={(value) => updateField('category', value)}
  options={categoryOptions}
  {...getFieldStatus('category')}
/>
```

## 📊 Benefícios da Migração

### ✅ Antes da Migração
- ❌ Validação manual e inconsistente
- ❌ Código duplicado
- ❌ Feedback de erro básico
- ❌ Sem autosave
- ❌ Interface básica

### ✅ Após a Migração
- ✅ Validação automática e consistente
- ✅ Código reutilizável
- ✅ Feedback visual claro
- ✅ Autosave automático
- ✅ Interface moderna e acessível
- ✅ TypeScript completo
- ✅ Melhor UX/UI

## 🔄 Próximas Migrações

### 1. EditPost.tsx
- Aplicar a mesma estrutura
- Usar schema de validação para posts
- Adicionar lógica de carregamento de dados

### 2. CreateDonation.tsx
- Usar schema específico para doações
- Validações monetárias
- Seletor de métodos de pagamento

### 3. LoginForm.tsx
- Schema de validação para login
- Validação em tempo real
- Melhor feedback de erros

## 💡 Dicas Adicionais

### Autosave Configurável
```typescript
autosave: {
  enabled: true,
  interval: 2000,     // 2 segundos
  key: 'unique_key',  // Chave única
  storage: 'localStorage'
}
```

### Validação Customizada
```typescript
// No validation.ts, adicionar:
title: {
  label: 'Título',
  rules: {
    required: true,
    minLength: 3,
    maxLength: 200,
    custom: (value: string) => {
      if (value.includes('spam')) {
        return 'Título não pode conter spam';
      }
      return '';
    }
  }
}
```

### Estados Visuais
```typescript
// Componentes mostram automaticamente:
// - Erros em vermelho
// - Avisos em amarelo
// - Sucessos em verde
// - Contadores de caracteres
// - Indicadores de progresso
```

---

**Resultado**: Sistema de formulários completamente moderno, consistente e reutilizável! 🚀
