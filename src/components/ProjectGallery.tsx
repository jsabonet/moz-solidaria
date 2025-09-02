import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, MapPin, Users, Calendar } from "lucide-react";
import { Link } from 'react-router-dom';
import { fetchPublicProjects, fetchProjectMetrics, fetchCompleteProjectData, fetchTrackingMetricsBySlug } from '@/lib/api';

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
  // Métricas opcionais (quando enriquecidas via API)
  metrics?: {
    progressPercentage?: number;
    progress_percentage?: number | string;
    completedMilestones?: number;
    totalMilestones?: number;
  };
  // Suporte a cálculo baseado em marcos (caso a API inclua)
  milestones?: Array<{
    id?: number;
    title?: string;
    is_completed?: boolean;
    status?: string;
    progress_percentage?: number | string;
  }>;
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
      
      // Enriquecer com métricas avançadas / tracking (para habilitar barra de progresso dinâmica real)
      try {
        // Passo 1: tentar métricas rápidas por ID
        const enrichedPre = await Promise.all(apiProjects.map(async (p: Project) => {
          try {
            // Try tracking (slug-based) first
            const metricsTracking = await fetchTrackingMetricsBySlug(p.slug);
            if (metricsTracking && (metricsTracking.progressPercentage || metricsTracking.completedMilestones || metricsTracking.budgetTotal)) {
              return { ...p, metrics: metricsTracking } as Project;
            }
          } catch {}
          try {
            // Fallback to legacy ID-based endpoints
            const metrics = await fetchProjectMetrics(p.id);
            return { ...p, metrics } as Project;
          } catch {
            return p;
          }
        }));

        // Passo 2: identificar quais projetos ainda estão com progresso 0 para tentar tracking completo por slug
        const needsTracking = enrichedPre.filter(p => {
          const m = (p.metrics as any) || {};
            const progress = m.progressPercentage ?? m.progress_percentage ?? p.progress_percentage ?? 0;
            return !progress || Number(progress) === 0;
        });

        // Concurrency control (limitar requisições simultâneas) para tracking detalhado
        const limit = 4; // pode ajustar conforme performance
        const resultsTracking: Record<string, any> = {}; // slug -> data
        for (let i = 0; i < needsTracking.length; i += limit) {
          const slice = needsTracking.slice(i, i + limit);
          const batch = await Promise.allSettled(slice.map(p => fetchCompleteProjectData(p.slug)));
          batch.forEach((res, idx) => {
            const slug = slice[idx].slug;
            if (res.status === 'fulfilled' && res.value) {
              resultsTracking[slug] = res.value;
            }
          });
        }

        const finalEnriched = enrichedPre.map(p => {
          const full = resultsTracking[p.slug];
          if (!full) return p; // manter como está
          const fullMetrics = (full.metrics || {}) as any;
          const progress = fullMetrics.progressPercentage ?? fullMetrics.progress_percentage ?? full.progress_percentage;
          return {
            ...p,
            progress_percentage: progress ?? p.progress_percentage,
            metrics: {
              ...p.metrics,
              ...full.metrics,
              progressPercentage: progress ?? (p.metrics as any)?.progressPercentage ?? (p.metrics as any)?.progress_percentage
            },
            milestones: full.milestones || p.milestones
          } as Project;
        });

        // Debug (remover em produção se quiser)
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.log('[ProjectGallery] Progresso calculado pós-enriquecimento:', finalEnriched.map(p => ({
            id: p.id,
            slug: p.slug,
            progress: (p.metrics as any)?.progressPercentage ?? (p.metrics as any)?.progress_percentage ?? p.progress_percentage ?? 0
          })));
        }

        setProjects(finalEnriched);
      } catch (e) {
        console.warn('Falha ao enriquecer projetos com métricas/tracking:', e);
      }
      
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      
    } finally {
      setLoading(false);
    }
  };

  // Utilitários de normalização
  const clamp = (n: number, min = 0, max = 100) => Math.min(Math.max(n, min), max);
  const normalizeNumber = (raw: unknown): number => {
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      const cleaned = raw.replace(/%/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Progresso: seguir mesma lógica de ProjectDetail.tsx
  const getProjectProgress = (p: Project): number => {
    // 1) Métricas do tracker: progressPercentage (camel/snake)
    const metricsProgress = normalizeNumber((p.metrics as any)?.progressPercentage ?? (p.metrics as any)?.progress_percentage);
    if (metricsProgress > 0) return clamp(metricsProgress);

    // 2) Campo básico do projeto: progress_percentage (string ou número)
    const projectProgress = normalizeNumber((p as any).progress_percentage);
    if (projectProgress > 0) return clamp(projectProgress);

    // 3) Cálculo por métricas de marcos (completed/total)
    const cm = (p.metrics as any)?.completedMilestones;
    const tm = (p.metrics as any)?.totalMilestones;
    if (typeof cm !== 'undefined' && typeof tm !== 'undefined' && tm > 0) {
      return clamp((Number(cm) / Number(tm)) * 100);
    }

    // 4) Cálculo baseado na lista de milestones (se disponível)
    if (Array.isArray(p.milestones) && p.milestones.length > 0) {
      const completed = p.milestones.filter((m: any) => m?.is_completed === true || m?.status === 'completed').length;
      if (completed > 0) return clamp((completed / p.milestones.length) * 100);
    }

    return 0;
  };

  const categories = [...new Set(projects.map(p => p.program?.name || p.category?.name).filter(Boolean))];
  
  const isVisibleStatus = (status: Project['status']) => status === 'active' || status === 'completed';

  const filteredProjects = selectedCategory === "Todos" 
    ? projects.filter(p => isVisibleStatus(p.status) && p.is_public)
    : projects.filter(p => 
        (p.program?.name === selectedCategory || p.category?.name === selectedCategory) && 
        isVisibleStatus(p.status) && 
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
                  
                  {/* ({projects.filter(p => 
                    (p.program?.name === category || p.category?.name === category) && 
                    isVisibleStatus(p.status) && 
                    p.is_public
                  ).length}) */}
                  
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
                    src={project.featured_image || '/placeholder.svg'} 
                    alt={project.name}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {(project.program || project.category) && (
                      <Badge variant="secondary" className="bg-white/90 text-primary">
                        {project.program?.name || project.category?.name}
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
                      <span>{getProjectProgress(project).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div 
                        className="bg-white rounded-full h-1 transition-all duration-500"
                        style={{ width: `${getProjectProgress(project)}%` }}
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
                  src={selectedProject.featured_image || '/placeholder.svg'} 
                  alt={selectedProject.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
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
                    <span className="font-bold">{getProjectProgress(selectedProject).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${getProjectProgress(selectedProject)}%` }}
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
