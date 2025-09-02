import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight, Search, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { fetchPosts, fetchCategories, duplicatePost } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";


const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const loadData = async (q?: string) => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar posts com query se fornecida
        const [postsData, categoriesData] = await Promise.all([
          fetchPosts(q),
          fetchCategories()
        ]);
        
        // Garantir que postsData é um array
        const posts = Array.isArray(postsData) ? postsData : postsData.results || [];
        
        // Filtrar apenas posts publicados
        const publishedPosts = posts.filter(post => 
          post.status === 'published' || post.is_published === true
        );
        
        setBlogPosts(publishedPosts);
        
        // Garantir que categoriesData é um array
        const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.results || [];
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
      if (!search || search.trim().length === 0) {
        setSearching(false);
        try {
          setLoading(true);
          const postsData = await fetchPosts();
          const posts = Array.isArray(postsData) ? postsData : postsData.results || [];
          const publishedPosts = posts.filter(post => post.status === 'published' || post.is_published === true);
          setBlogPosts(publishedPosts);
        } catch (err:any) {
          console.error('Erro ao buscar posts:', err);
          setError('Erro ao buscar posts');
        } finally { setLoading(false); }
        return;
      }

      setSearching(true);
      try {
        setLoading(true);
        const postsData = await fetchPosts(search);
        const posts = Array.isArray(postsData) ? postsData : postsData.results || [];
        const publishedPosts = posts.filter(post => post.status === 'published' || post.is_published === true);
        setBlogPosts(publishedPosts);
      } catch (err:any) {
        console.error('Erro na busca:', err);
        setError('Erro ao buscar posts');
      } finally {
        setSearching(false);
        setLoading(false);
      }
    };

    run();
  }, [search]);

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
  
  const featuredPost = publishedPosts.length > 0 ? publishedPosts[0] : null;
  const regularPosts = publishedPosts.slice(1);

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
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge 
                key={category} 
                variant={category === "Todos" ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post - Apenas se for publicado */}
      {featuredPost && (featuredPost.status === 'published' || featuredPost.is_published === true) && (
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Artigo em Destaque</h2>
              <div className="w-20 h-1 bg-primary"></div>
            </div>
            <Card className="overflow-hidden shadow-lg">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  <img 
                    src={featuredPost.featured_image_url || "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">{featuredPost.category?.name || 'Sem categoria'}</Badge>
                  <CardTitle className="text-2xl lg:text-3xl mb-4 leading-tight">
                    {featuredPost.title}
                  </CardTitle>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-6 space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{featuredPost.author?.username || featuredPost.author?.full_name || 'Autor'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(featuredPost.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span>
                      {featuredPost.read_time && featuredPost.read_time > 0 
                        ? `${featuredPost.read_time} min de leitura`
                        : '5 min de leitura'
                      }
                    </span>
                  </div>
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <Button size="lg">
                      Ler Artigo Completo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Regular Posts Grid - Apenas posts publicados */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Últimos Artigos</h2>
            <div className="w-20 h-1 bg-secondary"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.featured_image_url || "https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">{post.category?.name || 'Sem categoria'}</Badge>
                  <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{post.author?.username || post.author?.full_name || 'Autor'}</span>
                    </div>
                    <span>
                      {post.read_time && post.read_time > 0 
                        ? `${post.read_time} min de leitura`
                        : '5 min de leitura'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link to={`/blog/${post.slug}`}>
                        <Button variant="ghost" size="sm">
                          Ler mais
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                      
                      {/* Admin Quick Actions - Apenas para usuários logados */}
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickDuplicate(post)}
                          title="Duplicar post (Admin)"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Mostrar mensagem se não houver posts publicados */}
          {publishedPosts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nenhum artigo publicado ainda.</p>
              <p className="text-muted-foreground">Volte em breve para novos conteúdos!</p>
            </div>
          )}
          
          {/* Load More Button - Apenas se houver posts */}
          {publishedPosts.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Carregar Mais Artigos
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-solidarity-orange to-solidarity-warm text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Mantenha-se Atualizado
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Receba as últimas notícias e histórias de impacto da MOZ SOLIDÁRIA diretamente no seu email
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
      </section>

      <Footer />
    </div>
  );
};

export default Blog;