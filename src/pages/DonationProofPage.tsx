import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonationProofSubmission from '@/components/DonationProofSubmission';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Shield, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DonationProofPage = () => {
  const handleSubmissionSuccess = () => {
    // Scroll to top after successful submission
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-solidarity-blue to-mozambique-red text-white">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <Heart className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Envio de Comprovante de Doação
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Faça upload do comprovante da sua doação para que possamos 
              processar e confirmar sua valiosa contribuição.
            </p>
            <Link to="/doacao">
              <Button variant="secondary" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar às Informações de Doação
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        
        {/* Processo de Envio */}
        <div className="mb-12">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Como Funciona o Processo</CardTitle>
              <CardDescription>
                Processo simples e seguro em 4 passos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Preencha os Dados</h3>
                  <p className="text-sm text-gray-600">
                    Informe o valor e método de doação utilizado
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Faça Upload</h3>
                  <p className="text-sm text-gray-600">
                    Envie o comprovante (JPG, PNG ou PDF)
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Análise</h3>
                  <p className="text-sm text-gray-600">
                    Nossa equipe verifica em até 48h
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Confirmação</h3>
                  <p className="text-sm text-gray-600">
                    Receba confirmação por email
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Envio */}
        <DonationProofSubmission onSuccess={handleSubmissionSuccess} />

        {/* Informações Adicionais */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Segurança Garantida</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Conexão HTTPS criptografada</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Armazenamento seguro de documentos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Dados protegidos conforme LGPD</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Acesso restrito apenas à equipe autorizada</span>
              </div>
            </CardContent>
          </Card>

          {/* Suporte */}
          <Card>
            <CardHeader>
              <CardTitle>Precisa de Ajuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Se tiver dúvidas sobre o processo de doação ou envio de comprovantes,
                nossa equipe está pronta para ajudar:
              </p>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span> ajuda@mozsolidaria.org
                </div>
                <div>
                  <span className="font-medium">Telefone:</span> +258 84 204 0330
                </div>
                <div>
                  <span className="font-medium">WhatsApp:</span> +258 86 204 0330
                </div>
              </div>
              <p className="text-gray-600">
                Horário de atendimento: Segunda a Sexta, 8h às 17h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Rápida */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Quanto tempo demora para confirmar minha doação?</h4>
                <p className="text-sm text-gray-600">
                  Normalmente processamos comprovantes em até 48 horas úteis. 
                  Você receberá um email de confirmação.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Que tipos de arquivo posso enviar?</h4>
                <p className="text-sm text-gray-600">
                  Aceitamos imagens (JPG, PNG) e documentos PDF com até 5MB de tamanho.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Preciso criar uma conta para doar?</h4>
                <p className="text-sm text-gray-600">
                  Não é obrigatório. Você pode enviar como convidado, mas recomendamos 
                  criar uma conta para acompanhar o impacto das suas doações.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Meus dados são seguros?</h4>
                <p className="text-sm text-gray-600">
                  Sim! Utilizamos as melhores práticas de segurança e seus dados 
                  são protegidos conforme a legislação de proteção de dados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DonationProofPage;
