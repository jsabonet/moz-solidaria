import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Clock, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { Category, fetchCategories, createPost } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditorAsync';
import ImageUpload from '@/components/ImageUpload';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

  useEffect(() => {
    if (!user) {
      navigate('/dashboard');
      return;
    }

    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesData = await fetchCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([]); // Ensure categories is always an array
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [user, navigate]);

  // Auto-save functionality
  useEffect(() => {
    if (formData.title || formData.content) {
      const autoSaveTimer = setTimeout(() => {
        localStorage.setItem('draft_post', JSON.stringify(formData));
        setLastSaved(new Date());
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft_post');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
      } catch (error) {
        console.error('Erro ao carregar rascunho:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent, publishNow: boolean = false) => {
    e.preventDefault();
    setSaving(true);

    // Verificação: categoria obrigatória
    if (!formData.category) {
      alert('Selecione uma categoria antes de publicar ou salvar o post.');
      setSaving(false);
      return;
    }

    try {
      // Prevent submitting a blob URL as featured_image (local preview, not uploaded)
      if (formData.featured_image && formData.featured_image.startsWith('blob:')) {
        alert('Por favor, faça upload de uma imagem real antes de publicar o post.');
        setSaving(false);
        return;
      }

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
        status: publishNow ? 'published' : 'draft',
        is_published: publishNow,
      };

      console.log('Sending post data:', postData);

      await createPost(postData);
      
      // Clear draft after successful creation
      localStorage.removeItem('draft_post');
      
      navigate('/dashboard', { 
        state: { 
          message: publishNow ? 'Post publicado com sucesso!' : 'Post salvo como rascunho!' 
        } 
      });
    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert('Erro ao criar post. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = formData.title || formData.content || formData.excerpt;
    
    if (hasChanges) {
      const confirmLeave = window.confirm(
        'Você tem alterações não salvas. Deseja realmente sair? Suas alterações serão salvas como rascunho.'
      );
      if (!confirmLeave) return;
    }

    navigate('/dashboard');
  };

  const clearDraft = () => {
    const confirmClear = window.confirm('Tem certeza que deseja limpar todo o conteúdo?');
    if (confirmClear) {
      setFormData({
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
      localStorage.removeItem('draft_post');
    }
  };

  if (!user) {
    return null;
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
        <div className="container mx-auto px-4 py-8">
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
                <h1 className="text-2xl font-bold">Criar Novo Post</h1>
                <p className="text-muted-foreground">
                  Crie conteúdo incrível para o seu blog
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
                    Escreva e formate o conteúdo do seu post • Use F11 ou o botão de tela cheia para uma melhor experiência de edição
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
                          placeholder="Comece a escrever seu post aqui..."
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{formData.title || 'Título do Post'}</h1>
                        {formData.excerpt && (
                          <p className="text-lg text-muted-foreground mb-4">{formData.excerpt}</p>
                        )}
                        {formData.featured_image && (
                          <div className="mb-4">
                            <img 
                              src={formData.featured_image} 
                              alt={formData.featured_image_caption || "Imagem destacada"} 
                              className="w-full h-64 object-cover rounded-lg mb-2"
                            />
                            {/* Mostrar créditos na preview */}
                            {(formData.featured_image_caption || formData.featured_image_credit) && (
                              <div className="text-sm text-muted-foreground space-y-1">
                                {formData.featured_image_caption && (
                                  <p className="font-medium">{formData.featured_image_caption}</p>
                                )}
                                {formData.featured_image_credit && (
                                  <p>📸 {formData.featured_image_credit}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
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
                  <CardTitle>Publicação</CardTitle>
                  <CardDescription>
                    Configure as opções de publicação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={saving || !formData.title || !formData.content}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Publicando...' : 'Publicar Agora'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => handleSubmit(e, false)}
                      disabled={saving || !formData.title}
                      className="w-full"
                    >
                      {saving ? 'Salvando...' : 'Salvar como Rascunho'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={clearDraft}
                      size="sm"
                      className="w-full"
                    >
                      Limpar Tudo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Categoria <span className="text-red-500">*</span></Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        disabled={loadingCategories}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            loadingCategories 
                              ? "Carregando categorias..." 
                              : categories.length === 0 
                                ? "Nenhuma categoria disponível"
                                : "Selecione uma categoria"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingCategories ? (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          ) : categories.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              Nenhuma categoria encontrada
                            </SelectItem>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                            </SelectItem>
                            ))
                          )}
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Palavras:</span>
                      <Badge variant="secondary">
                        {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Caracteres:</span>
                      <Badge variant="secondary">
                        {formData.content.replace(/<[^>]*>/g, '').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Categoria:</span>
                      <Badge variant={formData.category ? "default" : "destructive"}>
                        {formData.category ? 
                          categories.find(cat => cat.id.toString() === formData.category)?.name || 'Categoria inválida' 
                          : 'Não definida'
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Imagem Principal:</span>
                      <Badge variant={formData.featured_image ? "default" : "secondary"}>
                        {formData.featured_image ? 'Definida' : 'Não definida'}
                      </Badge>
                    </div>
                    {formData.featured_image && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Legenda:</span>
                          <Badge variant={formData.featured_image_caption ? "default" : "secondary"}>
                            {formData.featured_image_caption ? 'Sim' : 'Não'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Crédito:</span>
                          <Badge variant={formData.featured_image_credit ? "default" : "secondary"}>
                            {formData.featured_image_credit ? 'Sim' : 'Não'}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
