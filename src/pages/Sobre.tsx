import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Target, Eye, Heart, Users, Award, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Sobre = () => {
  const values = [
    {
      icon: Heart,
      title: "Solidariedade",
      description: "Acreditamos no poder da união e do apoio mútuo para superar desafios."
    },
    {
      icon: Target,
      title: "Transparência",
      description: "Operamos com total transparência em todas as nossas ações e prestação de contas."
    },
    {
      icon: Users,
      title: "Inclusão",
      description: "Promovemos a participação de todos, sem distinção de género, idade ou origem."
    },
    {
      icon: Award,
      title: "Excelência",
      description: "Buscamos sempre a qualidade e eficácia em todos os nossos programas e projetos."
    }
  ];

  const timeline = [
    {
      year: "2014",
      title: "Fundação da Organização",
      description: "A MOZ SOLIDÁRIA foi fundada com o objetivo de apoiar as comunidades de Cabo Delgado."
    },
    {
      year: "2016",
      title: "Primeiros Programas de Educação",
      description: "Lançamento dos primeiros programas de alfabetização em comunidades rurais."
    },
    {
      year: "2018",
      title: "Expansão para Saúde",
      description: "Início dos programas de saúde preventiva e campanhas de vacinação."
    },
    {
      year: "2020",
      title: "Resposta à Pandemia",
      description: "Adaptação dos programas para apoiar comunidades durante a pandemia de COVID-19."
    },
    {
      year: "2022",
      title: "Programa de Empoderamento",
      description: "Lançamento de programas específicos para empoderamento feminino e de jovens."
    },
    {
      year: "2024",
      title: "10 Anos de Impacto",
      description: "Celebração de uma década transformando vidas em Cabo Delgado."
    }
  ];

  const team = [
    {
      name: "Maria Santos",
      role: "Diretora Executiva",
      description: "10 anos de experiência em desenvolvimento comunitário e gestão de ONGs."
    },
    {
      name: "João Mabunda",
      role: "Coordenador de Programas",
      description: "Especialista em agricultura sustentável e desenvolvimento rural."
    },
    {
      name: "Ana Mussa",
      role: "Responsável de Comunicação",
      description: "Jornalista com foco em questões sociais e desenvolvimento humano."
    },
    {
      name: "Dr. Carlos Nhamirre",
      role: "Coordenador de Saúde",
      description: "Médico com especialização em saúde pública e medicina preventiva."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-solidarity-blue to-mozambique-green text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Sobre a Moz Solidária
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Uma organização humanitária movida pelo princípio do amor ao próximo
            </p>
          </div>
        </div>
      </section>

      {/* Quem Somos Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold">Quem Somos</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                A Moz Solidária é uma organização humanitária sem fins lucrativos, sediada em Mocímboa da Praia, 
                na província de Cabo Delgado, Moçambique. Nascemos da necessidade urgente de apoiar comunidades 
                afetadas por conflitos, pobreza extrema e desastres naturais, com foco na reconstrução da dignidade 
                humana e no fortalecimento social.
              </p>
              <p>
                Movidos pelo princípio do amor ao próximo, atuamos em diversas áreas essenciais como apoio alimentar, 
                educação, saúde pública, reconstrução comunitária, formação juvenil e resposta a emergências. 
                Acreditamos que a solidariedade é uma ferramenta poderosa para transformar realidades e devolver a 
                esperança a quem mais precisa.
              </p>
              <p>
                Nossa missão é servir com compaixão, promovendo a justiça social e o desenvolvimento sustentável. 
                Com uma equipe dedicada de voluntários e parceiros, buscamos criar soluções práticas e duradouras, 
                sempre respeitando a cultura, a fé e os direitos das comunidades que apoiamos.
              </p>
              <p className="text-xl font-semibold text-primary">
                A Moz Solidária é mais do que uma organização – é um movimento de união, empatia e compromisso com a vida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparência Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold">Transparência</h2>
              <p className="text-xl text-muted-foreground">
                A transparência é um dos nossos pilares fundamentais
              </p>
            </div>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Na Moz Solidária, a transparência é um dos nossos pilares fundamentais. Acreditamos que prestar 
                contas com clareza e responsabilidade é essencial para manter a confiança de todos que caminham 
                ao nosso lado — doadores, voluntários, parceiros e beneficiários.
              </p>
              <p>
                Todos os recursos que recebemos são cuidadosamente administrados e direcionados exclusivamente 
                para os projetos e ações humanitárias que realizamos. Publicamos regularmente relatórios de 
                atividades, balanços financeiros e resultados alcançados, garantindo que cada doação seja usada 
                de forma ética e eficiente.
              </p>
              <p>
                Adotamos uma política de portas abertas: qualquer pessoa pode solicitar informações detalhadas 
                sobre nossas operações, projetos e finanças. Nosso compromisso é com a verdade, a integridade 
                e a justiça social.
              </p>
              <p className="text-xl font-semibold text-primary">
                A solidariedade só é plena quando acompanhada da honestidade. Por isso, fazemos questão de 
                mostrar com clareza como ajudamos, quem ajudamos e com o que contamos para isso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 mb-20">
            <Card className="text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Nossa Missão</h3>
                <p className="text-muted-foreground">
                  Promover ações de solidariedade, desenvolvimento humano e justiça social, com foco na 
                  reconstrução, apoio emergencial, educação e empoderamento das comunidades afetadas na 
                  província de Cabo Delgado.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">Nossa Visão</h3>
                <p className="text-muted-foreground">
                  Ser referência em Moçambique como uma organização comprometida com a dignidade humana, 
                  a união comunitária e o desenvolvimento sustentável nas zonas afetadas por conflitos e pobreza.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Nossos Valores</h3>
                <p className="text-muted-foreground">
                  Solidariedade, fé e espiritualidade, justiça social, transparência, resiliência comunitária, 
                  educação e empoderamento, respeito à dignidade humana.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values Grid */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">Nossos Valores Fundamentais</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Os princípios que orientam nosso trabalho e relacionamento com as comunidades
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Liderança */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Nossa Liderança</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              "Unidos pela mesma causa" - compromisso com a dignidade humana e desenvolvimento sustentável
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-8 space-y-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Adamo Ernesto Abdala</h3>
                  <p className="text-lg text-primary font-semibold mb-4">Director Executivo</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Sob a liderança do Senhor Adamo Ernesto Abdala, nossa organização está comprometida com a 
                    promoção da igualdade de gênero, defesa dos direitos da mulher e a prestação de apoio humanitário 
                    às comunidades locais. Nossa missão é fortalecer as capacidades das comunidades por meio de 
                    treinamentos e capacitações, especialmente focados na preparação de jovens para o mercado de trabalho.
                  </p>
                </div>
                <div className="border-t pt-6">
                  <p className="text-sm text-muted-foreground italic">
                    "Estamos abertos a parcerias e colaborações que ampliem o alcance e o impacto das nossas ações, 
                    na busca por uma sociedade mais justa, igualitária e resiliente."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* História */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Nossa História</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma jornada de 10 anos transformando vidas em Cabo Delgado
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {item.year}
                    </div>
                  </div>
                  <Card className="flex-1">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Nossa Equipe</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Profissionais dedicados ao desenvolvimento das comunidades de Cabo Delgado
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Nossa Localização</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold">
                Cabo Delgado, Moçambique
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Situada na região norte de Moçambique, Cabo Delgado é uma província rica em 
                recursos naturais e diversidade cultural. É aqui que concentramos nossos esforços 
                para promover o desenvolvimento sustentável e melhorar a qualidade de vida das 
                comunidades locais.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Operando desde 2014</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>25+ comunidades apoiadas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <span>5,000+ vidas impactadas</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1949766.8947429783!2d38.5!3d-11.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a32ca4ef0d6c4cf%3A0x1c5a1e3a6e5a1a1a!2sCabo%20Delgado%2C%20Mo%C3%A7ambique!5e0!3m2!1spt!2smz!4v1648000000000!5m2!1spt!2smz"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa de Cabo Delgado, Moçambique"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Cabo Delgado - Província onde concentramos nossos esforços humanitários
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-solidarity-orange to-solidarity-warm text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Junte-se à Nossa Missão
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Seja parte da transformação positiva em Cabo Delgado. Sua contribuição faz a diferença.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/doacao">
              <Button 
                size="lg" 
                className="bg-white text-solidarity-orange hover:bg-white/90 text-lg px-8"
              >
                Fazer Doação
                <Heart className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="
                bg-white text-solidarity-orange hover:bg-white/90 text-lg px-8
              "
            >
              Ser Voluntário
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sobre;