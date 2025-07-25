import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Heart, Home, BookOpen, Stethoscope, Users, AlertTriangle, Handshake, ArrowRight, CheckCircle, MapPin, Calendar } from "lucide-react";

const Programas = () => {
  const programs = [
    {
      id: 1,
      icon: Heart,
      title: "Apoio Alimentar",
      description: "Distribuímos cestas básicas e refeições prontas a famílias em situação de vulnerabilidade, especialmente deslocados por conflitos ou desastres. Nosso objetivo é combater a fome e garantir dignidade nas emergências.",
      color: "text-mozambique-red",
      bgColor: "bg-mozambique-red/10",
      beneficiaries: "Centenas de famílias",
      locations: "Comunidades vulneráveis",
      duration: "Programa contínuo",
      achievements: [
        "Famílias deslocadas alimentadas regularmente",
        "Cestas básicas distribuídas mensalmente",
        "Refeições prontas em situações de emergência",
        "Combate direto à fome e desnutrição"
      ],
      activities: [
        "Distribuição de cestas básicas",
        "Preparação de refeições prontas",
        "Apoio nutricional especializado",
        "Identificação de famílias vulneráveis",
        "Coordenação com autoridades locais"
      ]
    },
    {
      id: 2,
      icon: Home,
      title: "Reconstrução Comunitária",
      description: "Ajudamos na reabilitação e construção de casas, escolas e infraestruturas básicas em comunidades afetadas. Buscamos restaurar espaços essenciais para a vida social, educativa e familiar.",
      color: "text-solidarity-blue",
      bgColor: "bg-solidarity-blue/10",
      beneficiaries: "Comunidades inteiras",
      locations: "Zonas afetadas por conflitos",
      duration: "Projetos de médio prazo",
      achievements: [
        "Casas reconstruídas para famílias deslocadas",
        "Escolas reabilitadas para comunidades",
        "Infraestruturas básicas restauradas",
        "Espaços comunitários revitalizados"
      ],
      activities: [
        "Reconstrução de habitações",
        "Reabilitação de escolas",
        "Construção de infraestruturas básicas",
        "Restauração de espaços comunitários",
        "Formação em técnicas de construção"
      ]
    },
    {
      id: 3,
      icon: BookOpen,
      title: "Educação",
      description: "Apoiamos crianças e jovens com material escolar, bolsas de estudo e acesso a um ensino mais inclusivo e seguro. Acreditamos que a educação é a base para um futuro melhor e mais justo.",
      color: "text-mozambique-green",
      bgColor: "bg-mozambique-green/10",
      beneficiaries: "Crianças e jovens",
      locations: "Escolas comunitárias",
      duration: "Programa anual",
      achievements: [
        "Material escolar distribuído regularmente",
        "Bolsas de estudo concedidas",
        "Acesso inclusivo ao ensino garantido",
        "Espaços educativos seguros criados"
      ],
      activities: [
        "Distribuição de material escolar",
        "Concessão de bolsas de estudo",
        "Criação de ambientes educativos seguros",
        "Apoio a ensino inclusivo",
        "Formação de educadores comunitários"
      ]
    },
    {
      id: 4,
      icon: Stethoscope,
      title: "Saúde Pública",
      description: "Realizamos campanhas de prevenção, sensibilização e apoio em saúde, promovendo higiene, vacinação e cuidados médicos básicos. Trabalhamos por comunidades mais saudáveis e conscientes.",
      color: "text-solidarity-orange",
      bgColor: "bg-solidarity-orange/10",
      beneficiaries: "Comunidades inteiras",
      locations: "Postos de saúde comunitários",
      duration: "Campanhas regulares",
      achievements: [
        "Campanhas de prevenção realizadas",
        "Vacinação comunitária organizada",
        "Cuidados médicos básicos prestados",
        "Educação em higiene promovida"
      ],
      activities: [
        "Campanhas de vacinação",
        "Educação em saúde e higiene",
        "Cuidados médicos básicos",
        "Prevenção de doenças",
        "Sensibilização comunitária"
      ]
    },
    {
      id: 5,
      icon: Users,
      title: "Formação Juvenil e Profissional",
      description: "Oferecemos formações práticas e oficinas para capacitar jovens ao mercado de trabalho e à criação de pequenos negócios. Nosso foco é fortalecer a autonomia e a geração de renda.",
      color: "text-mozambique-yellow",
      bgColor: "bg-mozambique-yellow/10",
      beneficiaries: "Jovens da comunidade",
      locations: "Centros de formação",
      duration: "Cursos trimestrais",
      achievements: [
        "Jovens capacitados para o mercado de trabalho",
        "Pequenos negócios criados",
        "Autonomia económica fortalecida",
        "Oportunidades de renda geradas"
      ],
      activities: [
        "Formações profissionais práticas",
        "Oficinas de capacitação",
        "Apoio à criação de negócios",
        "Desenvolvimento de competências",
        "Orientação para o mercado de trabalho"
      ]
    },
    {
      id: 6,
      icon: AlertTriangle,
      title: "Ação Emergencial",
      description: "Respondemos rapidamente em situações de crise, como deslocamentos forçados, desastres naturais e surtos de doenças. Enviamos ajuda humanitária, organizamos abrigos e protegemos os mais frágeis.",
      color: "text-mozambique-red",
      bgColor: "bg-mozambique-red/10",
      beneficiaries: "Populações em crise",
      locations: "Zonas de emergência",
      duration: "Resposta imediata",
      achievements: [
        "Resposta rápida a situações de crise",
        "Ajuda humanitária enviada",
        "Abrigos organizados para deslocados",
        "Proteção aos mais vulneráveis"
      ],
      activities: [
        "Resposta rápida a emergências",
        "Distribuição de ajuda humanitária",
        "Organização de abrigos temporários",
        "Proteção de grupos vulneráveis",
        "Coordenação com organizações de socorro"
      ]
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
              Áreas de Atuação
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Atuamos com foco no alívio do sofrimento, restauração da dignidade e 
              reconstrução de vidas nas comunidades mais vulneráveis de Cabo Delgado
            </p>
          </div>
        </div>
      </section>

      {/* Impact Overview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Projetos e Impactos</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Os impactos são visíveis na melhoria da qualidade de vida das comunidades atendidas
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-primary">5,000+</div>
              <div className="text-muted-foreground font-medium">Beneficiários Diretos</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-secondary">25</div>
              <div className="text-muted-foreground font-medium">Comunidades Atendidas</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-accent">4</div>
              <div className="text-muted-foreground font-medium">Áreas de Atuação</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-solidarity-orange">10</div>
              <div className="text-muted-foreground font-medium">Anos de Experiência</div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Detail */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 space-y-20">
          {programs.map((program, index) => {
            const IconComponent = program.icon;
            return (
              <div key={program.id} className={`${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} flex flex-col lg:flex-row gap-12 items-center`}>
                <div className="lg:w-1/2 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${program.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`h-8 w-8 ${program.color}`} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{program.title}</h2>
                      <Badge variant="secondary" className="mt-2">Programa Ativo</Badge>
                    </div>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {program.description}
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{program.beneficiaries}</div>
                        <div className="text-sm text-muted-foreground">Beneficiários</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{program.locations}</div>
                        <div className="text-sm text-muted-foreground">Localizações</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{program.duration}</div>
                        <div className="text-sm text-muted-foreground">Duração</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    Saber Mais
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="lg:w-1/2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Principais Conquistas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {program.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Atividades Principais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {program.activities.map((activity, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How to Support */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Como Apoiar Nossos Programas</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Existem várias formas de contribuir para o sucesso dos nossos programas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Doações Monetárias</h3>
                <p className="text-muted-foreground">
                  Contribua financeiramente para apoiar as atividades dos nossos programas.
                </p>
                <Link to="/doacao">
                  <Button variant="outline">Fazer Doação</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold">Voluntariado</h3>
                <p className="text-muted-foreground">
                  Doe seu tempo e conhecimento para apoiar diretamente nossas atividades.
                </p>
                <Button variant="outline">Ser Voluntário</Button>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Handshake className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Parcerias</h3>
                <p className="text-muted-foreground">
                  Empresas e organizações podem estabelecer parcerias estratégicas conosco.
                </p>
                <Button variant="outline">Fazer Parceria</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-solidarity-orange to-solidarity-warm text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Transforme Vidas Conosco
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Sua participação é fundamental para expandir e fortalecer nossos programas. 
            Juntos podemos fazer ainda mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-solidarity-orange hover:bg-white/90 text-lg px-8"
            >
              Contribuir Agora
              <Heart className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-solidarity-orange text-lg px-8"
            >
              Entrar em Contacto
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programas;