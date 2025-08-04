import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Handshake, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const QuickAccessSection = () => {
  const { isAuthenticated } = useAuth();

  const accessCards = [
    {
      icon: Heart,
      title: "Doar",
      description: "Faça uma doação e ajude a transformar vidas",
      color: "bg-red-50 border-red-200 hover:bg-red-100",
      iconColor: "text-red-600",
      href: "/doacao",
      ctaText: "Doar Agora"
    },
    {
      icon: Users,
      title: "Voluntário",
      description: "Participe como voluntário em nossos programas",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
      href: isAuthenticated ? "/client-area" : "/login",
      ctaText: isAuthenticated ? "Portal de Comunidade" : "Registar-se"
    },
    {
      icon: Handshake,
      title: "Beneficiário",
      description: "Receba apoio através dos nossos programas",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600",
      href: isAuthenticated ? "/client-area" : "/login",
      ctaText: isAuthenticated ? "Portal de Comunidade" : "Registar-se"
    },
    {
      icon: Building,
      title: "Parceiro",
      description: "Torne-se um parceiro estratégico da nossa causa",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
      href: isAuthenticated ? "/client-area" : "/login",
      ctaText: isAuthenticated ? "Portal de Comunidade" : "Registar-se"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Como Pode Participar?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Existem várias formas de se envolver com a Moz Solidária e fazer a diferença na vida de quem mais precisa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                className={`${card.color} transition-all duration-300 hover:shadow-lg border-2`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-white shadow-md w-fit">
                    <Icon className={`h-8 w-8 ${card.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <Link to={card.href}>
                    <Button 
                      className="w-full bg-gradient-to-r from-mozambique-red to-solidarity-orange hover:from-solidarity-orange hover:to-mozambique-red transition-all duration-300"
                    >
                      {card.ctaText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action para usuários não autenticados */}
        {!isAuthenticated && (
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-mozambique-red to-solidarity-orange text-white border-0">
              <CardContent className="py-8 px-6">
                <h3 className="text-2xl font-bold mb-4">
                  Junte-se à Nossa Comunidade
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Crie a sua conta gratuita e tenha acesso ao Portal de Comunidade para gerir as suas atividades, 
                  acompanhar o impacto das suas ações e conectar-se com a nossa comunidade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button 
                      variant="secondary" 
                      size="lg"
                      className="w-full sm:w-auto bg-white text-mozambique-red hover:bg-gray-100"
                    >
                      Fazer Login
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-mozambique-red"
                    >
                      Registar-se
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuickAccessSection;
