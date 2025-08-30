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
  ArrowLeft,
  MapPin,
  Calendar,
  Target,
  CheckCircle,
  TrendingUp,
  Phone,
  Mail
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const ProgramaDetail = () => {
  const { id } = useParams();

  const programsData = {
    "apoio-alimentar": {
      icon: Heart,
      title: "Apoio Alimentar e Nutricional",
      subtitle: "Combatendo a fome e desnutrição em Cabo Delgado",
      description: "Nosso programa de apoio alimentar é uma resposta direta à crise humanitária em Cabo Delgado, onde milhares de famílias foram deslocadas por conflitos armados e perderam seus meios de subsistência. Trabalhamos para garantir segurança alimentar e melhorar o estado nutricional das populações mais vulneráveis.",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      
      objectives: [
        "Reduzir a insegurança alimentar em 80% das famílias assistidas",
        "Melhorar o estado nutricional de crianças menores de 5 anos",
        "Fortalecer a capacidade produtiva local através de hortas comunitárias",
        "Promover educação nutricional e práticas alimentares saudáveis"
      ],
      
      activities: [
        {
          title: "Distribuição de Cestas Básicas",
          description: "Distribuição semanal de alimentos básicos (arroz, feijão, óleo, açúcar, sal) para 500+ famílias em situação de vulnerabilidade extrema.",
          frequency: "Semanal",
          beneficiaries: "500+ famílias"
        },
        {
          title: "Refeições Comunitárias",
          description: "Preparação e distribuição de refeições prontas em centros comunitários, garantindo pelo menos uma refeição nutritiva por dia.",
          frequency: "Diário",
          beneficiaries: "1000+ pessoas"
        },
        {
          title: "Recuperação Nutricional Infantil",
          description: "Programa especializado para crianças desnutridas com suplementos nutricionais e acompanhamento médico.",
          frequency: "Contínuo",
          beneficiaries: "200+ crianças"
        },
        {
          title: "Hortas Comunitárias",
          description: "Estabelecimento de hortas comunitárias e familiares para produção local de vegetais e verduras.",
          frequency: "Permanente",
          beneficiaries: "50+ famílias produtoras"
        }
      ],
      
      impact: {
        current: "500+ famílias apoiadas mensalmente",
        stats: [
          { number: "500", label: "Famílias Assistidas", period: "Mensalmente" },
          { number: "15000", label: "Refeições Distribuídas", period: "Por mês" },
          { number: "200", label: "Crianças em Recuperação", period: "Atualmente" },
          { number: "25", label: "Hortas Estabelecidas", period: "Total" }
        ]
      },
      
      locations: [
        { name: "Mocímboa da Praia", status: "Centro Principal", families: 200 },
        { name: "Palma", status: "Centro Secundário", families: 150 },
        { name: "Muidumbe", status: "Ponto de Distribuição", families: 100 },
        { name: "Macomia", status: "Ponto de Distribuição", families: 50 }
      ],
      
      partnerships: [
        "Programa Mundial de Alimentos (WFP)",
        "UNICEF Moçambique",
        "Governo Provincial de Cabo Delgado",
        "Igreja Católica Local",
        "Organizações Comunitárias de Base"
      ],
      
      testimonials: [
        {
          name: "Maria João",
          location: "Mocímboa da Praia",
          text: "Antes do programa, meus filhos dormiam com fome. Agora temos comida todas as semanas e aprendi a cultivar verduras no quintal."
        },
        {
          name: "António Silva",
          location: "Palma",
          text: "A horta comunitária mudou nossa vida. Não só temos alimentos frescos, mas também vendemos o excesso no mercado local."
        }
      ],
      
      contact: {
        coordinator: "Dr. Fátima Nampula",
        phone: "+258 84 123 4567",
        email: "alimentar@mozsolidaria.org"
      }
    },
    
    "reconstrucao": {
      icon: Home,
      title: "Reconstrução e Habitação",
      subtitle: "Reconstruindo vidas e comunidades em Cabo Delgado",
      description: "O programa de reconstrução visa restaurar a infraestrutura básica e habitacional destruída pelos conflitos, criando condições dignas de vida para as famílias deslocadas e comunidades afetadas.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      
      objectives: [
        "Construir habitações dignas para famílias deslocadas",
        "Reabilitar infraestruturas comunitárias essenciais",
        "Desenvolver capacidades locais em construção",
        "Promover uso de materiais locais e técnicas sustentáveis"
      ],
      
      activities: [
        {
          title: "Construção de Habitações",
          description: "Construção de casas permanentes e abrigos temporários utilizando materiais locais e técnicas tradicionais melhoradas.",
          frequency: "Contínuo",
          beneficiaries: "150+ famílias"
        },
        {
          title: "Reabilitação de Escolas",
          description: "Reconstrução e reabilitação de salas de aula, instalações sanitárias e mobiliário escolar.",
          frequency: "Por projeto",
          beneficiaries: "3000+ estudantes"
        },
        {
          title: "Infraestrutura de Saúde",
          description: "Construção e reabilitação de postos de saúde e centros comunitários de saúde.",
          frequency: "Por projeto",
          beneficiaries: "10000+ pessoas"
        },
        {
          title: "Saneamento Básico",
          description: "Construção de latrinas melhoradas, sistemas de drenagem e gestão de resíduos sólidos.",
          frequency: "Contínuo",
          beneficiaries: "500+ famílias"
        }
      ],
      
      impact: {
        current: "150+ estruturas reconstruídas",
        stats: [
          { number: "120", label: "Casas Construídas", period: "Total" },
          { number: "15", label: "Escolas Reabilitadas", period: "Total" },
          { number: "8", label: "Postos de Saúde", period: "Total" },
          { number: "300", label: "Latrinas Construídas", period: "Total" }
        ]
      },
      
      locations: [
        { name: "Pemba", status: "Centro Técnico", families: 0 },
        { name: "Montepuez", status: "Área de Construção", families: 80 },
        { name: "Chiúre", status: "Área de Construção", families: 40 },
        { name: "Ancuabe", status: "Área de Construção", families: 30 }
      ],
      
      partnerships: [
        "UN-Habitat",
        "Ministério das Obras Públicas",
        "Empresas de Construção Locais",
        "Associações de Artesãos",
        "ONGs Internacionais de Habitação"
      ],
      
      testimonials: [
        {
          name: "João Mussa",
          location: "Montepuez",
          text: "Depois de dois anos vivendo numa barraca, finalmente temos uma casa de verdade. Meus filhos podem estudar em paz."
        },
        {
          name: "Aisha Omar",
          location: "Chiúre",
          text: "A nova escola da nossa comunidade trouxe esperança. Agora as crianças não precisam caminhar 10km para estudar."
        }
      ],
      
      contact: {
        coordinator: "Eng. Carlos Mateus",
        phone: "+258 84 234 5678",
        email: "construcao@mozsolidaria.org"
      }
    }
    
    // Adicionar outros programas seguindo o mesmo padrão...
  };

  const program = programsData[id as keyof typeof programsData];

  if (!program) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Programa não encontrado</h1>
          <Link to="/programas">
            <Button>Voltar às Áreas de Atuação</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${program.title} - MOZ SOLIDÁRIA`}
        description={program.description}
        keywords={`${program.title.toLowerCase()}, cabo delgado, moçambique, programa humanitário`}
        type="article"
      />
      
      <Header />

      {/* Breadcrumb */}
      <section className="py-4 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">Início</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/programas" className="text-muted-foreground hover:text-primary">Áreas de Atuação</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{program.title}</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className={`relative ${program.bgColor} py-20`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link to="/programas" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Áreas de Atuação
            </Link>
            
            <div className="flex items-start space-x-6">
              <div className="p-4 rounded-full bg-white shadow-lg">
                <program.icon className={`h-12 w-12 ${program.color}`} />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  {program.title}
                </h1>
                <p className={`text-xl font-semibold ${program.color} mb-6`}>
                  {program.subtitle}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {program.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {program.impact.stats.map((stat, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="p-0">
                  <div className={`text-3xl font-bold ${program.color} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.period}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Objetivos do Programa</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {program.objectives.map((objective, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${program.bgColor} mt-1`}>
                  <Target className={`h-5 w-5 ${program.color}`} />
                </div>
                <p className="text-muted-foreground leading-relaxed">{objective}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Principais Atividades</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {program.activities.map((activity, index) => (
              <Card key={index} className={`${program.borderColor} border-l-4`}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{activity.title}</span>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${program.color}`}>
                        {activity.frequency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.beneficiaries}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Localização das Atividades</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {program.locations.map((location, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <MapPin className={`h-8 w-8 ${program.color} mx-auto mb-3`} />
                  <h3 className="font-semibold text-foreground mb-2">{location.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{location.status}</p>
                  {location.families > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {location.families} famílias atendidas
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Histórias de Impacto</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {program.testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <blockquote className="text-muted-foreground italic leading-relaxed mb-4">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${program.color.replace('text-', 'bg-')}`}></div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact and Support */}
      <section className={`py-16 ${program.bgColor}`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Apoie Este Programa</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Sua contribuição faz a diferença na vida de centenas de famílias. 
                Cada doação, por menor que seja, tem um impacto direto e transformador 
                nas comunidades de Cabo Delgado.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Coordenador do Programa</div>
                    <div className="text-muted-foreground">{program.contact.coordinator}</div>
                    <div className="text-sm text-muted-foreground">{program.contact.phone}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Email do Programa</div>
                    <div className="text-muted-foreground">{program.contact.email}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/doacao">
                  <Button size="lg" className="w-full sm:w-auto">
                    Fazer Doação
                    <Heart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contacto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Ser Voluntário
                    <Users className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div>
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Parcerias Estratégicas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-3">
                    {program.partnerships.map((partner, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">{partner}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProgramaDetail;
