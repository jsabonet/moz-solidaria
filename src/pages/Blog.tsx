import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight, Search, Copy, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { fetchAllPosts, fetchCategories, duplicatePost } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
const POSTS_PER_PAGE = 9; // 9 posts por página (3x3 grid)

const Blog = () => {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar TODOS os posts e categorias
        const [postsData, categoriesData] = await Promise.all([
          fetchAllPosts(),
          fetchCategories()
        ]);
        
        // Garantir que postsData é um array
        const posts = Array.isArray(postsData) ? postsData : [];
        
        // Filtrar apenas posts publicados
        const publishedPosts = posts.filter(post => 
          post.status === 'published' || post.is_published === true
        );
        
        setAllPosts(publishedPosts);
        setBlogPosts(publishedPosts);
        
        // Garantir que categoriesData é um array
        const categories = Array.isArray(categoriesData) ? categoriesData : [];
        setCategories(["Todos", ...categories.map((c: any) => c.name)]);
        
      } catch (err: any) {
        console.error('Blog: Erro ao carregar dados:', err);
        setError(`Erro ao carregar dados do blog: ${err.message || 'Erro desconhecido'}`);
      } finally {
        setLoading(false);
      }
    };

    // inicial load
    loadData();

    // limpar
    return () => { mounted = false };
  }, []);

  // Debounced setter for `search` to avoid updating on every keystroke
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // debounce 800ms
    debounceRef.current = window.setTimeout(() => {
      setSearch(val);
    }, 800) as unknown as number;
  };

  // Effect to run search whenever `search` changes (debounced by handler)
  useEffect(() => {
    const run = async () => {
      setCurrentPage(1); // Reset para primeira página ao buscar
      
      if (!search || search.trim().length === 0) {
        setSearching(false);
        // Retornar para todos os posts
        setBlogPosts(allPosts);
        return;
      }

      setSearching(true);
      try {
        // Buscar localmente nos posts já carregados
        const query = search.toLowerCase();
        const filtered = allPosts.filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query)
        );
        setBlogPosts(filtered);
      } catch (err:any) {
        console.error('Erro na busca:', err);
        setError('Erro ao buscar posts');
      } finally {
        setSearching(false);
      }
    };

    run();
  }, [search, allPosts]);

  // Filtrar por categoria
  useEffect(() => {
    setCurrentPage(1); // Reset para primeira página ao filtrar
    
    if (selectedCategory === "Todos") {
      // Aplicar busca se houver
      if (search && search.trim().length > 0) {
        const query = search.toLowerCase();
        const filtered = allPosts.filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query)
        );
        setBlogPosts(filtered);
      } else {
        setBlogPosts(allPosts);
      }
    } else {
      let filtered = allPosts.filter(post => post.category?.name === selectedCategory);
      
      // Aplicar busca se houver
      if (search && search.trim().length > 0) {
        const query = search.toLowerCase();
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query)
        );
      }
      
      setBlogPosts(filtered);
    }
  }, [selectedCategory, allPosts, search]);

  const handleQuickDuplicate = async (post: any) => {
    if (!user) return;
    
    try {
      await duplicatePost(post.slug);
      toast.success('Post duplicado! Verifique no dashboard.');
    } catch (error: any) {
      toast.error('Erro ao duplicar post');
    }
  };

  // Garantir que apenas posts publicados sejam exibidos
  const publishedPosts = blogPosts.filter(post => 
    post.status === 'published' || post.is_published === true
  );
  
  // Paginação
  const totalPages = Math.ceil(publishedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = publishedPosts.slice(startIndex, endIndex);
  
  const featuredPost = publishedPosts.length > 0 ? publishedPosts[0] : null;
  const regularPosts = currentPosts.slice(currentPosts[0] === featuredPost ? 1 : 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Erro no Blog</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Se o problema persistir, entre em contato com o suporte</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Blog MOZ SOLIDÁRIA
            </h1>
            <p className="text-xl text-white/90">
              Acompanhe nossas atividades, histórias de impacto e reflexões sobre 
              desenvolvimento comunitário em Cabo Delgado
            </p>
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Buscar artigos..." 
                className="pl-10 bg-white text-foreground"
                ref={inputRef}
                onChange={handleInputChange}
                defaultValue={search}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-muted/30 border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge 
                key={category} 
                variant={category === selectedCategory ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 px-4 py-2"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          {search && (
            <div className="text-center mt-3">
              <Badge variant="outline" className="text-sm">
                {publishedPosts.length} resultado{publishedPosts.length !== 1 ? 's' : ''} encontrado{publishedPosts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Featured Post - Apenas se for publicado e for a primeira página */}
      {featuredPost && currentPage === 1 && (featuredPost.status === 'published' || featuredPost.is_published === true) && (
        <section className="py-12 md:py-16 animate-in fade-in duration-700">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Artigo em Destaque</h2>
              <div className="w-20 h-1 bg-primary rounded-full"></div>
            </div>
            <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden relative group">
                  <img 
                    src={featuredPost.featured_image_url || featuredPost.featured_image || "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=1172&auto=format&fit=crop"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <CardContent className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 text-xs md:text-sm">{featuredPost.category?.name || 'Sem categoria'}</Badge>
                  <CardTitle className="text-xl md:text-2xl lg:text-3xl mb-4 leading-tight hover:text-primary transition-colors cursor-pointer">
                    {featuredPost.title}
                  </CardTitle>
                  <p className="text-muted-foreground mb-6 text-sm md:text-base lg:text-lg leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground mb-6 gap-3 md:gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate max-w-[120px] md:max-w-none">{featuredPost.author?.username || featuredPost.author?.full_name || 'Autor'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span>{new Date(featuredPost.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span>
                        {featuredPost.read_time && featuredPost.read_time > 0 
                          ? `${featuredPost.read_time} min`
                          : '5 min'
                        }
                      </span>
                    </div>
                  </div>
                  <Link to={`/blog/${featuredPost.slug}`} className="w-full md:w-auto">
                    <Button size="lg" className="w-full md:w-auto group">
                      Ler Artigo Completo
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Regular Posts Grid - Apenas posts publicados */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {currentPage === 1 && featuredPost ? 'Mais Artigos' : 'Todos os Artigos'}
            </h2>
            <div className="w-20 h-1 bg-secondary rounded-full"></div>
          </div>
          
          {regularPosts.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {regularPosts.map((post, index) => (
                  <Card 
                    key={post.id} 
                    className="group hover:shadow-xl transition-all duration-500 overflow-hidden border hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={post.featured_image_url || post.featured_image || "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=1172&auto=format&fit=crop"} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Badge className="absolute top-3 left-3 shadow-lg">{post.category?.name || 'Sem categoria'}</Badge>
                    </div>
                    <CardContent className="p-4 md:p-6">
                      <Link to={`/blog/${post.slug}`}>
                        <CardTitle className="text-lg md:text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                          {post.title}
                        </CardTitle>
                      </Link>
                      <p className="text-muted-foreground text-sm md:text-base mb-4 line-clamp-2 min-h-[2.5rem]">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground mb-4 gap-2 md:gap-3">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[100px] md:max-w-[120px]">{post.author?.username || post.author?.full_name || 'Autor'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>
                            {post.read_time && post.read_time > 0 
                              ? `${post.read_time} min`
                              : '5 min'
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Link to={`/blog/${post.slug}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full group/btn">
                            <span className="mr-1">Ler mais</span>
                            <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        
                        {/* Admin Quick Actions - Apenas para usuários logados */}
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickDuplicate(post)}
                            title="Duplicar post (Admin)"
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, publishedPosts.length)} de {publishedPosts.length} artigos
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="h-9 w-9 p-0 hidden sm:inline-flex"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      {/* Mobile: mostrar apenas página atual */}
                      <div className="sm:hidden px-3 py-1 text-sm">
                        {currentPage} / {totalPages}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 md:py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl">📝</div>
                <h3 className="text-xl md:text-2xl font-bold">
                  {search ? 'Nenhum resultado encontrado' : 'Nenhum artigo publicado ainda'}
                </h3>
                <p className="text-muted-foreground">
                  {search 
                    ? 'Tente buscar com outras palavras-chave' 
                    : 'Volte em breve para novos conteúdos!'
                  }
                </p>
                {search && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearch('');
                      if (inputRef.current) inputRef.current.value = '';
                    }}
                  >
                    Limpar Busca
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      {/* <section className="py-16 bg-gradient-to-r from-solidarity-orange to-solidarity-warm text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Mantenha-se Atualizado
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Receba as últimas notícias e histórias de impacto da Associação MOZ SOLIDÁRIA diretamente no seu email
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <Input 
              placeholder="Seu email" 
              className="bg-white text-foreground flex-1"
            />
            <Button className="bg-white text-solidarity-orange hover:bg-white/90">
              Inscrever
            </Button>
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  );
};

export default Blog;