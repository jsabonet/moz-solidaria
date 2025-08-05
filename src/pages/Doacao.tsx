import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Copy, Phone, Mail, MapPin, Building2, CreditCard, Banknote, Heart, CheckCircle, FileText, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Doacao = () => {
  const [copiedText, setCopiedText] = useState<string>("");

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    toast.success(`${type} copiado para área de transferência!`);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const bancosSuportados = [
    { nome: "BCI - Banco Comercial e de Investimentos", logo: "🏦" },
    { nome: "Standard Bank", logo: "🏦" },
    { nome: "BIM - Banco Internacional de Moçambique", logo: "🏦" },
    { nome: "Millennium BIM", logo: "🏦" },
    { nome: "FNB - First National Bank", logo: "🏦" },
    { nome: "Banco Terra", logo: "🏦" }
  ];

  const metodosDoacao = [
    {
      metodo: "Transferência Bancária",
      icon: <Building2 className="h-6 w-6" />,
      detalhes: [
        { label: "Banco", valor: "BCI - Banco Comercial e de Investimentos" },
        { label: "Nome da Conta", valor: "MOZ SOLIDÁRIA - Organização Humanitária" },
        { label: "Número da Conta", valor: "0003.4567.8901.2345.6" },
        { label: "IBAN", valor: "MZ59 0003 4567 8901 2345 6789" },
        { label: "SWIFT/BIC", valor: "BCIMZMZM" }
      ]
    },
    {
      metodo: "M-Pesa",
      icon: <CreditCard className="h-6 w-6" />,
      detalhes: [
        { label: "Operadora", valor: "Vodacom M-Pesa" },
        { label: "Número", valor: "+258 84 204 0330" },
        { label: "Nome", valor: "MOZ SOLIDÁRIA" },
        { label: "Referência", valor: "DOACAO-HUMANITARIA" }
      ]
    },
    {
      metodo: "E-Mola",
      icon: <CreditCard className="h-6 w-6" />,
      detalhes: [
        { label: "Operadora", valor: "Movitel E-Mola" },
        { label: "Número", valor: "+258 86 204 0330" },
        { label: "Nome", valor: "MOZ SOLIDÁRIA" },
        { label: "Referência", valor: "DOACAO-HUMANITARIA" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-mozambique-red to-solidarity-orange text-white">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Heart className="h-16 w-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Faça a Diferença em Cabo Delgado
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Sua doação ajuda famílias afetadas por conflitos e desastres naturais. 
              Cada contribuição transforma vidas e constrói esperança.
            </p>
            <Badge variant="secondary" className="text-lg px-6 py-2">
              💝 Toda doação faz a diferença
            </Badge>
            <div className="mt-8">
              <Link to="/enviar-comprovante">
                <Button size="lg" className="bg-white text-mozambique-red hover:bg-gray-100 font-bold px-8 py-4 text-lg">
                  📄 Envie Seu Comprovante de Doação
                </Button>
              </Link>
              <p className="text-sm opacity-90 mt-2">
                Já fez sua doação? Envie o comprovante para confirmação
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Métodos de Doação */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Como Doar
              </h2>
              <p className="text-gray-600 mb-8">
                Escolha o método de doação mais conveniente para você. 
                Todas as opções são seguras e 100% dos recursos vão para os beneficiários.
              </p>
            </div>

            {metodosDoacao.map((metodo, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-solidarity-blue/10 rounded-lg text-solidarity-blue">
                      {metodo.icon}
                    </div>
                    <span>{metodo.metodo}</span>
                  </CardTitle>
                  <CardDescription>
                    Dados para transferência via {metodo.metodo}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metodo.detalhes.map((detalhe, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-700">{detalhe.label}:</span>
                          <div className="text-gray-900 font-mono text-sm mt-1">{detalhe.valor}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(detalhe.valor, detalhe.label)}
                          className="ml-2"
                        >
                          {copiedText === detalhe.label ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action Principal */}
          <Card className="bg-gradient-to-r from-mozambique-red/10 to-solidarity-blue/10 border-2 border-mozambique-red/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-mozambique-red flex items-center justify-center space-x-2">
                <FileText className="h-6 w-6" />
                <span>Próximo Passo: Envie Seu Comprovante</span>
              </CardTitle>
              <CardDescription className="text-lg">
                Já fez sua transferência? Envie o comprovante para confirmarmos sua doação
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">📋 Processo Simples em 3 Passos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                    <span>Faça a transferência</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                    <span>Envie o comprovante</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                    <span>Receba confirmação</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link to="/enviar-comprovante">
                  <Button size="lg" className="w-full md:w-auto bg-mozambique-red hover:bg-mozambique-red/90 text-white font-bold px-8 py-4">
                    <Upload className="h-5 w-5 mr-2" />
                    Enviar Comprovante Agora
                  </Button>
                </Link>
                
                <div className="text-sm text-gray-600">
                  <p>✅ Aceita usuários logados e convidados</p>
                  <p>✅ Processo seguro e criptografado</p>
                  <p>✅ Confirmação em até 48 horas</p>
                </div>
              </div>

              {/* Incentivo ao Registro */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
                  <Heart className="h-4 w-4" />
                  <span className="font-medium">Maximize o Impacto da Sua Doação</span>
                </div>
                <p className="text-blue-700 text-sm mb-3">
                  Crie uma conta gratuita no portal da comunidade para acompanhar o impacto real 
                  da sua doação, ver relatórios de transparência e receber atualizações sobre os projetos.
                </p>
                <Link to="/login?mode=register">
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Criar Conta Gratuita
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid com Informações de Impacto e Transparência */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          
          {/* Impacto e Informações */}
          <div className="space-y-8">
            
            {/* Impacto das Doações */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">
                  💝 Impacto das Suas Doações
                </CardTitle>
                <CardDescription>
                  Veja como sua contribuição transforma vidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <span className="text-2xl">🍚</span>
                    <div>
                      <div className="font-semibold">500 MT = Cesta Básica</div>
                      <div className="text-sm text-gray-600">Alimenta uma família por 1 semana</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <div className="font-semibold">2.000 MT = Kit Abrigo</div>
                      <div className="text-sm text-gray-600">Materiais para abrigo temporário</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <span className="text-2xl">💊</span>
                    <div>
                      <div className="font-semibold">1.000 MT = Kit Médico</div>
                      <div className="text-sm text-gray-600">Medicamentos essenciais</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <span className="text-2xl">📚</span>
                    <div>
                      <div className="font-semibold">750 MT = Kit Educação</div>
                      <div className="text-sm text-gray-600">Material escolar para criança</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transparência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Transparência Total</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>95% dos recursos vão direto para beneficiários</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Relatórios financeiros publicados mensalmente</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Prestação de contas pública e auditada</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Cada doação gera recibo e comprovante</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bancos Suportados */}
            <Card>
              <CardHeader>
                <CardTitle>Bancos Suportados</CardTitle>
                <CardDescription>
                  Transferências aceitas destes bancos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {bancosSuportados.map((banco, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 border rounded-lg">
                      <span className="text-xl">{banco.logo}</span>
                      <span className="text-sm font-medium">{banco.nome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Contacto Direto */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-solidarity-blue/5 to-mozambique-red/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Precisa de Ajuda ou Tem Dúvidas?
              </CardTitle>
              <CardDescription>
                Nossa equipe está pronta para ajudar com sua doação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Phone className="h-8 w-8 text-solidarity-blue" />
                  <div className="font-semibold">Telefone</div>
                  <div className="text-sm text-gray-600">+258 84 204 0330</div>
                  <div className="text-sm text-gray-600">+258 86 204 0330</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Mail className="h-8 w-8 text-solidarity-blue" />
                  <div className="font-semibold">Email</div>
                  <div className="text-sm text-gray-600">ajuda@mozsolidaria.org</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <MapPin className="h-8 w-8 text-solidarity-blue" />
                  <div className="font-semibold">Endereço</div>
                  <div className="text-sm text-gray-600">Av. Samora Machel, Bairro Unidade</div>
                  <div className="text-sm text-gray-600">Mocímboa da Praia, Cabo Delgado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Doacao;
