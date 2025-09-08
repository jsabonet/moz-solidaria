import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { 
  Eye, 
  FileText, 
  DollarSign, 
  Users, 
  BarChart3, 
  Download, 
  Calendar, 
  CheckCircle, 
  Target,
  Award,
  Globe,
  Heart,
  TrendingUp,
  PieChart,
  Building
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Transparencia = () => {
  const financialData = [
    {
      year: "2024",
      totalReceived: "2.450.000",
      programExpenses: "2.205.000",
      adminExpenses: "147.000",
      reserves: "98.000",
      transparency: "95%"
    },
    {
      year: "2023", 
      totalReceived: "1.890.000",
      programExpenses: "1.701.000",
      adminExpenses: "113.400",
      reserves: "75.600",
      transparency: "93%"
    },
    {
      year: "2022",
      totalReceived: "1.340.000",
      programExpenses: "1.206.000",
      adminExpenses: "80.400",
      reserves: "53.600",
      transparency: "91%"
    }
  ];

  const impactMetrics = [
    {
      icon: Users,
      title: "Beneficiários Diretos",
      value: "5.247",
      period: "2024",
      growth: "+23%",
      color: "text-blue-600"
    },
    {
      icon: Heart,
      title: "Famílias Apoiadas",
      value: "1.243",
      period: "2024",
      growth: "+18%",
      color: "text-red-600"
    },
    {
      icon: Building,
      title: "Infraestruturas Reconstruídas",
      value: "47",
      period: "2024",
      growth: "+31%",
      color: "text-green-600"
    },
    {
      icon: Award,
      title: "Jovens Capacitados",
      value: "386",
      period: "2024",
      growth: "+42%",
      color: "text-purple-600"
    }
  ];

  const programs = [
    {
      name: "Apoio Alimentar",
      budget: "1.102.500",
      percentage: "45%",
      beneficiaries: "2.350",
      color: "bg-red-500"
    },
    {
      name: "Reconstrução",
      budget: "588.000",
      percentage: "24%",
      beneficiaries: "890",
      color: "bg-blue-500"
    },
    {
      name: "Educação",
      budget: "441.000",
      percentage: "18%",
      beneficiaries: "1.120",
      color: "bg-green-500"
    },
    {
      name: "Saúde",
      budget: "220.500",
      percentage: "9%",
      beneficiaries: "650",
      color: "bg-purple-500"
    },
    {
      name: "Direitos Humanos",
      budget: "98.000",
      percentage: "4%",
      beneficiaries: "237",
      color: "bg-orange-500"
    }
  ];

  const reports = [
    {
      title: "Relatório Anual 2024",
      description: "Relatório completo de atividades, impacto e finanças do exercício 2024",
      type: "Relatório Anual",
      size: "2.4 MB",
      date: "Janeiro 2025",
      status: "Disponível"
    },
    {
      title: "Demonstrações Financeiras 2024",
      description: "Balanço patrimonial, demonstração de resultados e fluxo de caixa auditados",
      type: "Financeiro",
      size: "1.8 MB", 
      date: "Fevereiro 2025",
      status: "Disponível"
    },
    {
      title: "Relatório de Impacto Q4 2024",
      description: "Métricas de impacto social e indicadores de performance do último trimestre",
      type: "Impacto Social",
      size: "1.2 MB",
      date: "Janeiro 2025", 
      status: "Disponível"
    },
    {
      title: "Auditoria Externa 2024",
      description: "Relatório de auditoria independente por empresa certificada",
      type: "Auditoria",
      size: "900 KB",
      date: "Março 2025",
      status: "Em breve"
    },
    {
      title: "Plano Estratégico 2025-2027",
      description: "Planejamento estratégico para os próximos três anos",
      type: "Planejamento",
      size: "1.5 MB",
      date: "Dezembro 2024",
      status: "Disponível"
    }
  ];

  const partnerships = [
    {
      name: "Programa Mundial de Alimentos (WFP)",
      type: "Organização Internacional",
      focus: "Segurança Alimentar",
      duration: "2022-2025"
    },
    {
      name: "UNICEF Moçambique", 
      type: "Agência da ONU",
      focus: "Proteção da Criança",
      duration: "2023-2026"
    },
    {
      name: "Governo Provincial de Cabo Delgado",
      type: "Parceiro Governamental",
      focus: "Coordenação de Ações",
      duration: "Permanente"
    },
    {
      name: "Igreja Católica de Pemba",
      type: "Organização Religiosa",
      focus: "Ação Comunitária",
      duration: "2021-Presente"
    },
    {
      name: "Cruz Vermelha Moçambicana",
      type: "Organização Humanitária",
      focus: "Resposta a Emergências",
      duration: "2023-2025"
    }
  ];

  const principles = [
    {
      icon: Eye,
      title: "Transparência Total",
      description: "Divulgação completa de informações sobre nossas atividades, finanças e impacto social."
    },
    {
      icon: Target,
      title: "Responsabilidade",
      description: "Prestação de contas rigorosa a doadores, beneficiários e comunidade em geral."
    },
    {
      icon: Award,
      title: "Eficiência",
      description: "Maximização do impacto social com uso eficiente e responsável dos recursos disponíveis."
    },
    {
      icon: Globe,
      title: "Integridade",
      description: "Conduta ética em todas as operações, respeitando os mais altos padrões morais."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead page="transparencia" />
      
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-solidarity-blue to-mozambique-red text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Eye className="h-12 w-12" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                Transparência
              </h1>
            </div>
            <p className="text-xl opacity-90 leading-relaxed">
              Acreditamos que a transparência é fundamental para construir confiança e demonstrar 
              o impacto real das nossas ações humanitárias em Cabo Delgado.
            </p>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 inline-block">
              <p className="text-sm">
                <strong>Compromisso:</strong> 90% dos recursos destinados diretamente aos programas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Princípios de Transparência */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Nossos Princípios</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {principles.map((principle, index) => (
                <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <principle.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">{principle.title}</h4>
                        <p className="text-muted-foreground text-sm">{principle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Métricas de Impacto */}
      {/* <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Impacto Social 2024</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {impactMetrics.map((metric, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <metric.icon className={`h-8 w-8 ${metric.color} mx-auto`} />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {metric.value}
                    </div>
                    <div className="text-sm font-medium text-foreground mb-1">
                      {metric.title}
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs">
                      <span className="text-muted-foreground">{metric.period}</span>
                      <span className="text-green-600 font-semibold">{metric.growth}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section> */}


      {/* Evolução Financeira */}
      {/* <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Evolução Financeira</h2>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary/10">
                      <tr>
                        <th className="text-left p-4 font-semibold">Ano</th>
                        <th className="text-left p-4 font-semibold">Total Recebido</th>
                        <th className="text-left p-4 font-semibold">Programas</th>
                        <th className="text-left p-4 font-semibold">Administração</th>
                        <th className="text-left p-4 font-semibold">Reservas</th>
                        <th className="text-left p-4 font-semibold">Transparência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.map((data, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-semibold">{data.year}</td>
                          <td className="p-4">{data.totalReceived} MZN</td>
                          <td className="p-4 text-green-600">{data.programExpenses} MZN</td>
                          <td className="p-4">{data.adminExpenses} MZN</td>
                          <td className="p-4">{data.reserves} MZN</td>
                          <td className="p-4">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                              {data.transparency}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600 mb-1">+83%</div>
                <div className="text-sm text-muted-foreground">Crescimento em 3 anos</div>
              </Card>
              
              <Card className="text-center p-6">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-600 mb-1">90%</div>
                <div className="text-sm text-muted-foreground">Recursos para programas</div>
              </Card>
              
              <Card className="text-center p-6">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-600 mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Índice de transparência</div>
              </Card>
            </div>
          </div>
        </div>
      </section>
 */}

      {/* Relatórios e Documentos */}
      {/* <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Relatórios e Documentos</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'Disponível' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {report.description}
                    </p>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Tipo:</span>
                        <span className="font-medium">{report.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tamanho:</span>
                        <span className="font-medium">{report.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data:</span>
                        <span className="font-medium">{report.date}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      disabled={report.status === 'Em breve'}
                      variant={report.status === 'Em breve' ? 'outline' : 'default'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {report.status === 'Em breve' ? 'Em Breve' : 'Baixar PDF'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Card className="inline-block p-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold">Atualizações Regulares</div>
                    <div className="text-sm text-muted-foreground">
                      Novos relatórios publicados trimestralmente
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section> */}

      {/* Parcerias e Certificações */}
      {/* <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Parcerias Estratégicas</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partnerships.map((partnership, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{partnership.name}</h4>
                        <div className="text-sm text-muted-foreground mb-2">{partnership.type}</div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <strong>Foco:</strong> {partnership.focus}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {partnership.duration}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="text-2xl font-bold text-primary mb-2">15+</div>
                  <div className="text-sm text-muted-foreground">Parcerias Ativas</div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-2xl font-bold text-primary mb-2">5</div>
                  <div className="text-sm text-muted-foreground">Organizações Internacionais</div>
                </Card>
                
                <Card className="p-6">
                  <div className="text-2xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Parcerias Formalizadas</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Contato para Transparência */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Compromisso com a Transparência</h2>
            
            <Card className="p-8 border-primary/20">
              <CardContent className="p-0 space-y-6">
                <div className="flex items-center justify-center space-x-3">
                  <Eye className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Transparência Total</h3>
                    <p className="text-muted-foreground">
                      Estamos comprometidos em manter você informado sobre cada aspecto do nosso trabalho
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-semibold mb-2">Para Doadores</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Relatórios detalhados de uso de recursos</li>
                      <li>• Atualizações regulares sobre projetos</li>
                      <li>• Acesso a demonstrações financeiras</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Para a Comunidade</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Reuniões comunitárias regulares</li>
                      <li>• Publicação de resultados e impactos</li>
                      <li>• Canais abertos de comunicação</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <p className="text-muted-foreground mb-4">
                    Tem dúvidas sobre nossos relatórios ou quer mais informações sobre transparência?
                  </p>
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> transparencia@mozsolidaria.org</div>
                    <div><strong>Telefone:</strong> +258 86 204 0330</div>
                    <div><strong>Horário:</strong> Segunda a Sexta, 8h às 17h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Transparencia;
