import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Shield, Mail, Phone, MapPin, Eye, Lock, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PoliticaPrivacidade() {
  const dataRights = [
    {
      icon: Eye,
      title: "Acessar suas informações",
      description: "Solicitar acesso aos dados pessoais que mantemos sobre você"
    },
    {
      icon: FileText,
      title: "Corrigir dados incorretos",
      description: "Solicitar correção de informações desatualizadas ou incorretas"
    },
    {
      icon: AlertTriangle,
      title: "Solicitar exclusão",
      description: "Pedir a remoção dos seus dados pessoais dos nossos sistemas"
    },
    {
      icon: Shield,
      title: "Retirar consentimento",
      description: "Cancelar autorizações previamente concedidas a qualquer momento"
    }
  ];

  const protectionMeasures = [
    "Criptografia de dados sensíveis em trânsito e armazenamento",
    "Controle de acesso baseado em funções e necessidade",
    "Monitoramento contínuo de segurança e auditoria",
    "Backups seguros e planos de recuperação de desastres",
    "Treinamento regular da equipe em proteção de dados",
    "Políticas internas rigorosas de manuseio de informações"
  ];

  const informationTypes = [
    {
      category: "Dados Pessoais Básicos",
      items: ["Nome completo", "Endereço de e-mail", "Número de telefone", "Endereço físico"]
    },
    {
      category: "Dados Financeiros",
      items: ["Dados bancários para doações", "Informações de pagamento", "Histórico de transações"]
    },
    {
      category: "Dados de Consentimento",
      items: ["Imagens e vídeos", "Testemunhos", "Participação em eventos", "Material promocional"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Política de Privacidade - MOZ SOLIDÁRIA"
        description="Conheça nossa política de privacidade e como protegemos seus dados pessoais na Associação Moz Solidária."
        keywords="política de privacidade, proteção de dados, LGPD, segurança, moz solidária"
        type="article"
      />
      
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-solidarity-blue to-mozambique-red text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Shield className="h-12 w-12" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                Política de Privacidade
              </h1>
            </div>
            <p className="text-xl opacity-90 leading-relaxed">
              Seu bem-estar e privacidade são fundamentais para nós. Conheça como protegemos 
              e utilizamos suas informações pessoais de forma transparente e responsável.
            </p>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 inline-block">
              <p className="text-sm">
                <strong>Última atualização:</strong> 25 de julho de 2025
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introdução */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 mb-12 border-primary/20">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Compromisso com sua Privacidade</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      A <strong>Associação Moz Solidária</strong> está comprometida em proteger a privacidade 
                      e os dados pessoais de nossos doadores, voluntários, beneficiários e visitantes do site. 
                      Esta política descreve como coletamos, usamos, protegemos e compartilhamos suas informações 
                      pessoais em conformidade com as melhores práticas de proteção de dados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 1. Coleta de Informações */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">1</span>
              Coleta de Informações
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Coletamos informações pessoais apenas quando necessário para cumprir nossa missão humanitária 
              e melhorar nossos serviços. As informações podem ser coletadas através de:
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {informationTypes.map((type, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{type.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {type.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Métodos de Coleta</h4>
              <p className="text-blue-800 text-sm">
                As informações podem ser coletadas por meio de formulários online, campanhas, eventos, 
                contatos diretos com nossa equipe, doações online ou participação em programas de voluntariado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Uso das Informações */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">2</span>
              Uso das Informações
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Processar doações e parcerias</h4>
                    <p className="text-muted-foreground text-sm">
                      Gerenciamento seguro de transações financeiras e comunicação com parceiros estratégicos.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Enviar atualizações e relatórios</h4>
                    <p className="text-muted-foreground text-sm">
                      Informações sobre impacto dos projetos, agradecimentos e transparência das ações.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Gerir voluntariado</h4>
                    <p className="text-muted-foreground text-sm">
                      Coordenação de atividades voluntárias e ações humanitárias no terreno.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Melhorar serviços</h4>
                    <p className="text-muted-foreground text-sm">
                      Aprimoramento contínuo da comunicação e eficácia dos programas humanitários.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Cumprir obrigações legais</h4>
                    <p className="text-muted-foreground text-sm">
                      Conformidade com regulamentações e prestação de contas transparente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Compartilhamento de Informações */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">3</span>
              Compartilhamento de Informações
            </h2>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg mb-8">
              <h4 className="font-semibold text-red-900 mb-2">Princípio Fundamental</h4>
              <p className="text-red-800">
                <strong>Não compartilhamos suas informações pessoais com terceiros</strong>, exceto nas 
                situações específicas descritas abaixo, sempre respeitando sua privacidade e os 
                propósitos humanitários da nossa organização.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-orange-900">Exigência Legal</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Quando exigido por lei, tribunais ou autoridades governamentais competentes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-900">Parceiros Confiáveis</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Com parceiros estratégicos sob acordo de confidencialidade, exclusivamente para fins operacionais.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-900">Autorização Expressa</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Com sua autorização expressa e específica para determinada finalidade.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Proteção de Dados */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">4</span>
              Proteção de Dados
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Adotamos medidas técnicas e organizacionais rigorosas para proteger suas informações 
              contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {protectionMeasures.map((measure, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-green-100 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-muted-foreground">{measure}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cookies */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">5</span>
              Cookies e Tecnologias de Rastreamento
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Como usamos cookies</h4>
              <p className="text-blue-800 mb-4">
                Nosso site (www.mozsolidaria.org) pode usar cookies para melhorar a navegação, 
                personalizar conteúdo e coletar estatísticas anônimas de uso.
              </p>
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Shield className="h-4 w-4" />
                <span>Você pode desativar os cookies no seu navegador a qualquer momento.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Direitos do Titular */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">6</span>
              Seus Direitos como Titular de Dados
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Você tem controle total sobre suas informações pessoais. Estes são seus direitos fundamentais:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {dataRights.map((right, index) => (
                <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <right.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">{right.title}</h4>
                        <p className="text-muted-foreground text-sm">{right.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h4 className="font-semibold text-primary mb-2">Como exercer seus direitos</h4>
              <p className="text-muted-foreground mb-4">
                Para exercer qualquer um destes direitos, entre em contato conosco pelo e-mail: 
                <strong className="text-primary"> ajuda@mozsolidaria.org</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Responderemos à sua solicitação dentro de 30 dias úteis e poderemos solicitar 
                verificação de identidade para garantir a segurança dos seus dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Alterações */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">7</span>
              Alterações nesta Política
            </h2>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Atualizações e Notificações</h4>
              <p className="text-yellow-800 mb-3">
                Podemos atualizar esta política periodicamente para refletir mudanças em nossas 
                práticas ou em requisitos legais.
              </p>
              <p className="text-yellow-800 text-sm">
                <strong>Compromisso:</strong> Notificaremos todas as alterações significativas 
                através do nosso site oficial e canais de comunicação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Contato */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">8</span>
              Entre em Contato Conosco
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Se tiver dúvidas, solicitações ou preocupações sobre esta Política de Privacidade 
              ou sobre como tratamos seus dados pessoais, não hesite em nos contactar:
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>Contato Principal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">ajuda@mozsolidaria.org</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">+258 86 204 0330</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-muted-foreground">🌐</div>
                    <span className="text-muted-foreground">www.mozsolidaria.org</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Endereço Físico</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-muted-foreground">
                        Av. Samora Machel<br />
                        Bairro Nanduadua<br />
                        Mocímboa da Praia<br />
                        Cabo Delgado, Moçambique
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h4 className="font-semibold text-primary mb-2">Compromisso com a Transparência</h4>
              <p className="text-muted-foreground">
                Estamos comprometidos em responder rapidamente às suas consultas e manter 
                a transparência em todas as nossas práticas de proteção de dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
