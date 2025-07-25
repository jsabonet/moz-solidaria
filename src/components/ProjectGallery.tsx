import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  date: string;
  beneficiaries: string;
  location: string;
}

const ProjectGallery = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Dados dos projetos (em um ambiente real, viriam de uma API)
  const projects: Project[] = [
    {
      id: 1,
      title: "Distribuição de Cestas Básicas",
      description: "Apoio alimentar a 150 famílias deslocadas em Mocímboa da Praia durante o período de crise.",
      image: "https://images.unsplash.com/photo-1694286080449-8b142ef76d6d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Apoio Humanitário",
      date: "Julho 2025",
      beneficiaries: "150 famílias",
      location: "Mocímboa da Praia"
    },
    {
      id: 2,
      title: "Reconstrução da Escola Primária",
      description: "Reconstrução completa da escola primária de Nangade, beneficiando centenas de crianças.",
      image: "https://images.unsplash.com/photo-1661345665867-63e6b12b774a?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Educação",
      date: "Junho 2025",
      beneficiaries: "300+ crianças",
      location: "Nangade"
    },
    {
      id: 3,
      title: "Formação Profissional para Jovens",
      description: "Programa de capacitação em marcenaria e costura para 50 jovens da comunidade.",
      image: "https://images.unsplash.com/photo-1617720356637-6264c1c0b4bb?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Formação Juvenil",
      date: "Maio 2025",
      beneficiaries: "50 jovens",
      location: "Cabo Delgado"
    },
    {
      id: 4,
      title: "Campanha de Vacinação",
      description: "Campanha de vacinação contra doenças tropicais em comunidades rurais.",
      image: "https://images.unsplash.com/photo-1666887360870-fab16552365f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D   ",
      category: "Saúde Pública",
      date: "Abril 2025",
      beneficiaries: "800+ pessoas",
      location: "Comunidades Rurais"
    },
    {
      id: 5,
      title: "Construção de Poço de Água",
      description: "Perfuração e construção de poço artesiano para garantir acesso à água potável.",
      image: "https://images.unsplash.com/photo-1710093072216-1fdf6eef8cb3?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Infraestrutura",
      date: "Março 2025",
      beneficiaries: "200+ famílias",
      location: "Quissanga"
    },
    {
      id: 6,
      title: "Apoio Psicológico a Mulheres",
      description: "Sessões de apoio psicológico e empoderamento para mulheres vítimas de violência.",
      image: "https://images.unsplash.com/photo-1568286642685-9888a5d02108?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      category: "Apoio Psicossocial",
      date: "Fevereiro 2025",
      beneficiaries: "80 mulheres",
      location: "Mocímboa da Praia"
    }
  ];

  const categories = [...new Set(projects.map(p => p.category))];
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const filteredProjects = selectedCategory === "Todos" 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Galeria de Projetos</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Veja alguns dos nossos projetos realizados e o impacto direto nas comunidades
          </p>
        </div>

        {/* Filtros por categoria */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Button
            variant={selectedCategory === "Todos" ? "default" : "outline"}
            onClick={() => setSelectedCategory("Todos")}
            size="sm"
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Grid de projetos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <Card 
              key={project.id} 
              className="group card-hover cursor-pointer fade-in-up overflow-hidden"
              style={{animationDelay: `${index * 0.1}s`}}
              onClick={() => openProjectModal(project)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 text-primary">
                    {project.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {project.description}
                </p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{project.date}</span>
                  <span>{project.beneficiaries}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal do projeto */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                  onClick={closeProjectModal}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Badge className="absolute top-3 left-3 bg-primary">
                  {selectedProject.category}
                </Badge>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold">{selectedProject.title}</h3>
                <p className="text-muted-foreground">{selectedProject.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Data:</span> {selectedProject.date}
                  </div>
                  <div>
                    <span className="font-semibold">Beneficiários:</span> {selectedProject.beneficiaries}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Local:</span> {selectedProject.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectGallery;
