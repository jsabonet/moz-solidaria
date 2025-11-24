import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import PostKeywords from "@/components/PostKeywords";
import PostHashtags from "@/components/PostHashtags";
import SocialInteractions from "@/components/SocialInteractions";
import Comments from "@/components/Comments";
import { Calendar, User, ArrowLeft, Share2, Heart, MessageCircle, ArrowRight, Clock, TrendingUp, Eye, Bookmark, Menu, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { fetchPostDetail, fetchAllPosts } from "@/lib/api";

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Função para atualizar post com dados sociais
  // Função para atualizar post com dados sociais (merge parcial)
  const handlePostUpdate = (updatedPost: any) => {
    setPost((prev: any) => {
      if (!prev) return updatedPost;
      // Se updatedPost contém apenas campos parciais (ex: likes_count), mesclar
      return {
        ...prev,
        ...updatedPost,
      };
    });
  };

  // Função para atualizar contagem de comentários
  const handleCommentsUpdate = (count: number) => {
    setPost((prev: any) => prev ? { ...prev, comments_count: count } : null);
  };

  useEffect(() => {
    async function loadData() {
      if (!slug) {
        return;
      }
      
      try {
        setLoading(true);
        
        const [postData, postsData] = await Promise.all([
          fetchPostDetail(slug),
          fetchAllPosts() // Buscar TODOS os posts para relacionados
        ]);

        // Verificar se o post existe e está publicado
        if (!postData || Object.keys(postData).length === 0) {
          setError("Artigo não encontrado.");
          setPost(null);
        } else if (postData.status !== 'published' && !postData.is_published) {
          setError("Artigo não encontrado.");
          setPost(null);
        } else {
          setPost(postData);
        }
        
        // Garantir que postsData é um array e filtrar apenas posts publicados
        const posts = Array.isArray(postsData) ? postsData : [];
        
        const publishedPosts = posts.filter(p => 
          p.status === 'published' || p.is_published === true
        );
        
        const related = publishedPosts
          .filter((p: any) => p.slug !== slug)
          .sort((a: any, b: any) => {
            // Ordenar por mais visualizados primeiro
            const viewsA = a.views_count || 0;
            const viewsB = b.views_count || 0;
            if (viewsB !== viewsA) return viewsB - viewsA;
            
            // Se empate, ordenar por mais recentes
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
          .slice(0, 6); // Pegar apenas os 6 posts mais relevantes
        setRelatedPosts(related);
        
      } catch (err: any) {
        setError("Erro ao carregar o artigo");
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [slug]);

  // Ensure the browser <title> follows the post H1 (prefer meta_title when available).
  useEffect(() => {
    const siteTitle = 'Moz Solidária';
    try {
      if (post) {
        const pageTitle = post.meta_title && post.meta_title.trim() ? post.meta_title : post.title || siteTitle;
        document.title = `${pageTitle} | ${siteTitle}`;
      } else {
        document.title = siteTitle;
      }
    } catch (e) {
      // ignore
    }

    return () => {
      try { document.title = 'Moz Solidária'; } catch (e) { /* ignore */ }
    };
  }, [post?.title, post?.meta_title]);

  // Função para processar URL da imagem
  const getImageUrl = (imageData: any, fallbackUrl?: string) => {
    
  // If VITE_API_URL isn't provided at build time, use the runtime origin (the host serving the assets)
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || (typeof window !== 'undefined' && window.location?.origin.includes('mozsolidaria.org') ? 'https://mozsolidaria.org' : (typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:8000'));
    
    // Se imageData é uma string (URL)
    if (typeof imageData === 'string') {
      // Se já é uma URL completa
      if (imageData.startsWith('http')) {
        return imageData;
      }
      // Se é um caminho relativo, construir URL completa
      if (imageData.startsWith('/')) {
        const fullUrl = `${API_BASE}${imageData}`;
        return fullUrl;
      }
      // Se é apenas o nome do arquivo
      const fullUrl = `${API_BASE}/media/${imageData}`;
      return fullUrl;
    }
    
    // Se é um objeto com propriedades de imagem
    if (typeof imageData === 'object' && imageData) {
      if (imageData.url) {
        return imageData.url;
      }
      if (imageData.featured_image_url) {
        return imageData.featured_image_url;
      }
    }
    
    // Fallback
    if (fallbackUrl) {
      return fallbackUrl;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <span>Carregando artigo...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-500">Artigo não encontrado</h1>
          <p className="text-muted-foreground mt-4">{error || "O artigo que você procura não existe."}</p>
          <Link to="/blog">
            <Button className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      <SEOHead 
        post={post}
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        image={getImageUrl(post.featured_image, null)}
        type="article"
      />
      <Header />
      
      {/* Breadcrumb */}
      <section className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-[1440px]">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[200px] lg:max-w-[400px]">{post.title}</span>
            </div>
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero do artigo */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Categoria e data */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {post.category?.name || 'Sem categoria'}
              </Badge>
              <div className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground gap-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  <span>
                    {post.read_time && post.read_time > 0 
                      ? `${post.read_time} min`
                      : '5 min'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{post.views_count || 0} visualizações</span>
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>

            {/* Resumo */}
            {post.excerpt && (
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Autor e ações */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                  {(post.author?.username || post.author?.full_name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-sm md:text-base">{post.author?.username || post.author?.full_name || 'Autor'}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Autor</div>
                </div>
              </div>
              
              {/* Componente de interações sociais integrado */}
              <div className="min-w-0">
                <SocialInteractions 
                  post={{
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    likes_count: post.likes_count || 0,
                    shares_count: post.shares_count || 0,
                    comments_count: post.comments_count || 0,
                    is_liked_by_user: post.is_liked_by_user || false,
                  }}
                  onUpdate={handlePostUpdate}
                  showComments={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Imagem principal em largura total */}
      {(post.featured_image || post.featured_image_url) && (
        <section className="py-0">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {(() => {
                const imageUrl = getImageUrl(post.featured_image, post.featured_image_url);
                
                if (!imageUrl) {
                  return null;
                }
                
                return (
                  <div className="relative aspect-video md:aspect-[21/9] overflow-hidden rounded-lg shadow-xl">
                    <img
                      src={imageUrl}
                      alt={post.featured_image_caption || post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                    {post.featured_image_caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white text-xs md:text-sm">{post.featured_image_caption}</p>
                        {post.featured_image_credit && (
                          <p className="text-white/80 text-xs mt-1">Crédito: {post.featured_image_credit}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Layout de duas colunas: Conteúdo principal + Sidebar */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Botão toggle da sidebar - Apenas mobile */}
            <div className="lg:hidden mb-6 sticky top-16 z-30 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 shadow-sm border-b">
              <Button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                variant={sidebarOpen ? "default" : "outline"}
                className="w-full justify-between group"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  {sidebarOpen ? (
                    <>
                      <X className="h-5 w-5" />
                      Fechar menu
                    </>
                  ) : (
                    <>
                      <Menu className="h-5 w-5" />
                      Ver menu lateral
                      <Badge variant="secondary" className="ml-2">
                        {relatedPosts.length > 0 ? '4 itens' : '3 itens'}
                      </Badge>
                    </>
                  )}
                </span>
                <ArrowRight className={`h-5 w-5 transition-transform duration-300 ${sidebarOpen ? 'rotate-90' : ''}`} />
              </Button>
            </div>
            
            <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
              
              {/* Coluna principal - Conteúdo do artigo */}
              <div className="min-w-0">
                {/* Conteúdo do artigo */}
                <article className="prose prose-lg max-w-none mb-12">
                  <div 
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    className="space-y-6 text-foreground leading-relaxed 
                      [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-foreground 
                      [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-foreground 
                      [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-base
                      [&>ul]:my-4 [&>ul>li]:mb-2 [&>ul>li]:ml-6 
                      [&>ol]:my-4 [&>ol>li]:mb-2 [&>ol>li]:ml-6
                      [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:bg-muted/30 [&>blockquote]:py-4 [&>blockquote]:my-6 [&>blockquote]:rounded-r
                      [&>blockquote>cite]:block [&>blockquote>cite]:mt-2 [&>blockquote>cite]:text-sm [&>blockquote>cite]:text-muted-foreground [&>blockquote>cite]:not-italic
                      [&>img]:rounded-lg [&>img]:my-6 [&>img]:shadow-md
                      [&>a]:text-primary [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary/80"
                  />
                </article>

                {/* Keywords e Hashtags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <PostKeywords post={post} />
                  <PostHashtags post={post} />
                </div>

                <Separator className="my-8" />

                {/* Componente de interações sociais principal */}
                <div className="mb-8">
                  <SocialInteractions 
                    post={{
                      id: post.id,
                      slug: post.slug,
                      title: post.title,
                      likes_count: post.likes_count || 0,
                      shares_count: post.shares_count || 0,
                      comments_count: post.comments_count || 0,
                      is_liked_by_user: post.is_liked_by_user || false,
                    }}
                    onUpdate={handlePostUpdate}
                    showComments={true}
                  />
                </div>

                {/* Seção de comentários */}
                <Comments 
                  postSlug={post.slug}
                  commentsCount={post.comments_count || 0}
                  onCommentsUpdate={handleCommentsUpdate}
                />
              </div>

              {/* Sidebar direita - Sticky no desktop, colapsável no mobile */}
              <aside className={`
                lg:sticky lg:top-24 lg:self-start lg:block 
                space-y-6 h-fit
                transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'block animate-in slide-in-from-top-4 fade-in duration-300' : 'hidden'}
              `}>
                
                {/* Card do Autor */}
                <Card className="overflow-hidden border-2 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Sobre o Autor
                    </h3>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {(post.author?.username || post.author?.full_name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-base">{post.author?.username || post.author?.full_name || 'Autor'}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Escritor e colaborador da MOZ SOLIDÁRIA
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Compartilhando histórias que transformam vidas e fortalecem comunidades em Cabo Delgado.
                    </p>
                  </CardContent>
                </Card>

                {/* Card de Estatísticas */}
                <Card className="overflow-hidden border-2 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Estatísticas
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>Visualizações</span>
                        </div>
                        <span className="font-bold text-lg">{post.views_count || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>Curtidas</span>
                        </div>
                        <span className="font-bold text-lg">{post.likes_count || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>Comentários</span>
                        </div>
                        <span className="font-bold text-lg">{post.comments_count || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Share2 className="h-4 w-4" />
                          <span>Compartilhamentos</span>
                        </div>
                        <span className="font-bold text-lg">{post.shares_count || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Recomendados/Mais Lidos */}
                {relatedPosts.length > 0 && (
                  <Card className="overflow-hidden border-2 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Mais Lidos
                      </h3>
                      <div className="space-y-4">
                        {relatedPosts.slice(0, 4).map((relatedPost, index) => {
                          const cardImageUrl = getImageUrl(
                            relatedPost.featured_image, 
                            relatedPost.featured_image_url
                          );
                          
                          return (
                            <Link 
                              key={relatedPost.id} 
                              to={`/blog/${relatedPost.slug}`}
                              className="block group"
                            >
                              <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                  {cardImageUrl ? (
                                    <img 
                                      src={cardImageUrl}
                                      alt={relatedPost.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=200&auto=format&fit=crop";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                      Sem imagem
                                    </div>
                                  )}
                                  <div className="absolute top-1 left-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                    {relatedPost.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {relatedPost.views_count || 0}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {relatedPost.read_time || 5} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CTA Newsletter */}
                <Card className="overflow-hidden border-2 shadow-lg bg-gradient-to-br from-primary to-secondary text-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">📬 Newsletter</h3>
                    <p className="text-sm text-white/90 mb-4">
                      Receba novos artigos e histórias de impacto direto no seu email
                    </p>
                    <div className="space-y-2">
                      <input 
                        type="email"
                        placeholder="Seu email" 
                        className="w-full px-3 py-2 rounded-md text-foreground text-sm"
                      />
                      <Button className="w-full bg-white text-primary hover:bg-white/90">
                        Inscrever-se
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>

            </div>
          </div>
        </div>
      </section>

      {/* Artigos relacionados - Apenas 3 cards em destaque */}
      {relatedPosts.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Continue Lendo</h2>
                <p className="text-sm md:text-base text-muted-foreground">Artigos recomendados para você</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {relatedPosts
                  .filter(relatedPost => relatedPost.status === 'published' || relatedPost.is_published === true)
                  .slice(0, 3)
                  .map((relatedPost) => {
                    const cardImageUrl = getImageUrl(
                      relatedPost.featured_image, 
                      relatedPost.featured_image_url
                    );
                    
                    return (
                      <Card key={relatedPost.id} className="group hover:shadow-xl transition-all duration-500 overflow-hidden border hover:border-primary/50">
                        {cardImageUrl ? (
                          <div className="aspect-video overflow-hidden relative">
                            <img 
                              src={cardImageUrl}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=600&auto=format&fit=crop";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Badge className="absolute top-3 left-3 shadow-lg">{relatedPost.category?.name || 'Sem categoria'}</Badge>
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
                            <span>Sem imagem</span>
                          </div>
                        )}
                        <CardContent className="p-4 md:p-6">
                          <Link to={`/blog/${relatedPost.slug}`}>
                            <h3 className="text-lg md:text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
                              {relatedPost.title}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground text-sm md:text-base mb-4 line-clamp-2 min-h-[2.5rem]">
                            {relatedPost.excerpt || relatedPost.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                          </p>
                          <div className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground mb-4 gap-2 md:gap-3">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate max-w-[100px] md:max-w-[120px]">{relatedPost.author?.username || relatedPost.author?.full_name || 'Autor'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 flex-shrink-0" />
                              <span>{relatedPost.views_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span>
                                {relatedPost.read_time && relatedPost.read_time > 0 
                                  ? `${relatedPost.read_time} min`
                                  : '5 min'
                                }
                              </span>
                            </div>
                          </div>
                          <Link to={`/blog/${relatedPost.slug}`}>
                            <Button variant="outline" size="sm" className="w-full group/btn">
                              <span className="mr-1">Ler artigo</span>
                              <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogDetail;
