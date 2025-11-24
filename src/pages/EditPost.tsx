import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Heart, Settings, Eye, Clock, Trash2, Copy } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { BlogPost, Category, fetchPosts,fetchPostDetail, fetchCategories, updatePost, deletePost, duplicatePost } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditorAsync';
import ImageUpload from '@/components/ImageUpload';
import SEOForm, { SEOFormData } from '@/components/SEOForm';
import HashtagManager from '@/components/HashtagManager';
import { toast } from 'sonner';

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featured_image: string;
  featured_image_caption: string;
  featured_image_credit: string;
  featured_image_source_url: string;
  is_published: boolean;
}

const EditPost: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<PostFormData | null>(null); // Estado para dados iniciais

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featured_image: '',
    featured_image_caption: '',
    featured_image_credit: '',
    featured_image_source_url: '',
    is_published: false,
  });

  // Keep document <title> in sync with the editor H1 (formData.title).
  // This ensures that when a post is duplicated and the H1 is changed,
  // the browser title reflects the new H1 (not the progenitor's title).
  useEffect(() => {
    const siteTitle = 'Moz Solidária';
    try {
      if (formData && formData.title) {
        document.title = `${formData.title} | ${siteTitle}`;
      } else if (post && post.title) {
        document.title = `${post.title} | ${siteTitle}`;
      } else {
        document.title = siteTitle;
      }
    } catch (e) {
      // In non-browser environments or if document is unavailable, ignore
      // This try/catch keeps SSR/build from failing.
    }

    return () => {
      try {
        document.title = 'Moz Solidária';
      } catch (e) {
        // ignore
      }
    };
  }, [formData.title, post]);

  const [seoData, setSeoData] = useState<SEOFormData>({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_type: 'article',
    twitter_title: '',
    twitter_description: '',
    twitter_card: 'summary_large_image',
    noindex: false,
    nofollow: false,
    robots_txt: '',
    hashtags: '',
  });

  const [showSEOForm, setShowSEOForm] = useState(false);

  // Função para verificar se houve mudanças
  const hasChanges = () => {
    if (!initialFormData) return false;
    
    return (
      formData.title !== initialFormData.title ||
      formData.content !== initialFormData.content ||
      formData.excerpt !== initialFormData.excerpt ||
      formData.category !== initialFormData.category ||
      formData.featured_image !== initialFormData.featured_image ||
      formData.featured_image_caption !== initialFormData.featured_image_caption ||
      formData.featured_image_credit !== initialFormData.featured_image_credit ||
      formData.featured_image_source_url !== initialFormData.featured_image_source_url ||
      formData.is_published !== initialFormData.is_published
    );
  };

  useEffect(() => {
    // Verificar se o slug existe antes de tentar carregar dados
    if (!slug) {
      navigate('/dashboard');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        const [postData, categoriesData] = await Promise.all([
          fetchPostDetail(slug), // Usa o slug verificado
          fetchCategories()
        ]);

  const post = postData || null;
        const categories = Array.isArray(categoriesData) ? categoriesData : [];
        
        if (!post) {
          navigate('/dashboard');
          return;
        }

        setPost(post);

        // Preparar dados do formulário incluindo créditos
        // If we navigated here after duplicating a post, the navigation state may include
        // an overrideTitle (data.original_title) that preserves the original post title.
  // Prefer that when initializing the editor so users don't see the backend's "[Copia]" prefix.
  // extract overrideTitle from react-router location.state (location is from component scope)
        const initialData = {
          title: (location && (location.state as any)?.overrideTitle) || post.title || '',
          content: post.content ?? '',
          excerpt: post.excerpt ?? '',
          category: post.category?.id?.toString() ?? 
            (typeof post.category === 'string' ? post.category : ''),
          featured_image: post.featured_image_url ?? post.featured_image ?? '',
          featured_image_caption: post.featured_image_caption ?? '',
          featured_image_credit: post.featured_image_credit ?? '',
          featured_image_source_url: post.featured_image_source_url ?? '',
          is_published: !!(post.is_published ?? (post.status === 'published')),
        };

        setFormData(initialData);
        setInitialFormData(initialData); // Salvar estado inicial para comparação
        
        // Inicializar dados SEO
        setSeoData({
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || '',
          meta_keywords: post.meta_keywords || '',
          focus_keyword: post.focus_keyword || '',
          canonical_url: post.canonical_url || '',
          og_title: post.og_title || '',
          og_description: post.og_description || '',
          og_type: post.og_type || 'article',
          twitter_title: post.twitter_title || '',
          twitter_description: post.twitter_description || '',
          twitter_card: post.twitter_card || 'summary_large_image',
          noindex: post.noindex || false,
          nofollow: post.nofollow || false,
          robots_txt: post.robots_txt || '',
          hashtags: post.hashtags || '',
        });
        
        setCategories(categories);
      } catch (error) {
        setError('Erro ao carregar os dados do post. Verifique se o post existe.');
        // Não navegar automaticamente para permitir que o usuário veja o erro
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, user, navigate, location]); // Adicionado slug e location nas dependências

  // Auto-save functionality - modificado para ser mais inteligente
  useEffect(() => {
    if (
      post &&
      initialFormData &&
      hasChanges() &&
      typeof formData.content === "string" &&
      typeof initialFormData.content === "string"
    ) {
      const autoSaveTimer = setTimeout(() => {
        localStorage.setItem(`edit_post_${slug}`, JSON.stringify(formData));
        setLastSaved(new Date());
      }, 3000); // Aumentado para 3 segundos para evitar salvamentos excessivos

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData, post, slug, initialFormData]);

  const handleSubmit = async (e: React.FormEvent, publishNow?: boolean) => {
    e.preventDefault();
    if (!post || !slug) return;

    // Verificação: categoria obrigatória
    if (!formData.category) {
      toast.error('Selecione uma categoria antes de publicar ou salvar o post.');
      return;
    }

    // Verificar se há mudanças a serem salvas
    if (!hasChanges() && publishNow === undefined) {
      toast.info('Nenhuma alteração foi feita no post.');
      return;
    }

    setSaving(true);

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category ? parseInt(formData.category) : null,
        featured_image: formData.featured_image || null,
        featured_image_caption: formData.featured_image_caption,
        featured_image_credit: formData.featured_image_credit,
        featured_image_source_url: formData.featured_image_source_url,
        // Corrigir lógica de status
        status: publishNow !== undefined 
          ? (publishNow ? 'published' : 'draft')
          : (formData.is_published ? 'published' : 'draft'),
        is_published: publishNow !== undefined ? publishNow : formData.is_published,
  // Adicionar dados SEO (garantir que meta_title receba o título do editor se estiver vazio)
  meta_title: (seoData.meta_title && seoData.meta_title.trim()) ? seoData.meta_title : formData.title,
        meta_description: seoData.meta_description,
        meta_keywords: seoData.meta_keywords,
        focus_keyword: seoData.focus_keyword,
        canonical_url: seoData.canonical_url,
        og_title: seoData.og_title,
        og_description: seoData.og_description,
        og_type: seoData.og_type,
        twitter_title: seoData.twitter_title,
        twitter_description: seoData.twitter_description,
        twitter_card: seoData.twitter_card,
        noindex: seoData.noindex,
        nofollow: seoData.nofollow,
        robots_txt: seoData.robots_txt,
        hashtags: seoData.hashtags,
      };

      await updatePost(slug, postData); // Usar slug verificado
      
      // Clear auto-save after successful update
      localStorage.removeItem(`edit_post_${slug}`);
      
      // Atualizar o post local e dados iniciais
      const updatedPost = {
        ...post,
        ...postData,
        featured_image: postData.featured_image || undefined,
        category: categories.find(c => c.id === parseInt(formData.category)) || post.category,
        status: postData.status as "published" | "draft" | "archived"
      };
      
      setPost(updatedPost);
      setInitialFormData({ ...formData }); // Atualizar dados iniciais
      
      // Mostrar mensagem de sucesso
      const message = publishNow !== undefined 
        ? (publishNow ? 'Post publicado com sucesso!' : 'Post despublicado com sucesso!')
        : 'Alterações salvas com sucesso!';
        
      toast.success(message);
      
      // Só navegar se for publicação/despublicação, não para salvamento simples
      if (publishNow !== undefined) {
        navigate('/dashboard', { 
          state: { message } 
        });
      }
    } catch (error) {
      toast.error('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !slug) return; // Verificar se slug existe

    try {
      await deletePost(slug); // Usar slug verificado
      localStorage.removeItem(`edit_post_${slug}`);
      navigate('/dashboard', { 
        state: { 
          message: 'Post excluído com sucesso!' 
        } 
      });
    } catch (error) {
      // Error handled by toast
    }
  };

  const handleDuplicatePost = async () => {
    if (!post || !slug) return; // Verificar se slug existe

    try {
      const result = await duplicatePost(slug); // Usar slug verificado
      toast.success('Post duplicado com sucesso!');
      
      // Navigate to edit the duplicated post
      navigate(`/dashboard/posts/edit/${result.duplicated_post.slug}`, {
        state: { overrideTitle: result.original_title || null }
      });
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao duplicar post');
    }
  };

  const handleCancel = () => {
    const hasUnsavedChanges = hasChanges();
    
    if (hasUnsavedChanges) {
      const userConfirmed = window.confirm(
        'Você tem alterações não salvas. Deseja salvar antes de sair?'
      );
      
      if (userConfirmed) {
        // Tentar salvar antes de sair
        handleSubmit(new Event('submit') as any)
          .then(() => {
            navigate('/dashboard');
          })
          .catch(() => {
            const forceExit = window.confirm(
              'Erro ao salvar. Deseja sair mesmo assim perdendo as alterações?'
            );
            if (forceExit) {
              navigate('/dashboard');
            }
          });
        return;
      } else {
        const confirmExit = window.confirm(
          'Tem certeza que deseja sair sem salvar as alterações?'
        );
        if (!confirmExit) return;
      }
    }

    // Limpar auto-save ao sair
    localStorage.removeItem(`edit_post_${slug}`);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Loading 
        variant="fullscreen" 
        message="Carregando post..." 
        size="lg" 
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erro ao Carregar Post</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Slug fornecido: {slug || 'undefined'}</p>
            <p>Verifique se a URL está correta: /dashboard/posts/edit/[slug]</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">Post Não Encontrado</h1>
          <p className="text-muted-foreground mb-6">O post que você está tentando editar não foi encontrado.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex h-14 md:h-16 items-center px-3 md:px-6">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-sm md:text-xl font-bold hidden sm:block">MOZ SOLIDÁRIA - Dashboard</h1>
              <h1 className="text-sm font-bold sm:hidden">MOZ Dashboard</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Eye className="h-4 w-4 mr-2" />
              Ver Site
            </Button>
            <Button variant="outline" size="sm" className="md:hidden px-2">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" className="hidden md:flex">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button size="sm" className="md:hidden px-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-3 md:p-6">
        {/* Header da página */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Dashboard</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold">Editar Post</h1>
              <p className="text-muted-foreground">
                {post && `ID: ${post.id} • Criado em ${new Date(post.created_at).toLocaleDateString()}`}
                {hasChanges() && (
                  <span className="text-orange-600 ml-2">• Alterações não salvas</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {lastSaved && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Salvo {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Editar' : 'Preview'}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Post</CardTitle>
                <CardDescription>
                  Edite e formate o conteúdo do seu post • Use o modo tela cheia para uma melhor experiência de edição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showPreview ? (
                  <>
                    <div>
                      <Label htmlFor="title">Título do Post</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Digite um título atrativo..."
                        className="text-lg font-medium"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Resumo</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Breve descrição do post (aparecerá na lista de posts)..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <RichTextEditor
                        label="Conteúdo"
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        placeholder="Edite o conteúdo do seu post aqui..."
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{formData.title}</h1>
                      {formData.excerpt && (
                        <p className="text-lg text-muted-foreground mb-4">{formData.excerpt}</p>
                      )}
                      {/* Exibe imagem destacada se existir, seja URL ou upload */}
                      {formData.featured_image && (
                        <img 
                          src={formData.featured_image}
                          alt="Imagem destacada"
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                      )}
                      {/* Exibe conteúdo HTML do editor */}
                      <div 
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de Configurações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
                <CardDescription>
                  Gerencie a publicação do post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={(e) => handleSubmit(e)}
                    disabled={saving || !formData.title || !formData.content || !hasChanges()}
                    className="w-full"
                    variant={hasChanges() ? "default" : "secondary"}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : hasChanges() ? 'Salvar Alterações' : 'Sem Alterações'}
                  </Button>
                  
                  {!formData.is_published && (
                    <Button
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={saving || !formData.title || !formData.content}
                      variant="outline"
                      className="w-full"
                    >
                      {saving ? 'Publicando...' : 'Publicar Agora'}
                    </Button>
                  )}
                  
                  {formData.is_published && (
                    <Button
                      onClick={(e) => handleSubmit(e, false)}
                      disabled={saving}
                      variant="outline"
                      className="w-full"
                    >
                      {saving ? 'Despublicando...' : 'Despublicar'}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleDuplicatePost}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar Post
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Post
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O post "{formData.title}" será permanentemente excluído.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Categoria <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required // Adicionado para acessibilidade, mas validação é feita no handleSubmit
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <ImageUpload
                    value={formData.featured_image}
                    onChange={(url) => setFormData({ ...formData, featured_image: url })}
                    onClear={() => setFormData({ 
                      ...formData, 
                      featured_image: '',
                      featured_image_caption: '',
                      featured_image_credit: '',
                      featured_image_source_url: ''
                    })}
                    label="Imagem Destacada"
                    showCredits={true}
                    caption={formData.featured_image_caption}
                    credit={formData.featured_image_credit}
                    sourceUrl={formData.featured_image_source_url}
                    onCaptionChange={(caption) => setFormData({ ...formData, featured_image_caption: caption })}
                    onCreditChange={(credit) => setFormData({ ...formData, featured_image_credit: credit })}
                    onSourceUrlChange={(url) => setFormData({ ...formData, featured_image_source_url: url })}
                  />
                  
                  <div className="mt-3 pt-3 border-t">
                    <Label htmlFor="featured_image_url" className="text-sm text-muted-foreground">
                      Ou cole uma URL de imagem
                    </Label>
                    <Input
                      id="featured_image_url"
                      type="url"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <Label htmlFor="is_published">Post publicado</Label>
                </div>
              </CardContent>
            </Card>

            {/* SEO Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>SEO & Otimização</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSEOForm(!showSEOForm)}
                  >
                    {showSEOForm ? 'Ocultar' : 'Configurar SEO'}
                  </Button>
                </CardTitle>
                {!showSEOForm && (
                  <CardDescription>
                    Configure meta tags, Open Graph e otimizações para motores de busca
                  </CardDescription>
                )}
              </CardHeader>
              {showSEOForm && (
                <CardContent className="p-0">
                  <SEOForm
                    data={seoData}
                    onChange={setSeoData}
                    postTitle={formData.title}
                    postContent={formData.content}
                  />
                </CardContent>
              )}
            </Card>

            {/* Hashtag Manager */}
            <HashtagManager
              hashtags={seoData.hashtags || ''}
              onChange={(hashtags) => setSeoData({ ...seoData, hashtags })}
              contentText={formData.content + ' ' + formData.title + ' ' + formData.excerpt}
            />

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Palavras:</span>
                    <Badge variant="secondary">
                      {typeof formData.content === "string"
                        ? formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length
                        : 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Caracteres:</span>
                    <Badge variant="secondary">
                      {typeof formData.content === "string"
                        ? formData.content.replace(/<[^>]*>/g, '').length
                        : 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={formData.is_published ? "default" : "secondary"}>
                      {formData.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Categoria:</span>
                    <Badge variant={formData.category ? "default" : "destructive"}>
                      {formData.category || 'Não definida'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Alterações:</span>
                    <Badge variant={hasChanges() ? "destructive" : "secondary"}>
                      {hasChanges() ? 'Não salvas' : 'Salvas'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
