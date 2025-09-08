import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { 
  Heart, 
  Users, 
  BookOpen, 
  Home, 
  Stethoscope, 
  Handshake, 
  ArrowRight,
  GraduationCap,
  Baby,
  Utensils,
  Shield,
  Droplets,
  Building,
  TreePine,
  HandHeart,
  Target,
  CheckCircle,
  MapPin,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

const Programas = () => {
  const mainPrograms = [
    {
      id: "apoio-alimentar",
      icon: Heart,
      title: "Apoio Alimentar e Nutricional",
      subtitle: "Combatendo a fome e desnutrição",
      description: "Distribuímos cestas básicas, refeições prontas e suplementos nutricionais a famílias em situação de vulnerabilidade, especialmente deslocados por conflitos armados. Nosso programa inclui educação nutricional e hortas comunitárias.",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      impact: "500+ famílias apoiadas mensalmente",
      activities: [
        "Distribuição de cestas básicas semanais",
        "Refeições prontas em centros comunitários",
        "Programas de recuperação nutricional infantil",
        "Hortas comunitárias e agricultura familiar",
        "Educação nutricional para mães"
      ],
      locations: ["Mocímboa da Praia", "Palma", "Muidumbe", "Macomia"],
      beneficiaries: "Famílias deslocadas, crianças em risco nutricional, idosos"
    },
    {
      id: "reconstrucao",
      icon: Home,
      title: "Reconstrução e Habitação",
      subtitle: "Reconstruindo vidas e comunidades",
      description: "Ajudamos na reabilitação e construção de casas, escolas, postos de saúde e infraestruturas básicas em comunidades afetadas por conflitos. Priorizamos materiais locais e envolvimento comunitário.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      impact: "150+ estruturas reconstruídas",
      activities: [
        "Construção de abrigos temporários e permanentes",
        "Reabilitação de escolas e postos de saúde",
        "Construção de sistemas de saneamento básico",
        "Infraestrutura comunitária (mercados, centros)",
        "Capacitação em técnicas de construção local"
      ],
      locations: ["Pemba", "Montepuez", "Chiúre", "Ancuabe"],
      beneficiaries: "Famílias sem-abrigo, comunidades rurais, instituições públicas"
    },
    {
      id: "educacao",
      icon: BookOpen,
      title: "Educação e Capacitação",
      subtitle: "Transformando futuros através do conhecimento",
      description: "Oferecemos programas de alfabetização, capacitação profissional, formação técnica e desenvolvimento de competências para jovens e adultos, incluindo educação digital e empreendedorismo.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      impact: "300+ jovens capacitados anualmente",
      activities: [
        "Programas de alfabetização de adultos",
        "Formação técnico-profissional para jovens",
        "Capacitação em tecnologias digitais",
        "Cursos de empreendedorismo e gestão",
        "Bolsas de estudo para ensino superior"
      ],
      locations: ["Pemba", "Mocímboa da Praia", "Mueda", "Nangade"],
      beneficiaries: "Jovens desempregados, adultos analfabetos, mulheres empreendedoras"
    },
    {
      id: "saude",
      icon: Stethoscope,
      title: "Saúde Comunitária",
      subtitle: "Cuidados de saúde para todos",
      description: "Promovemos campanhas de vacinação, educação sanitária, cuidados básicos de saúde preventiva e apoio psicológico. Trabalhamos com agentes comunitários de saúde.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      impact: "2000+ pessoas atendidas por mês",
      activities: [
        "Campanhas de vacinação infantil",
        "Educação sobre higiene e saneamento",
        "Prevenção e tratamento da malária",
        "Saúde materno-infantil",
        "Apoio psicossocial para traumas"
      ],
      locations: ["Cabo Delgado (todas as províncias)"],
      beneficiaries: "Crianças, gestantes, comunidades rurais, vítimas de conflito"
    },
    {
      id: "direitos-humanos",
      icon: Users,
      title: "Direitos Humanos e Proteção",
      subtitle: "Defendendo dignidade e justiça",
      description: "Defendemos e promovemos os direitos fundamentais, especialmente de mulheres, crianças e grupos vulneráveis. Oferecemos apoio jurídico e advocacy.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      impact: "100+ casos de proteção apoiados",
      activities: [
        "Proteção de crianças em risco",
        "Apoio jurídico a vítimas de violência",
        "Campanhas de consciencialização sobre direitos",
        "Advocacy junto às autoridades locais",
        "Formação em direitos humanos"
      ],
      locations: ["Pemba", "Mocímboa da Praia", "Palma"],
      beneficiaries: "Mulheres vítimas de violência, crianças órfãs, grupos marginalizados"
    },
    {
      id: "apoio-psicossocial",
      icon: Handshake,
      title: "Apoio Psicossocial",
      subtitle: "Curando traumas e fortalecendo esperança",
      description: "Oferecemos suporte emocional e psicológico a pessoas traumatizadas por conflitos, desastres naturais e situações de vulnerabilidade extrema.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      impact: "800+ pessoas acompanhadas",
      activities: [
        "Terapia individual e em grupo",
        "Atividades recreativas e culturais",
        "Grupos de apoio comunitário",
        "Mediação e resolução de conflitos",
        "Reintegração social de ex-combatentes"
      ],
      locations: ["Centros comunitários regionais"],
      beneficiaries: "Vítimas de trauma, ex-combatentes, famílias deslocadas"
    }
  ];

  const emergencyPrograms = [
    {
      icon: Shield,
      title: "Resposta a Emergências",
      description: "Intervenção rápida em situações de crise, desastres naturais e conflitos.",
      impact: "24h tempo de resposta"
    },
    {
      icon: Droplets,
      title: "Água e Saneamento",
      description: "Construção de poços, sistemas de água potável e latrinas comunitárias.",
      impact: "50+ poços construídos"
    },
    {
      icon: Baby,
      title: "Proteção da Criança",
      description: "Proteção especial para crianças órfãs, desacompanhadas e em risco.",
      impact: "200+ crianças protegidas"
    },
    {
      icon: GraduationCap,
      title: "Educação de Emergência",
      description: "Espaços temporários de aprendizagem e educação não-formal.",
      impact: "15+ escolas temporárias"
    }
  ];

  const statistics = [
    { number: "6", label: "Áreas Principais", suffix: "" },
    { number: "12", label: "Distritos Atendidos", suffix: "" },
    { number: "5000", label: "Beneficiários Diretos", suffix: "+" },
    { number: "15000", label: "Beneficiários Indiretos", suffix: "+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="programas" />
      
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-solidarity-blue to-mozambique-red text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Nossas Áreas de Atuação
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 leading-relaxed">
              Trabalhamos em múltiplas frentes para criar um impacto duradouro e transformador 
              nas comunidades de Cabo Delgado, respondendo às necessidades mais urgentes e 
              promovendo desenvolvimento sustentável.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl lg:text-4xl font-bold text-primary">
                  {stat.number}{stat.suffix}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Programs Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Programas Principais
            </h2>
            <p className="text-xl text-muted-foreground">
              Nossas seis áreas principais de intervenção abordam as necessidades mais críticas 
              das comunidades afetadas em Cabo Delgado.
            </p>
          </div>

          <div className="space-y-12">
            {mainPrograms.map((program, index) => (
              <Card key={program.id} className={`${program.borderColor} border-l-4 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Program Header */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start space-x-4 mb-6">
                        <div className={`p-4 rounded-full ${program.bgColor}`}>
                          <program.icon className={`h-8 w-8 ${program.color}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {program.title}
                          </h3>
                          <p className={`text-lg font-semibold ${program.color} mb-4`}>
                            {program.subtitle}
                          </p>
                          <p className="text-muted-foreground leading-relaxed">
                            {program.description}
                          </p>
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <Target className="h-5 w-5 mr-2 text-primary" />
                          Principais Atividades
                        </h4>
                        <ul className="space-y-2">
                          {program.activities.map((activity, actIndex) => (
                            <li key={actIndex} className="flex items-start space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Program Details */}
                    <div className="space-y-6">
                      {/* Impact */}
                      <div className={`p-4 rounded-lg ${program.bgColor}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className={`h-5 w-5 ${program.color}`} />
                          <span className="font-semibold">Impacto</span>
                        </div>
                        <p className={`text-lg font-bold ${program.color}`}>
                          {program.impact}
                        </p>
                      </div>

                      {/* Locations */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Localização</span>
                        </div>
                        <div className="space-y-1">
                          {program.locations.map((location, locIndex) => (
                            <span key={locIndex} className="inline-block bg-muted px-3 py-1 rounded-full text-sm mr-2 mb-2">
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Beneficiaries */}
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Users className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Beneficiários</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {program.beneficiaries}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="space-y-3">
                        <Link to={`/programas/${program.id}`}>
                          <Button variant="outline" className="w-full group">
                            Ver Detalhes Completos
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        <Link to="/doacao">
                          <Button className="w-full group">
                            Apoiar Este Programa
                            <Heart className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Programs */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Programas de Resposta Rápida
            </h2>
            <p className="text-xl text-muted-foreground">
              Além dos programas principais, mantemos capacidade de resposta rápida 
              para situações de emergência e necessidades específicas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyPrograms.map((program, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <program.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {program.description}
                  </p>
                  <div className="text-sm font-semibold text-primary">
                    {program.impact}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Como Trabalhamos
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nossa abordagem é baseada em princípios de participação comunitária, 
                sustentabilidade e respeito pela dignidade humana. Trabalhamos sempre 
                em parceria com as comunidades locais.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Participação Comunitária</h4>
                    <p className="text-muted-foreground text-sm">
                      As comunidades são protagonistas na identificação de necessidades e implementação de soluções.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Foco no Impacto</h4>
                    <p className="text-muted-foreground text-sm">
                      Medimos resultados concretos e transformações duradouras na vida das pessoas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <HandHeart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Abordagem Integrada</h4>
                    <p className="text-muted-foreground text-sm">
                      Combinamos diferentes programas para abordar as necessidades de forma holística.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1000&auto=format&fit=crop"
                alt="Trabalho comunitário em Cabo Delgado"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-solidarity-orange to-mozambique-red text-white">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Faça Parte da Transformação
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Cada contribuição, por menor que seja, tem o poder de transformar vidas. 
            Junte-se a nós nesta missão de esperança e reconstrução em Cabo Delgado.
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
            <Link to="/contacto">
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-solidarity-orange text-lg px-8"
                style={{ borderWidth: '2px' }}
              >
                Ser Voluntário
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programas;
