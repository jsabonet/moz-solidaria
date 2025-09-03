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
import { Calendar, User, ArrowLeft, Share2, Heart, MessageCircle, ArrowRight, Clock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { fetchPostDetail, fetchPosts } from "@/lib/api";

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.warn("BlogDetail: slug não encontrado na URL.");
        return;
      }
      
      try {
        setLoading(true);
        console.log("BlogDetail: Buscando post detail para slug:", slug);
        
        const [postData, postsData] = await Promise.all([
          fetchPostDetail(slug),
          fetchPosts()
        ]);
        
        console.log("BlogDetail: postData recebido:", postData);
        console.log("BlogDetail: postsData recebido:", postsData);

        // Verificar dados da imagem principal
        if (postData && postData.featured_image) {
          console.log("🖼️ BlogDetail - Imagem principal encontrada:");
          console.log("  - featured_image:", postData.featured_image);
          console.log("  - featured_image_url:", postData.featured_image_url);
          console.log("  - Tipo de dados:", typeof postData.featured_image);
        } else {
          console.log("❌ BlogDetail - Nenhuma imagem principal encontrada no post");
        }

        // Verificar se o post existe e está publicado
        if (!postData || Object.keys(postData).length === 0) {
          console.warn("BlogDetail: postData vazio ou nulo.", postData);
          setError("Artigo não encontrado.");
          setPost(null);
        } else if (postData.status !== 'published' && !postData.is_published) {
          console.warn("BlogDetail: Post não publicado:", postData.status);
          setError("Artigo não encontrado.");
          setPost(null);
        } else {
          setPost(postData);
        }
        
        // Garantir que postsData é um array e filtrar apenas posts publicados
        const posts = Array.isArray(postsData) ? postsData : postsData.results || [];
        console.log("BlogDetail: posts para relacionados:", posts);
        
        // Verificar imagens dos posts relacionados
        posts.forEach((p, index) => {
          console.log(`🖼️ Post relacionado ${index + 1} (${p.title}):`);
          console.log("  - featured_image:", p.featured_image);
          console.log("  - featured_image_url:", p.featured_image_url);
          console.log("  - Tipo de dados:", typeof p.featured_image);
        });
        
        const publishedPosts = posts.filter(p => 
          p.status === 'published' || p.is_published === true
        );
        
        const related = publishedPosts
          .filter((p: any) => p.slug !== slug)
          .slice(0, 3);
        setRelatedPosts(related);
        
      } catch (err: any) {
        console.error('BlogDetail: Erro detalhado no BlogDetail:', err);
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
      console.warn('BlogDetail: unable to update document.title', e);
    }

    return () => {
      try { document.title = 'Moz Solidária'; } catch (e) { /* ignore */ }
    };
  }, [post?.title, post?.meta_title]);

  // Função para processar URL da imagem
  const getImageUrl = (imageData: any, fallbackUrl?: string) => {
    console.log("🔍 getImageUrl - Processando:", { imageData, fallbackUrl, type: typeof imageData });
    
  // If VITE_API_URL isn't provided at build time, use the runtime origin (the host serving the assets)
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || (typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:8000');
    
    // Se imageData é uma string (URL)
    if (typeof imageData === 'string') {
      // Se já é uma URL completa
      if (imageData.startsWith('http')) {
        console.log("✅ URL completa encontrada:", imageData);
        return imageData;
      }
      // Se é um caminho relativo, construir URL completa
      if (imageData.startsWith('/')) {
        const fullUrl = `${API_BASE}${imageData}`;
        console.log("🔗 Construindo URL completa:", fullUrl);
        return fullUrl;
      }
      // Se é apenas o nome do arquivo
      const fullUrl = `${API_BASE}/media/${imageData}`;
      console.log("📁 Construindo URL do media:", fullUrl);
      return fullUrl;
    }
    
    // Se é um objeto com propriedades de imagem
    if (typeof imageData === 'object' && imageData) {
      if (imageData.url) {
        console.log("✅ URL do objeto encontrada:", imageData.url);
        return imageData.url;
      }
      if (imageData.featured_image_url) {
        console.log("✅ featured_image_url encontrada:", imageData.featured_image_url);
        return imageData.featured_image_url;
      }
    }
    
    // Fallback
    if (fallbackUrl) {
      console.log("🔄 Usando fallback URL:", fallbackUrl);
      return fallbackUrl;
    }
    
    console.log("❌ Nenhuma imagem válida encontrada");
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
    <div className="min-h-screen">
      <SEOHead 
        post={post}
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        image={getImageUrl(post.featured_image, null)}
        type="article"
      />
      <Header />
      
      {/* Breadcrumb e botão voltar */}
      <section className="bg-muted/30 py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Início</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary">Blog</Link>
              <span>/</span>
              <span className="text-foreground">{post.title}</span>
            </div>
            <Link to="/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero do artigo */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Categoria e data */}
            <div className="flex items-center space-x-4 mb-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {post.category?.name || 'Sem categoria'}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {post.read_time && post.read_time > 0 
                      ? `${post.read_time} min de leitura`
                      : '5 min de leitura'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>

            {/* Autor e ações */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                  {(post.author?.username || post.author?.full_name || 'A').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold">{post.author?.username || post.author?.full_name || 'Autor'}</div>
                  <div className="text-sm text-muted-foreground">Autor</div>
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

            {/* Resumo */}
            {post.excerpt && (
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Imagem principal */}
            {(post.featured_image || post.featured_image_url) && (
              <div className="mb-8">
                {(() => {
                  const imageUrl = getImageUrl(post.featured_image, post.featured_image_url);
                  console.log("🖼️ Renderizando imagem principal:", imageUrl);
                  
                  if (!imageUrl) {
                    console.log("❌ Nenhuma URL de imagem válida para renderizar");
                    return (
                      <div className="w-full max-w-[1200px] mx-auto h-64 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">Imagem não disponível</span>
                      </div>
                    );
                  }
                  
                  return (
                    <img
                      src={imageUrl}
                      alt={post.featured_image_caption || post.title}
                      className="w-full max-w-[1200px] mx-auto object-cover rounded-lg"
                      onLoad={() => console.log("✅ Imagem principal carregada com sucesso:", imageUrl)}
                      onError={(e) => {
                        console.error("❌ Erro ao carregar imagem principal:", imageUrl);
                        console.error("Erro completo:", e);
                        // Fallback para placeholder
                        e.currentTarget.src = "https://via.placeholder.com/1200x400/e2e8f0/64748b?text=Imagem+não+encontrada";
                      }}
                    />
                  );
                })()}
                
                <div className="flex items-center text-sm text-muted-foreground mt-2 space-x-2">
                  <p>{post.featured_image_caption}</p>
                  <span className="text-gray-400">|</span>
                  <p className="text-xs">Crédito: {post.featured_image_credit}</p>
                </div>


              </div>
            )}

            {/* Conteúdo do artigo */}
            <article className="prose prose-lg max-w-none mb-12">
              <div 
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="space-y-6 text-foreground leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-foreground [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-foreground [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:my-4 [&>ul>li]:mb-2 [&>ul>li]:ml-6 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:bg-muted/30 [&>blockquote]:py-4 [&>blockquote]:my-6 [&>blockquote>cite]:block [&>blockquote>cite]:mt-2 [&>blockquote>cite]:text-sm [&>blockquote>cite]:text-muted-foreground [&>blockquote>cite]:not-italic"
              />
            </article>

            {/* Keywords e Hashtags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <PostKeywords post={post} />
              <PostHashtags post={post} />
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Categoria</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {post.category?.name || 'Sem categoria'}
                </Badge>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Componente de interações sociais principal */}
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

            {/* Seção de comentários */}
            <Comments 
              postSlug={post.slug}
              commentsCount={post.comments_count || 0}
              onCommentsUpdate={handleCommentsUpdate}
            />
          </div>
        </div>
      </section>

      {/* Artigos relacionados */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mab-8">
            <h2 className="text-2xl font-bold mb-2">Artigos Relacionados</h2>
            <div className="w-20 h-1 bg-secondary mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts
                .filter(relatedPost => relatedPost.status === 'published' || relatedPost.is_published === true)
                .map((relatedPost) => {
                  console.log(`🖼️ Processando card do post: ${relatedPost.title}`);
                  console.log("  - featured_image:", relatedPost.featured_image);
                  console.log("  - featured_image_url:", relatedPost.featured_image_url);
                  
                  const cardImageUrl = getImageUrl(
                    relatedPost.featured_image, 
                    relatedPost.featured_image_url
                  );
                  
                  return (
                    <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {cardImageUrl ? (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={cardImageUrl}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onLoad={() => console.log(`✅ Imagem do card carregada: ${relatedPost.title}`)}
                            onError={(e) => {
                              console.error(`❌ Erro ao carregar imagem do card: ${relatedPost.title}`, cardImageUrl);
                              e.currentTarget.src = "https://via.placeholder.com/400x200/e2e8f0/64748b?text=Sem+imagem";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground">
                          <span>Sem imagem</span>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <Badge variant="secondary" className="mb-3">
                          {relatedPost.category?.name || 'Sem categoria'}
                        </Badge>
                        <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {relatedPost.excerpt || relatedPost.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{relatedPost.author?.username || relatedPost.author?.full_name || 'Autor'}</span>
                          </div>
                          <span>
                            {relatedPost.read_time && relatedPost.read_time > 0 
                              ? `${relatedPost.read_time} min de leitura`
                              : '5 min de leitura'
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(relatedPost.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <Link to={`/blog/${relatedPost.slug}`}>
                            <Button variant="ghost" size="sm">
                              Ler mais
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
            
            {/* Mensagem se não houver posts relacionados publicados */}
            {relatedPosts.filter(p => p.status === 'published' || p.is_published === true).length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum artigo relacionado encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Newsletter */}
      <section className="py-16 bg-gradient-to-r from-solidarity-orange to-solidarity-warm text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Não Perca Nenhuma História
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Inscreva-se em nossa newsletter e receba as últimas notícias e histórias de impacto da MOZ SOLIDÁRIA
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input 
              type="email"
              placeholder="Seu email" 
              className="flex-1 px-4 py-2 rounded-md text-foreground"
            />
            <Button className="bg-white text-solidarity-orange hover:bg-white/90 px-6">
              Inscrever
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogDetail;
