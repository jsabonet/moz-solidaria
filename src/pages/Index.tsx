import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import AnimatedCounter from "@/components/AnimatedCounter";
import ProjectGallery from "@/components/ProjectGallery";
import TestimonialsSection from "@/components/TestimonialsSection";
import QuickAccessSection from "@/components/QuickAccessSection";
import { Heart, Users, BookOpen, Home, AlertTriangle, Stethoscope, Handshake, ArrowRight, MapPin, Target, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const impactStats = [
    { number: 500, label: "Famílias Alimentadas", suffix: "+" },
    { number: 15, label: "Escolas Reconstruídas", suffix: "+" },
    { number: 300, label: "Jovens Capacitados", suffix: "+" },
    { number: 25, label: "Comunidades Apoiadas", suffix: "+" },
  ];

  const programs = [
    {
      icon: Heart,
      title: "Apoio Alimentar",
      description: "Distribuímos cestas básicas e refeições prontas a famílias em situação de vulnerabilidade, especialmente deslocados por conflitos.",
      color: "text-mozambique-red"
    },
    {
      icon: Home,
      title: "Reconstrução Comunitária", 
      description: "Ajudamos na reabilitação e construção de casas, escolas e infraestruturas básicas em comunidades afetadas.",
      color: "text-solidarity-blue"
    },
    {
      icon: BookOpen,
      title: "Educação e Capacitação",
      description: "Oferecemos programas de alfabetização, capacitação profissional e desenvolvimento de competências para jovens.",
      color: "text-solidarity-orange"
    },
    {
      icon: Stethoscope,
      title: "Saúde Preventiva",
      description: "Promovemos campanhas de vacinação, educação sanitária e acesso a cuidados básicos de saúde.",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Direitos Humanos",
      description: "Defendemos e promovemos os direitos fundamentais, especialmente de mulheres e crianças.",
      color: "text-purple-600"
    },
    {
      icon: Handshake,
      title: "Apoio Psicossocial",
      description: "Oferecemos suporte emocional e psicológico a pessoas traumatizadas por conflitos e desastres.",
      color: "text-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags para a página inicial */}
      <SEOHead 
        title="MOZ SOLIDÁRIA - Transformando Vidas em Cabo Delgado"
        description="A MOZ SOLIDÁRIA é uma organização humanitária sem fins lucrativos que atua no apoio a comunidades afetadas por conflitos em Cabo Delgado, Moçambique."
        keywords="moçambique, cabo delgado, ong, solidariedade, humanitária, ajuda, apoio comunitário, reconstrução, educação, saúde"
        type="website"
        image="/logo-moz-solidaria.png"
      />
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-solidarity-blue to-mozambique-red text-white min-h-[70vh] sm:min-h-[80vh] lg:min-h-screen flex items-center">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-white/20 animate-pulse"></div>
          <div className="absolute top-32 right-10 sm:right-20 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-20 sm:left-32 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/15 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 overflow-visible">
            <h1 className="hero-title-responsive text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-relaxed fade-in-up overflow-visible">
              <span className="block mb-3 sm:mb-4 lg:mb-5">Transformando Vidas em</span>
              <span className="gradient-text-responsive block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl py-3">
                Cabo Delgado
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed fade-in-up px-4" style={{animationDelay: '0.2s'}}>
              Unidos pela mesma causa - movidos pelo princípio do amor ao próximo
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center fade-in-up px-4" style={{animationDelay: '0.4s'}}>
              <Link to="/programas">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 sm:px-8 py-3 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">Conhecer Nossas Áreas de Atuação</span>
                  <span className="sm:hidden">Nossas Áreas de Atuação</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/doacao">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-primary hover:bg-white hover:text-primary text-base sm:text-lg px-6 sm:px-8 py-3 pulse-animation font-semibold button-text-visible w-full sm:w-auto"
                  style={{ borderWidth: '2px' }}
                >
                  💝 Fazer Doação
                  <Heart className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center space-y-2 fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
                <AnimatedCounter 
                  end={stat.number}
                  suffix={stat.suffix}
                  className="text-3xl lg:text-4xl font-bold text-primary"
                />
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-in-up">
              <div className="flex items-center space-x-2 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Mocímboa da Praia, Cabo Delgado</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Quem Somos
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A MOZ SOLIDÁRIA é uma organização humanitária sem fins lucrativos, movida pelo princípio do amor ao próximo. 
                Atuamos no apoio a comunidades afetadas por conflitos, pobreza e desastres naturais em Cabo Delgado, 
                promovendo dignidade, esperança e desenvolvimento sustentável.
              </p>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-foreground">Missão Clara</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Eye className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-foreground">Visão Transformadora</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="h-6 w-6 text-primary" />
      <span className="font-semibold text-foreground">Valores Humanos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-foreground">Impacto Comunitário</span>
                </div>
              </div>
              <Link to="/sobre">
                <Button size="lg" className="group">
                  Conhecer Nossa História
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="fade-in-up" style={{animationDelay: '0.2s'}}>
              <img 
                src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Comunidade em Cabo Delgado"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover card-hover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Nossas Áreas de Atuação
            </h2>
            <p className="text-xl text-muted-foreground">
              Trabalhamos em múltiplas frentes para criar um impacto duradouro nas comunidades de Cabo Delgado
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md card-hover fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className={`inline-flex p-4 rounded-full ${program.color.replace('text-', 'bg-').replace('600', '100')}`}>
                    <program.icon className={`h-8 w-8 ${program.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {program.description}
                  </p>
                  <Link to="/programas">
                    <Button variant="ghost" className="group/btn mt-4">
                      Saiba Mais
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Call to Action para ver todos os programas */}
          <div className="text-center mt-12 fade-in-up" style={{animationDelay: '0.8s'}}>
            <Link to="/programas">
              <Button size="lg" className="group">
                Ver Todas as Nossas Áreas de Atuação
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Project Gallery */}
      <ProjectGallery />

      {/* Quick Access Section */}
      {/* <QuickAccessSection /> */}

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-solidarity-orange to-mozambique-red text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 fade-in-up">
            Chamada à Solidariedade
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90 fade-in-up" style={{animationDelay: '0.2s'}}>
            Junte-se a nós nesta missão de transformação social. Sua participação é fundamental 
            para a construção de um futuro digno e cheio de esperança. Seja através de doações, parcerias 
            ou voluntariado, cada contribuição conta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/doacao">
              <Button 
                size="lg" 
                className="bg-white text-solidarity-orange hover:bg-white/90 text-lg px-8"
              >
                Doações
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contacto">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-solidarity-orange hover:bg-white hover:text-solidarity-orange text-lg px-8 font-semibold button-text-visible"
                style={{ borderWidth: '2px' }}
              >
                Voluntariado
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contacto">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-solidarity-orange hover:bg-white hover:text-solidarity-orange text-lg px-8 font-semibold button-text-visible"
                style={{ borderWidth: '2px' }}
              >
                Parcerias
                <Handshake className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;