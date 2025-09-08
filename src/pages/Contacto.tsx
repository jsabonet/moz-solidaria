import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Mail, Phone, Clock, Facebook, Instagram, Twitter, Send } from "lucide-react";

const Contacto = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      info: "Av. Samora Machel, Bairro Unidade, Mocímboa da Praia",
      description: "Cabo Delgado, Moçambique"
    },
    {
      icon: Mail,
      title: "Email",
      info: "info@mozsolidaria.org",
      description: "Resposta em até 24 horas"
    },
    {
      icon: Phone,
      title: "Telefone",
      info: "+258 84 204 0330",
      description: "Segunda a Sexta, 8h às 17h"
    },
    {
      icon: Clock,
      title: "Horário de Funcionamento",
      info: "08:00 - 17:00",
      description: "Segunda a Sexta-feira"
    }
  ];

  const departments = [
    // {
    //   name: "Direção Geral",
    //   email: "direcao@mozsolidaria.org",
    //   description: "Questões estratégicas e parcerias"
    // },
    {
      name: "Programas e Projetos",
      email: "programas@mozsolidaria.org",
      description: "Informações sobre nossos programas"
    },
    {
      name: "Recursos Humanos",
      email: "rh@mozsolidaria.org",
      description: "Voluntariado e oportunidades de carreira"
    },
    {
      name: "Logística",
      email: "logistica@mozsolidaria.org",
      description: "Imprensa e comunicação social"
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
              Entre em Contacto
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Estamos sempre disponíveis para conversar sobre como podemos 
              trabalhar juntos pelo desenvolvimento de Cabo Delgado
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Envie-nos uma Mensagem</h2>
                <p className="text-muted-foreground text-lg">
                  Preencha o formulário abaixo e entraremos em contacto consigo em breve.
                </p>
              </div>
              
              <Card>
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input id="nome" placeholder="Seu nome completo" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input id="telefone" placeholder="+258 XXX XXX XXX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assunto">Assunto</Label>
                        <Input id="assunto" placeholder="Assunto da mensagem" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mensagem">Mensagem</Label>
                      <Textarea 
                        id="mensagem" 
                        placeholder="Como podemos ajudar?" 
                        rows={6}
                      />
                    </div>
                    
                    <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      Enviar Mensagem
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Informações de Contacto</h2>
                <p className="text-muted-foreground text-lg">
                  Encontre-nos através dos nossos canais de comunicação oficial.
                </p>
              </div>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-foreground font-medium">{item.info}</p>
                            <p className="text-muted-foreground text-sm">{item.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <a href="https://www.facebook.com/mozsolidaria/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="https://www.instagram.com/mozsolidaria/?hl=pt-pt" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-pink-600 text-white rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="https://x.com/mozsolidaria" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-400 text-white rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="https://tiktok.com/@mozsolidaria" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.415-1.415-1.415-3.338h-3.496v14.25c0 1.245-1.008 2.25-2.25 2.25s-2.25-1.005-2.25-2.25c0-1.245 1.008-2.25 2.25-2.25.414 0 .801.117 1.137.315V9.819a5.73 5.73 0 0 0-1.137-.117c-3.178 0-5.75 2.572-5.75 5.75s2.572 5.75 5.75 5.75 5.75-2.572 5.75-5.75V8.597a8.725 8.725 0 0 0 5.041 1.608v-3.496c-.825 0-1.617-.258-2.25-.641z"/>
                      </svg>
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Siga-nos nas redes sociais para acompanhar nossas atividades e histórias de impacto.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Contactos por Departamento</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Para um atendimento mais especializado, contacte diretamente o departamento adequado
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{dept.description}</p>
                    <a 
                      href={`mailto:${dept.email}`} 
                      className="text-primary hover:underline font-medium"
                    >
                      {dept.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Nossa Localização</h2>
            <p className="text-xl text-muted-foreground">
              Encontre-nos em Cabo Delgado, Moçambique
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">Sede Principal</h3>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Av. Samora Machel, Bairro Unidade</p>
                    <p>Mocímboa da Praia, Cabo Delgado</p>
                    <p>Moçambique</p>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-semibold mb-2">Como Chegar:</h4>
                    <p className="text-sm text-muted-foreground">
                      Nossa sede está localizada em Mocímboa da Praia, na Av. Samora Machel, 
                      facilmente acessível por transporte público e particular. Estamos no 
                      coração de Cabo Delgado, próximo aos principais pontos de referência da cidade.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Áreas de Atuação:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Pemba</li>
                  <li>• Montepuez</li>
                  <li>• Chiure</li>
                  <li>• Ancuabe</li>
                  <li>• Metuge</li>
                  <li>• E outras comunidades rurais</li>
                </ul>
              </div>
            </div>
            
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1949766.8947429783!2d38.5!3d-11.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a32ca4ef0d6c4cf%3A0x1c5a1e3a6e5a1a1a!2sCabo%20Delgado%2C%20Mo%C3%A7ambique!5e0!3m2!1spt!2smz!4v1648000000000!5m2!1spt!2smz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Associação MOZ SOLIDÁRIA em Cabo Delgado, Moçambique"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contacto;