import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Transformando Vidas através da Educação em Cabo Delgado",
      excerpt: "Descubra como nossos programas de alfabetização estão criando oportunidades reais para crianças e adultos em comunidades rurais.",
      author: "Maria Santos",
      date: "15 de Janeiro, 2024",
      category: "Educação",
      readTime: "5 min",
      featured: true,
      image: ""
    },
    {
      id: 2,
      title: "Projeto de Agricultura Sustentável: Resultados do Primeiro Semestre",
      excerpt: "Conheça os impactos positivos das nossas iniciativas de desenvolvimento rural e agricultura sustentável nas comunidades locais.",
      author: "João Mabunda",
      date: "8 de Janeiro, 2024",
      category: "Desenvolvimento Rural",
      readTime: "7 min",
      featured: false,
      image: "https://images.unsplash.com/photo-1486328228599-85db4443971f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: 3,
      title: "Empoderamento Feminino: Histórias de Sucesso",
      excerpt: "Mulheres de Cabo Delgado compartilham suas experiências de transformação através dos nossos programas de capacitação.",
      author: "Ana Mussa",
      date: "2 de Janeiro, 2024",
      category: "Empoderamento",
      readTime: "6 min",
      featured: false,
      image: "https://images.unsplash.com/photo-1696483150935-2f719f1dfa6a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: 4,
      title: "Campanha de Saúde Preventiva: 1000 Famílias Atendidas",
      excerpt: "Relatório completo da nossa campanha de vacinação e educação em saúde que beneficiou mais de 1000 famílias.",
      author: "Dr. Carlos Nhamirre",
      date: "28 de Dezembro, 2023",
      category: "Saúde",
      readTime: "4 min",
      featured: false,
      image: "https://images.unsplash.com/photo-1666887360933-ad2ade9ae994?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: 5,
      title: "Construção de Poços: Água Limpa para Comunidades Rurais",
      excerpt: "Como a construção de poços artesianos está transformando o acesso à água potável em cinco comunidades de Cabo Delgado.",
      author: "Eng. Pedro Macamo",
      date: "20 de Dezembro, 2023",
      category: "Infraestrutura",
      readTime: "8 min",
      featured: false,
      image: "https://images.unsplash.com/photo-1601662583487-20630f298aed?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      id: 6,
      title: "Voluntariado: Como Fazer a Diferença na Sua Comunidade",
      excerpt: "Guia completo para se tornar voluntário da MOZ SOLIDÁRIA e contribuir para o desenvolvimento de Cabo Delgado.",
      author: "Sandra Chissano",
      date: "15 de Dezembro, 2023",
      category: "Voluntariado",
      readTime: "3 min",
      featured: false,
      image: "https://images.unsplash.com/photo-1584789873535-e79c6a8a2483?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  const categories = ["Todos", "Educação", "Saúde", "Desenvolvimento Rural", "Empoderamento", "Infraestrutura", "Voluntariado"];
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

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

      {/* Featured Post */}
      {featuredPost && (
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
                    src="https://images.unsplash.com/photo-1567057420215-0afa9aa9253a?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Educação em Cabo Delgado"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                  <CardTitle className="text-2xl lg:text-3xl mb-4 leading-tight">
                    {featuredPost.title}
                  </CardTitle>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-6 space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <span>{featuredPost.readTime} de leitura</span>
                  </div>
                  <Link to={`/blog/${featuredPost.id}`}>
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

      {/* Regular Posts Grid */}
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
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                  <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-4 space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{post.date}</span>
                    <Link to={`/blog/${post.id}`}>
                      <Button variant="ghost" size="sm">
                        Ler mais
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Carregar Mais Artigos
            </Button>
          </div>
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