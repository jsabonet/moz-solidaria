import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/Loading";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import PostKeywords from "@/components/PostKeywords";
import PostHashtags from "@/components/PostHashtags";
import SocialInteractions from "@/components/SocialInteractions";
import Comments from "@/components/Comments";
import { Calendar, User, ArrowLeft, Share2, Heart, MessageCircle, ArrowRight, Clock, TrendingUp, Eye, Bookmark } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { fetchPostDetail, fetchAllPosts } from "@/lib/api";

const BlogDetailNew = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePostUpdate = (updatedPost: any) => {
    setPost((prev: any) => prev ? { ...prev, ...updatedPost } : updatedPost);
  };

  const handleCommentsUpdate = (count: number) => {
    setPost((prev: any) => prev ? { ...prev, comments_count: count } : null);
  };

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      
      try {
        setLoading(true);
        const [postData, postsData] = await Promise.all([
          fetchPostDetail(slug),
          fetchAllPosts()
        ]);

        if (!postData || Object.keys(postData).length === 0 || (postData.status !== 'published' && !postData.is_published)) {
          setError("Artigo não encontrado.");
          setPost(null);
        } else {
          setPost(postData);
        }
        
        const posts = Array.isArray(postsData) ? postsData : [];
        const publishedPosts = posts.filter(p => p.status === 'published' || p.is_published === true);
        
        // Algoritmo inteligente de posts relacionados baseado em múltiplos critérios
        const calculateRelevance = (candidate: any, current: any): number => {
          let score = 0;
          
          // 1. Mesma categoria: +100 pontos (alta relevância)
          if (candidate.category?.id === current.category?.id) {
            score += 100;
          }
          
          // 2. Tags compartilhadas: +30 pontos por tag
          if (candidate.tags && current.tags && Array.isArray(candidate.tags) && Array.isArray(current.tags)) {
            const sharedTags = candidate.tags.filter((t: any) => 
              current.tags.some((ct: any) => ct.id === t.id)
            );
            score += sharedTags.length * 30;
          }
          
          // 3. Hashtags compartilhadas: +20 pontos por hashtag
          if (candidate.hashtags && current.hashtags) {
            const candidateHashtags = candidate.hashtags.toLowerCase().split(',').map((h: string) => h.trim());
            const currentHashtags = current.hashtags.toLowerCase().split(',').map((h: string) => h.trim());
            const sharedHashtags = candidateHashtags.filter((h: string) => currentHashtags.includes(h));
            score += sharedHashtags.length * 20;
          }
          
          // 4. Mesmo autor: +50 pontos
          if (candidate.author?.id === current.author?.id) {
            score += 50;
          }
          
          // 5. Popularidade (views): +1 ponto por cada 100 views
          score += (candidate.views_count || 0) / 100;
          
          // 6. Engajamento (likes + shares + comments): +0.5 por interação
          const engagement = (candidate.likes_count || 0) + 
                           (candidate.shares_count || 0) + 
                           (candidate.comments_count || 0);
          score += engagement * 0.5;
          
          // 7. Recência: Posts mais recentes ganham pontos (até 8 semanas)
          const weeksDiff = Math.abs(
            (new Date(candidate.created_at).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)
          );
          score += Math.max(0, 40 - weeksDiff * 5);
          
          // 8. Similaridade no título (palavras-chave comuns): +15 por palavra
          if (candidate.title && current.title) {
            const candidateWords = candidate.title.toLowerCase()
              .split(/\s+/)
              .filter((w: string) => w.length > 4); // Palavras com mais de 4 letras
            const currentWords = current.title.toLowerCase()
              .split(/\s+/)
              .filter((w: string) => w.length > 4);
            const sharedWords = candidateWords.filter((w: string) => currentWords.includes(w));
            score += sharedWords.length * 15;
          }
          
          // 9. Featured posts ganham bônus: +25 pontos
          if (candidate.is_featured) {
            score += 25;
          }
          
          return score;
        };
        
        const related = publishedPosts
          .filter((p: any) => p.slug !== slug)
          .map((p: any) => ({
            ...p,
            relevanceScore: calculateRelevance(p, postData)
          }))
          .sort((a: any, b: any) => {
            // Ordenar por score de relevância (descendente)
            if (b.relevanceScore !== a.relevanceScore) {
              return b.relevanceScore - a.relevanceScore;
            }
            // Desempate: views
            if ((b.views_count || 0) !== (a.views_count || 0)) {
              return (b.views_count || 0) - (a.views_count || 0);
            }
            // Desempate final: data
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
          .slice(0, 6);
        
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

  useEffect(() => {
    const siteTitle = 'Moz Solidária';
    if (post) {
      const pageTitle = post.meta_title && post.meta_title.trim() ? post.meta_title : post.title || siteTitle;
      document.title = `${pageTitle} | ${siteTitle}`;
    } else {
      document.title = siteTitle;
    }
    return () => { document.title = 'Moz Solidária'; };
  }, [post?.title, post?.meta_title]);

  const getImageUrl = (imageData: any, fallbackUrl?: string) => {
    const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || (typeof window !== 'undefined' && window.location?.origin.includes('mozsolidaria.org') ? 'https://mozsolidaria.org' : (typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:8000'));
    
    if (typeof imageData === 'string') {
      if (imageData.startsWith('http')) return imageData;
      if (imageData.startsWith('/')) return `${API_BASE}${imageData}`;
      return `${API_BASE}/media/${imageData}`;
    }
    
    if (typeof imageData === 'object' && imageData) {
      if (imageData.url) return imageData.url;
      if (imageData.featured_image_url) return imageData.featured_image_url;
    }
    
    return fallbackUrl || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/10 to-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Loading variant="page" message="Carregando artigo..." size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/10 to-background">
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
    <div className="min-h-screen bg-gradient-to-b from-muted/10 to-background">
      <SEOHead 
        post={post}
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        image={getImageUrl(post.featured_image, null)}
        type="article"
      />
      <Header />
      
      {/* Breadcrumb */}
      <section className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[200px] lg:max-w-[400px]">
                {post.title}
              </span>
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

      {/* Layout Responsivo: Mobile (1 col) → Tablet (fluid) → Desktop (680px + 280px) */}
      <section className="py-8 sm:py-10 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px]">
          
          {/* LINHA 1: Título, Metadados e Imagem Hero - Full Width */}
          <div className="w-full max-w-[1008px] mx-auto mb-10 sm:mb-12 lg:mb-16">
              
              {/* Título em Destaque - Sistema Tipográfico Otimizado */}
              <h1 className="text-[42px] sm:text-[45px] md:text-[48px] lg:text-[48px] xl:text-[52px] 
                font-bold leading-[1.2] 
                mb-6 sm:mb-7 lg:mb-8 
                text-foreground tracking-tight antialiased">
                {post.title}
              </h1>

              {/* Metadados: Autor, Data, Categoria, Tempo de Leitura - Tipografia Refinada */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 
                mb-6 sm:mb-8 lg:mb-10 
                pb-5 sm:pb-6 lg:pb-8 
                text-[14px] sm:text-[15px] lg:text-[15px] font-medium text-muted-foreground/80 antialiased
                border-b-2 border-border/60">
                {/* Autor */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14
                    bg-gradient-to-br from-primary to-secondary rounded-full 
                    flex items-center justify-center text-white font-bold 
                    text-base sm:text-lg lg:text-xl shadow-lg">
                    {(post.author?.username || post.author?.full_name || 'A')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="leading-tight">
                    <div className="font-semibold text-sm sm:text-base lg:text-lg text-foreground">
                      {post.author?.username || post.author?.full_name || 'Autor'}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Autor</div>
                  </div>
                </div>
                
                <Separator orientation="vertical" className="h-10 sm:h-12 hidden sm:block" />
                
                {/* Data, Categoria, Tempo de Leitura */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 lg:gap-4 text-xs sm:text-sm lg:text-base text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
                    <span className="hidden sm:inline">
                      {new Date(post.created_at).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="sm:hidden">
                      {new Date(post.created_at).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]" />
                    <span>
                      {post.read_time && post.read_time > 0 ? `${post.read_time} min` : '5 min'}
                    </span>
                  </div>
                </div>
                
                {/* Badge Categoria */}
                <div className="ml-auto">
                  <Badge variant="default" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 
                    text-xs sm:text-sm lg:text-base px-3 py-1 lg:px-4 lg:py-1.5">
                    {post.category?.name || 'Artigo'}
                  </Badge>
                </div>
              </div>

              {/* Resumo/Excerpt - ANTES da Imagem */}
              {post.excerpt && (
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-l-4 border-primary 
                  p-5 sm:p-6 lg:p-8 rounded-r-xl mb-6 sm:mb-8 lg:mb-10 shadow-sm">
                  <p className="text-[18px] sm:text-[19px] lg:text-[20px] 
                    leading-[1.7] sm:leading-[1.75] lg:leading-[1.75] 
                    text-foreground/90 italic font-normal antialiased">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* Imagem Hero - Responsiva */}
              {(post.featured_image || post.featured_image_url) && (() => {
                const imageUrl = getImageUrl(post.featured_image, post.featured_image_url);
                if (!imageUrl) return null;
                
                return (
                  <div className="relative aspect-video overflow-hidden rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl mb-6 sm:mb-8 lg:mb-10">
                    <img
                      src={imageUrl}
                      alt={post.featured_image_caption || post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=1200&auto=format&fit=crop";
                      }}
                    />
                    {post.featured_image_caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 sm:p-6">
                        <p className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                          {post.featured_image_caption}
                        </p>
                        {post.featured_image_credit && (
                          <p className="text-white/90 text-[10px] sm:text-xs mt-1 sm:mt-2">
                            📷 Crédito: {post.featured_image_credit}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

          </div>

          {/* LINHA 2: Grid com Conteúdo + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[680px_280px] gap-8 lg:gap-12 justify-center">
            
            {/* COLUNA ESQUERDA - Conteúdo do Artigo */}
            <article className="w-full max-w-[680px] mx-auto lg:mx-0">

              {/* Conteúdo do Artigo - Sistema Tipográfico Otimizado para Leitura Profunda */}
              <div 
                className="prose prose-base sm:prose-lg lg:prose-xl max-w-[70ch] mb-12 sm:mb-14 lg:mb-16
                  antialiased
                  
                  prose-headings:font-bold prose-headings:text-foreground 
                  prose-headings:scroll-mt-20 prose-headings:tracking-tight prose-headings:antialiased
                  
                  prose-h1:text-[42px] sm:prose-h1:text-[45px] lg:prose-h1:text-[48px] 
                  prose-h1:leading-[1.2] prose-h1:mb-8 prose-h1:mt-0
                  
                  prose-h2:text-[32px] sm:prose-h2:text-[34px] lg:prose-h2:text-[36px] 
                  prose-h2:leading-[1.3] prose-h2:mt-12 sm:prose-h2:mt-14 lg:prose-h2:mt-16 
                  prose-h2:mb-7 sm:prose-h2:mb-8 lg:prose-h2:mb-9
                  prose-h2:border-b-2 prose-h2:border-border/30 prose-h2:pb-4
                  
                  prose-h3:text-[26px] sm:prose-h3:text-[27px] lg:prose-h3:text-[28px]
                  prose-h3:leading-[1.4] prose-h3:mt-10 sm:prose-h3:mt-11 lg:prose-h3:mt-12 
                  prose-h3:mb-6 sm:prose-h3:mb-7 lg:prose-h3:mb-8
                  
                  prose-h4:text-[22px] sm:prose-h4:text-[23px] lg:prose-h4:text-[24px]
                  prose-h4:leading-[1.5] prose-h4:mt-8 sm:prose-h4:mt-9 lg:prose-h4:mt-10 
                  prose-h4:mb-5 sm:prose-h4:mb-6
                  
                  prose-h5:text-[18px] sm:prose-h5:text-[19px] lg:prose-h5:text-[20px]
                  prose-h5:leading-[1.5] prose-h5:mt-7 prose-h5:mb-4
                  
                  prose-h6:text-[16px] sm:prose-h6:text-[17px] lg:prose-h6:text-[18px]
                  prose-h6:leading-[1.5] prose-h6:mt-6 prose-h6:mb-3
                  
                  prose-p:text-foreground/95 prose-p:font-normal
                  prose-p:text-[18px] sm:prose-p:text-[19px] lg:prose-p:text-[20px]
                  prose-p:leading-[1.7] sm:prose-p:leading-[1.75] lg:prose-p:leading-[1.75]
                  prose-p:mb-[2em] prose-p:mt-0
                  prose-p:text-left prose-p:hyphens-none
                  
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline 
                  hover:prose-a:underline hover:prose-a:decoration-2
                  prose-a:underline-offset-4 prose-a:transition-all
                  
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-em:text-foreground/85 prose-em:italic
                  
                  prose-ul:my-9 sm:prose-ul:my-10 lg:prose-ul:my-12
                  prose-ul:space-y-5 sm:prose-ul:space-y-6 lg:prose-ul:space-y-7
                  prose-ul:list-disc prose-ul:pl-6
                  
                  prose-ol:my-9 sm:prose-ol:my-10 lg:prose-ol:my-12
                  prose-ol:space-y-5 sm:prose-ol:space-y-6 lg:prose-ol:space-y-7
                  prose-ol:list-decimal prose-ol:pl-6
                  
                  prose-li:text-foreground/95
                  prose-li:text-[18px] sm:prose-li:text-[19px] lg:prose-li:text-[20px]
                  prose-li:leading-[1.7] sm:prose-li:leading-[1.75]
                  prose-li:mb-4
                  
                  prose-img:rounded-2xl prose-img:shadow-2xl 
                  prose-img:my-12 sm:prose-img:my-14 lg:prose-img:my-16
                  
                  prose-blockquote:border-l-[5px] prose-blockquote:border-primary/60
                  prose-blockquote:bg-muted/30 
                  prose-blockquote:py-6 sm:prose-blockquote:py-7 lg:prose-blockquote:py-8
                  prose-blockquote:pl-8 sm:prose-blockquote:pl-10 lg:prose-blockquote:pl-12
                  prose-blockquote:pr-6 sm:prose-blockquote:pr-8
                  prose-blockquote:my-10 sm:prose-blockquote:my-12 lg:prose-blockquote:my-14
                  prose-blockquote:italic prose-blockquote:text-muted-foreground/90
                  prose-blockquote:rounded-r-2xl prose-blockquote:leading-[1.75]
                  prose-blockquote:text-[19px] sm:prose-blockquote:text-[20px] lg:prose-blockquote:text-[21px]
                  
                  prose-code:bg-muted/60 prose-code:px-2.5 prose-code:py-1.5
                  prose-code:rounded-md prose-code:text-[15px] sm:prose-code:text-[15px]
                  prose-code:font-mono prose-code:font-normal prose-code:text-foreground/90
                  
                  prose-pre:bg-muted/80 prose-pre:p-5 sm:prose-pre:p-6 lg:prose-pre:p-7
                  prose-pre:rounded-2xl prose-pre:shadow-xl 
                  prose-pre:my-10 sm:prose-pre:my-12 lg:prose-pre:my-14
                  prose-pre:text-[14px] sm:prose-pre:text-[15px]
                  prose-pre:leading-relaxed prose-pre:overflow-x-auto
                  prose-pre:border prose-pre:border-border/40"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Keywords e Hashtags - Responsivo */}
              <div className="mt-8 sm:mt-10 lg:mt-12 space-y-3 sm:space-y-4">
                {post.keywords && post.keywords.length > 0 && (
                  <div className="bg-muted/30 p-4 sm:p-6 rounded-lg sm:rounded-xl border shadow-sm">
                    <PostKeywords post={post} />
                  </div>
                )}
                
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="bg-muted/30 p-4 sm:p-6 rounded-lg sm:rounded-xl border shadow-sm">
                    <PostHashtags post={post} />
                  </div>
                )}
              </div>

              {/* Interações Sociais - Responsivo */}
              <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 lg:pt-10 border-t-2">
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

              {/* Comentários - Responsivo */}
              <div className="mt-8 sm:mt-10 lg:mt-12">
                <Comments 
                  postSlug={post.slug}
                  commentsCount={post.comments_count || 0}
                  onCommentsUpdate={handleCommentsUpdate}
                />
              </div>

              {/* Mobile: Sidebar Content Inline (≤640px) - REMOVIDO */}
              <div className="hidden">
                
                {/* Mobile: Partilhar Card */}
                <Card className="shadow-lg border-2 overflow-hidden">
                  <CardContent className="p-5">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-foreground">
                      <Share2 className="h-4 w-4 text-primary" />
                      Partilhar este artigo
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Facebook */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center gap-2 h-9 hover:bg-[#1877F2]/10 hover:border-[#1877F2] hover:text-[#1877F2] transition-all duration-300 rounded-lg text-xs"
                        onClick={() => {
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
                        }}
                      >
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </Button>

                      {/* WhatsApp */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center gap-2 h-9 hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-300 rounded-lg text-xs"
                        onClick={() => {
                          window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`, '_blank');
                        }}
                      >
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </Button>

                      {/* Twitter/X */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center gap-2 h-9 hover:bg-black/10 hover:border-black hover:text-black transition-all duration-300 rounded-lg text-xs"
                        onClick={() => {
                          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank', 'width=600,height=400');
                        }}
                      >
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Twitter
                      </Button>

                      {/* LinkedIn */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center gap-2 h-9 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-all duration-300 rounded-lg text-xs"
                        onClick={() => {
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
                        }}
                      >
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile: Artigos Relacionados */}
                {relatedPosts.length > 0 && (
                  <Card className="shadow-lg border-2 overflow-hidden">
                    <CardContent className="p-5">
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-foreground">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Artigos Relacionados
                      </h3>
                      <div className="space-y-3">
                        {relatedPosts.slice(0, 4).map((related: any, idx: number) => {
                          const relatedImageUrl = getImageUrl(related.featured_image, related.featured_image_url);
                          
                          return (
                            <div key={related.id || idx}>
                              <Link 
                                to={`/blog/${related.slug}`}
                                className="flex gap-3 group hover:bg-muted/50 p-2 -m-2 rounded-lg transition-all duration-300"
                              >
                                <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted shadow-md">
                                  {relatedImageUrl ? (
                                    <img
                                      src={relatedImageUrl}
                                      alt={related.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=200&auto=format&fit=crop";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                      <span className="text-xs text-muted-foreground">📄</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1">
                                    {related.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Eye className="h-3 w-3" />
                                    <span>{related.views_count || 0}</span>
                                  </div>
                                </div>
                              </Link>
                              
                              {idx < relatedPosts.slice(0, 4).length - 1 && (
                                <Separator className="mt-3 bg-border/50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

              </div>
            </article>

            {/* COLUNA DIREITA - Sidebar Sticky (Desktop/Tablet ≥640px) */}
            <aside className="hidden sm:block w-full max-w-[280px] mx-auto lg:mx-0">
              <div className="sticky top-24 space-y-5 sm:space-y-6">
                
                {/* Card: Partilhar este artigo - PRIMEIRO */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 overflow-hidden">
                  <CardContent className="p-5">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-foreground">
                      <Share2 className="h-4 w-4 text-primary" />
                      Partilhar
                    </h3>
                    <div className="space-y-2">
                      {/* Facebook */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-3 h-10 hover:bg-[#1877F2]/10 hover:border-[#1877F2] hover:text-[#1877F2] transition-all duration-300 rounded-lg"
                        onClick={() => {
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
                        }}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-sm font-medium">Facebook</span>
                      </Button>

                      {/* Twitter/X */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-3 h-10 hover:bg-black/10 hover:border-black hover:text-black transition-all duration-300 rounded-lg"
                        onClick={() => {
                          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank', 'width=600,height=400');
                        }}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span className="text-sm font-medium">Twitter</span>
                      </Button>

                      {/* WhatsApp */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-3 h-10 hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-300 rounded-lg"
                        onClick={() => {
                          window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`, '_blank');
                        }}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span className="text-sm font-medium">WhatsApp</span>
                      </Button>

                      {/* LinkedIn */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-3 h-10 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-all duration-300 rounded-lg"
                        onClick={() => {
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
                        }}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span className="text-sm font-medium">LinkedIn</span>
                      </Button>

                      {/* Copiar Link */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-3 h-10 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all duration-300 rounded-lg"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('✅ Link copiado!');
                        }}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">Copiar Link</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Card: Artigos Relacionados - SEGUNDO */}
                {relatedPosts.length > 0 && (
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 overflow-hidden">
                    <CardContent className="p-5 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-5 flex items-center gap-2 text-foreground">
                        <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                        Artigos Relacionados
                      </h3>
                      <div className="space-y-4">
                        {relatedPosts.slice(0, 4).map((related: any, idx: number) => {
                          const relatedImageUrl = getImageUrl(related.featured_image, related.featured_image_url);
                          
                          return (
                            <div key={related.id || idx}>
                              <Link 
                                to={`/blog/${related.slug}`}
                                className="flex gap-3 group hover:bg-muted/50 p-2 -m-2 rounded-xl transition-all duration-300"
                              >
                                {/* Thumbnail */}
                                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted shadow-md">
                                  {relatedImageUrl ? (
                                    <img
                                      src={relatedImageUrl}
                                      alt={related.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=200&auto=format&fit=crop";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                      <span className="text-xs text-muted-foreground">📄</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Título e Meta */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1.5">
                                    {related.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Eye className="h-3 w-3" />
                                    <span>{related.views_count || 0} views</span>
                                  </div>
                                </div>
                              </Link>
                              
                              {/* Linha divisória suave */}
                              {idx < relatedPosts.slice(0, 4).length - 1 && (
                                <Separator className="mt-4 bg-border/50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {relatedPosts.length > 4 && (
                        <Link to="/blog">
                          <Button variant="ghost" size="sm" className="w-full mt-5 group hover:bg-primary/10">
                            Ver mais artigos
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                )}

              </div>
            </aside>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogDetailNew;
