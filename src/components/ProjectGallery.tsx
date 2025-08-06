import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, MapPin, Users, Calendar } from "lucide-react";
import { Link } from 'react-router-dom';
import { fetchPublicProjects } from '@/lib/api';

interface Project {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description?: string;
  featured_image: string;
  program?: {
    id: number;
    name: string;
    color?: string;
  };
  category?: {
    id: number;
    name: string;
    color?: string;
  };
  location: string;
  district?: string;
  province?: string;
  target_beneficiaries: number;
  current_beneficiaries?: number;
  progress_percentage?: number;
  status: 'planning' | 'active' | 'completed' | 'suspended';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date?: string;
  is_featured: boolean;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

const ProjectGallery = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Carregar projetos da API
      const apiProjects = await fetchPublicProjects();
      setProjects(apiProjects);
      
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      
      // Fallback para dados mock em caso de erro
      const mockProjects: Project[] = [
        {
          id: 1,
          name: "Reconstrução da Escola Primária de Nangade",
          slug: "reconstrucao-escola-nangade",
          short_description: "Reconstrução completa da escola primária beneficiando 300+ crianças com novas salas, biblioteca e laboratório.",
          featured_image: "https://images.unsplash.com/photo-1661345665867-63e6b12b774a?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          program: { id: 1, name: "Educação", color: "blue" },
          location: "Nangade, Cabo Delgado",
          target_beneficiaries: 300,
          current_beneficiaries: 200,
          progress_percentage: 75,
          status: "active",
          start_date: "2025-01-15",
          is_featured: true,
          is_public: true
        },
        {
          id: 2,
          name: "Distribuição de Cestas Básicas",
          slug: "distribuicao-cestas-basicas",
          short_description: "Apoio alimentar mensal para 150 famílias deslocadas em situação de vulnerabilidade social.",
          featured_image: "https://images.unsplash.com/photo-1694286080449-8b142ef76d6d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          program: { id: 2, name: "Apoio Humanitário", color: "red" },
          location: "Mocímboa da Praia",
          target_beneficiaries: 150,
          current_beneficiaries: 60,
          progress_percentage: 40,
          status: "active",
          start_date: "2025-02-01",
          is_featured: false,
          is_public: true
        },
        {
          id: 3,
          name: "Formação Profissional em Marcenaria",
          slug: "formacao-marcenaria",
          short_description: "Curso de capacitação profissional em marcenaria para 25 jovens da comunidade local.",
          featured_image: "https://images.unsplash.com/photo-1617720356637-6264c1c0b4bb?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          program: { id: 3, name: "Formação Juvenil", color: "green" },
          location: "Cabo Delgado",
          target_beneficiaries: 25,
          current_beneficiaries: 25,
          progress_percentage: 100,
          status: "completed",
          start_date: "2025-03-01",
          is_featured: false,
          is_public: true
        },
        {
          id: 4,
          name: "Campanha de Vacinação",
          slug: "campanha-vacinacao",
          short_description: "Campanha de vacinação contra doenças tropicais em comunidades rurais remotas.",
          featured_image: "https://images.unsplash.com/photo-1666887360870-fab16552365f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          program: { id: 4, name: "Saúde Pública", color: "purple" },
          location: "Comunidades Rurais",
          target_beneficiaries: 1000,
          current_beneficiaries: 800,
          progress_percentage: 85,
          status: "active",
          start_date: "2025-04-01",
          is_featured: true,
          is_public: true
        },
        {
          id: 5,
          name: "Construção de Poço de Água",
          slug: "construcao-poco-agua",
          short_description: "Perfuração e construção de poço artesiano para garantir acesso à água potável.",
          featured_image: "https://images.unsplash.com/photo-1710093072216-1fdf6eef8cb3?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          program: { id: 5, name: "Infraestrutura", color: "orange" },
          location: "Quissanga",
          target_beneficiaries: 500,
          current_beneficiaries: 150,
          progress_percentage: 90,
          status: "active",
          start_date: "2025-03-01",
          is_featured: false,
          is_public: true
        },
        {
          id: 6,
          name: "Apoio Psicológico a Mulheres",
          slug: "apoio-psicologico-mulheres",
          short_description: "Sessões de apoio psicológico e empoderamento para mulheres vítimas de violência.",
          featured_image: "https://images.unsplash.com/photo-1568286642685-9888a5d02108?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          program: { id: 6, name: "Apoio Psicossocial", color: "pink" },
          location: "Mocímboa da Praia",
          target_beneficiaries: 100,
          current_beneficiaries: 80,
          progress_percentage: 60,
          status: "active",
          start_date: "2025-02-01",
          is_featured: false,
          is_public: true
        }
      ];

      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(projects.map(p => p.program?.name || p.category?.name).filter(Boolean))];
  
  const filteredProjects = selectedCategory === "Todos" 
    ? projects.filter(p => p.status !== 'planning' && p.is_public) // Só projetos ativos/concluídos e públicos
    : projects.filter(p => 
        (p.program?.name === selectedCategory || p.category?.name === selectedCategory) && 
        p.status !== 'planning' && 
        p.is_public
      );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'suspended':
        return 'Suspenso';
      default:
        return status;
    }
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-8"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-300 rounded-lg h-80"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">Galeria de Projetos</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conheça nossos projetos realizados e o impacto direto nas comunidades de Cabo Delgado
          </p>
        </div>

        {/* Filtros por categoria */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Button
            variant={selectedCategory === "Todos" ? "default" : "outline"}
            onClick={() => setSelectedCategory("Todos")}
            size="sm"
          >
            Todos ({filteredProjects.length})
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category} ({projects.filter(p => 
                (p.program?.name === category || p.category?.name === category) && 
                p.status !== 'planning' && 
                p.is_public
              ).length})
            </Button>
          ))}
        </div>

        {/* Grid de projetos */}
        {filteredProjects.length > 0 ? (
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
                    src={project.featured_image} 
                    alt={project.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {(project.program || project.category) && (
                      <Badge variant="secondary" className="bg-white/90 text-primary">
                        {project.program?.name || project.category?.name}
                      </Badge>
                    )}
                    {project.is_featured && (
                      <Badge variant="default" className="bg-primary/90">
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  {/* Barra de progresso */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3">
                    <div className="flex justify-between items-center text-white text-xs mb-1">
                      <span>Progresso</span>
                      <span>{project.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div 
                        className="bg-white rounded-full h-1 transition-all duration-500"
                        style={{ width: `${project.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {project.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {project.short_description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{project.current_beneficiaries || project.target_beneficiaries || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(project.start_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <Link 
                      to={`/projeto/${project.slug}`}
                      className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver Detalhes
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-muted-foreground">
              {selectedCategory === "Todos" 
                ? "Não há projetos públicos disponíveis no momento."
                : `Não há projetos na categoria "${selectedCategory}" no momento.`
              }
            </p>
          </div>
        )}

        {/* Modal do projeto */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img 
                  src={selectedProject.featured_image} 
                  alt={selectedProject.name}
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
                <div className="absolute top-3 left-3 flex gap-2">
                  {(selectedProject.program || selectedProject.category) && (
                    <Badge className="bg-primary">
                      {selectedProject.program?.name || selectedProject.category?.name}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {getStatusLabel(selectedProject.status)}
                  </Badge>
                </div>
                {/* Barra de progresso no modal */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-3 rounded">
                  <div className="flex justify-between items-center text-white text-sm mb-2">
                    <span>Progresso do Projeto</span>
                    <span className="font-bold">{selectedProject.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${selectedProject.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedProject.name}</h3>
                  <p className="text-muted-foreground">{selectedProject.short_description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Local:</span>
                      <p>{selectedProject.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Beneficiários:</span>
                      <p>{selectedProject.current_beneficiaries || selectedProject.target_beneficiaries || 0} pessoas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Início:</span>
                      <p>{new Date(selectedProject.start_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button variant="outline" onClick={closeProjectModal}>
                    Fechar
                  </Button>
                  <Button asChild>
                    <Link to={`/projeto/${selectedProject.slug}`}>
                      Ver Detalhes Completos
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
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
