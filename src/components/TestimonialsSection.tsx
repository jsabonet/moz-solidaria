import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  content: string;
  image: string;
  category: string;
}

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Maria João Mussa",
      role: "Beneficiária do Programa de Apoio Alimentar",
      location: "Mocímboa da Praia",
      content: "A Associação Moz Solidária chegou num momento muito difícil para a nossa família. Com as cestas básicas, conseguimos alimentar os nossos filhos e recuperar a esperança. Muito obrigada pela vossa solidariedade.",
      image: "https://images.unsplash.com/photo-1654027678170-2f16d4e87787?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Apoio Alimentar"
    },
    {
      id: 2,
      name: "Carlos Namirre",
      role: "Jovem formado em Marcenaria",
      location: "Nangade",
      content: "Graças à formação que recebi da Associação Moz Solidária, hoje tenho a minha própria oficina de marcenaria. Posso sustentar a minha família e ajudar outros jovens da comunidade.",
      image: "https://images.unsplash.com/photo-1540547750293-6d44b6a9decd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Formação Profissional"
    },
    {
      id: 3,
      name: "Ana Sebastião",
      role: "Professora da Escola Reconstruída",
      location: "Quissanga",
      content: "Ver a escola reconstruída trouxe alegria a toda a comunidade. As crianças voltaram a estudar num ambiente seguro e digno. A educação é o futuro dos nossos filhos.",
      image: "https://images.unsplash.com/photo-1716654718430-c7f54c3125c8?q=80&w=1131&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Educação"
    },
    {
      id: 4,
      name: "José Amade",
      role: "Líder Comunitário",
      location: "Palma",
      content: "A Associação Moz Solidária trabalha com transparência e respeito pela nossa cultura. Eles não apenas ajudam, mas ensinam-nos a sermos autónomos. Isso faz toda a diferença.",
      image: "https://plus.unsplash.com/premium_photo-1691411181780-46644cfb8258?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Liderança Comunitária"
    },
    {
      id: 5,
      name: "Fátima Abdul",
      role: "Mãe de família",
      location: "Mocímboa da Praia",
      content: "O apoio psicológico que recebi ajudou-me a superar momentos muito difíceis. Hoje sinto-me mais forte e capaz de cuidar da minha família. Obrigada por não nos abandonarem.",
      image: "https://images.unsplash.com/photo-1713258827620-a864e8afc076?q=80&w=626&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Apoio Psicológico"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentTestimonial];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Vozes da Comunidade</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conheça as histórias reais de transformação das pessoas que apoiamos
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="card-hover">
            <CardContent className="p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Foto do depoente */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img 
                      src={current.image} 
                      alt={current.name}
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-primary/20"
                    />
                    <div className="absolute -top-2 -right-2 bg-primary rounded-full p-2">
                      <Quote className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Conteúdo do depoimento */}
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <blockquote className="text-lg lg:text-xl text-muted-foreground italic leading-relaxed">
                    "{current.content}"
                  </blockquote>
                  
                  <div className="space-y-1">
                    <h4 className="text-xl font-semibold">{current.name}</h4>
                    <p className="text-primary font-medium">{current.role}</p>
                    <p className="text-sm text-muted-foreground">{current.location}</p>
                  </div>
                </div>
              </div>

              {/* Controles de navegação */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTestimonial}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentTestimonial 
                          ? 'bg-primary w-6' 
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTestimonial}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de mini depoimentos */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {testimonials.filter((_, index) => index !== currentTestimonial).slice(0, 3).map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="card-hover cursor-pointer fade-in-up" 
              style={{animationDelay: `${index * 0.1}s`}}
              onClick={() => setCurrentTestimonial(testimonials.indexOf(testimonial))}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="font-semibold text-sm">{testimonial.name}</h5>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
