import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { FileText, Shield, AlertTriangle, CheckCircle, Users, Heart, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const TermosUso = () => {
  const usageRules = [
    {
      icon: Heart,
      title: "Uso Responsável",
      description: "Utilize nosso site e serviços de forma ética e responsável, sempre respeitando nossa missão humanitária."
    },
    {
      icon: Users,
      title: "Respeito aos Outros",
      description: "Mantenha um comportamento respeitoso em todas as interações, comentários e comunicações."
    },
    {
      icon: Shield,
      title: "Informações Verdadeiras",
      description: "Forneça apenas informações verdadeiras e atualizadas em formulários e cadastros."
    },
    {
      icon: Scale,
      title: "Conformidade Legal",
      description: "Cumpra todas as leis aplicáveis ao usar nossos serviços e participar de nossas atividades."
    }
  ];

  const prohibitions = [
    "Usar o site para fins ilegais ou não autorizados",
    "Transmitir vírus, malware ou código malicioso",
    "Violar direitos de propriedade intelectual",
    "Assediar, ameaçar ou intimidar outros usuários",
    "Publicar conteúdo ofensivo, discriminatório ou inadequado",
    "Tentar acessar áreas restritas do sistema",
    "Fazer uso comercial não autorizado do conteúdo",
    "Interferir no funcionamento normal do site"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Termos de Uso - MOZ SOLIDÁRIA"
        description="Termos e condições de uso do site e serviços da Associação Moz Solidária."
        keywords="termos de uso, condições, regulamento, moz solidária, site"
        type="article"
      />
      
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-solidarity-blue to-mozambique-red text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <FileText className="h-12 w-12" />
              <h1 className="text-4xl lg:text-5xl font-bold">
                Termos de Uso
              </h1>
            </div>
            <p className="text-xl opacity-90 leading-relaxed">
              Condições e diretrizes para o uso responsável dos nossos serviços, 
              site e participação em atividades da Associação Moz Solidária.
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
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Aceitação dos Termos</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Ao acessar e usar o site da <strong>Associação Moz Solidária</strong> (www.mozsolidaria.org), 
                      participar de nossos programas ou utilizar nossos serviços, você concorda em cumprir e 
                      estar vinculado a estes Termos de Uso.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Regras de Uso */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">1</span>
              Regras de Uso Aceitável
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {usageRules.map((rule, index) => (
                <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <rule.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">{rule.title}</h4>
                        <p className="text-muted-foreground text-sm">{rule.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Condutas Proibidas */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">2</span>
              Condutas Proibidas
            </h2>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg mb-8">
              <h4 className="font-semibold text-red-900 mb-2">
                <AlertTriangle className="inline h-5 w-5 mr-2" />
                Atividades Não Permitidas
              </h4>
              <p className="text-red-800 text-sm">
                As seguintes atividades são estritamente proibidas ao usar nossos serviços:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {prohibitions.map((prohibition, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-red-100 mt-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-muted-foreground text-sm">{prohibition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Doações e Contribuições */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">3</span>
              Doações e Contribuições
            </h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Política de Doações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-muted-foreground">
                      Todas as doações são voluntárias e destinam-se exclusivamente aos programas humanitários da organização.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-muted-foreground">
                      Fornecemos recibos e relatórios de transparência sobre o uso das contribuições.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-muted-foreground">
                      Doações não são reembolsáveis, exceto em casos de erro técnico comprovado.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Voluntariado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    A participação como voluntário está sujeita a processos de seleção, 
                    formação e cumprimento de código de conduta específico para atividades no terreno.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Propriedade Intelectual */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">4</span>
              Propriedade Intelectual
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Nossos Direitos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Todo o conteúdo do site, incluindo textos, imagens, logos, designs e materiais, 
                    são propriedade da Associação Moz Solidária ou usados com permissão.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    É proibida a reprodução sem autorização prévia por escrito.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seus Direitos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    Você mantém os direitos sobre qualquer conteúdo que enviar, mas nos concede 
                    licença para usar em nossas atividades humanitárias.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Ao enviar testemunhos ou imagens, confirma ter direito de uso e cessão.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Limitação de Responsabilidade */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">5</span>
              Limitação de Responsabilidade
            </h2>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <h4 className="font-semibold text-yellow-900 mb-3">Disclaimer Importante</h4>
              <div className="space-y-3 text-yellow-800 text-sm">
                <p>
                  A Associação Moz Solidária se esforça para manter informações precisas e atualizadas, 
                  mas não garante a completude ou exatidão de todo o conteúdo.
                </p>
                <p>
                  Nossa responsabilidade é limitada ao valor das doações recebidas, 
                  e não somos responsáveis por danos indiretos ou consequenciais.
                </p>
                <p>
                  O site pode conter links para sites terceiros pelos quais não temos controle ou responsabilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modificações */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">6</span>
              Modificações dos Termos
            </h2>
            
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Atualizações Regulares</h4>
                    <p className="text-blue-800 mb-4">
                      Reservamos o direito de modificar estes termos a qualquer momento. 
                      As alterações entrarão em vigor imediatamente após a publicação no site.
                    </p>
                    <p className="text-blue-800 text-sm">
                      <strong>Recomendação:</strong> Revise periodicamente estes termos para estar 
                      ciente de quaisquer mudanças.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Lei Aplicável e Contato */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">7</span>
                  Lei Aplicável
                </h2>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">
                      Estes termos são regidos pelas leis de <strong>Moçambique</strong> 
                      e qualquer disputa será resolvida nos tribunais competentes de Cabo Delgado.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Em caso de conflito entre versões em diferentes idiomas, 
                      a versão em português prevalecerá.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">8</span>
                  Contato
                </h2>
                <Card>
                  <CardContent className="p-6 space-y-3">
                    <p className="text-muted-foreground text-sm mb-4">
                      Para questões sobre estes termos, entre em contato:
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> ajuda@mozsolidaria.org</p>
                      <p><strong>Telefone:</strong> +258 86 204 0330</p>
                      <p><strong>Site:</strong> www.mozsolidaria.org</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Links Relacionados */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-8">Documentos Relacionados</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/politica-privacidade">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Política de Privacidade</h4>
                    <p className="text-muted-foreground text-sm">
                      Como protegemos seus dados pessoais
                    </p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/sobre">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Sobre a Organização</h4>
                    <p className="text-muted-foreground text-sm">
                      Nossa missão e valores
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermosUso;
