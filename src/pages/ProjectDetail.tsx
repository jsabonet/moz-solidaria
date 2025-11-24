// src/pages/ProjectDetail.tsx
// Página pública para exibição completa de detalhes do projeto

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Target, 
  Clock,
  CheckCircle,
  Play,
  Pause,
  Heart,
  Share2,
  Download,
  Eye,
  TrendingUp,
  ArrowLeft,
  ExternalLink,
  Edit,
  FileText,
  ImageIcon,
  Star,
  AlertCircle,
  User,
  Building,
  Globe,
  Briefcase,
  DollarSign,
  Activity,
  Award,
  Camera,
  Video,
  Paperclip,
  Circle,
  Settings
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { fetchCompleteProjectData, fetchProjectDetail } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface completa baseada em CreateProject.tsx e ProjectTracker.tsx
interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  content: string;
  excerpt: string;
  program?: {
    id: number;
    name: string;
    color: string;
  };
  category?: {
    id: number;
    name: string;
  };
  status: 'planning' | 'active' | 'completed' | 'suspended';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress_percentage: number;
  manager?: {
    id: number;
    username: string;
    full_name: string;
  };
  location: string;
  district?: string;
  province?: string;
  coordinates?: string;
  start_date: string;
  end_date?: string;
  target_beneficiaries: number;
  current_beneficiaries?: number;
  target_budget?: number;
  current_spending?: number;
  project_document?: string;
  featured_image?: string;
  image?: string;
  featured: boolean;
  tags?: string[];
  seo_keywords?: string[];
  team_members?: string[];
  created_at: string;
  updated_at?: string;
  
  // Dados de tracking
  milestones?: {
    id: number;
    title: string;
    description: string;
    target_date: string;
    completion_date?: string;
    is_completed: boolean;
    progress_percentage?: number;
  }[];
  
  activities?: {
    id: number;
    name: string;
    description: string;
    status: string;
    start_date: string;
    end_date?: string;
  }[];
  
  updates?: {
    id: number;
    title: string;
    description: string;
    type: 'progress' | 'milestone' | 'issue' | 'achievement' | 'financial' | 'community';
    status: 'draft' | 'published' | 'archived';
    people_impacted?: number;
    budget_spent?: string;
    progress_percentage?: number;
    author_name?: string;
    created_at: string;
    updated_at: string;
  }[];
  
  gallery_images?: {
    id: number;
    title: string;
    description: string;
    url?: string;
    image?: string;
    image_url?: string;
    category: 'before' | 'after' | 'progress' | 'team' | 'community' | 'infrastructure' | 'events';
    upload_date: string;
  }[];
  
  evidences?: {
    id: number;
    title: string;
    description: string;
  // Suporte a ambos formatos (tracking vs público)
  file_url?: string;
  file?: string;
  file_type?: 'pdf' | 'image' | 'document' | 'video' | 'report' | 'certificate' | 'other';
  type?: 'pdf' | 'image' | 'document' | 'video' | 'report' | 'certificate' | 'other';
  upload_date?: string;
  created_at?: string;
  }[];
  
  metrics?: {
    peopleImpacted?: number;
    communitiesReached?: number;
    volunteersInvolved?: number;
    partnershipsFormed?: number;
    budgetUsed?: number;
    budgetTotal?: number;
    progressPercentage?: number;
    completedMilestones?: number;
    totalMilestones?: number;
    lastUpdate?: string;
  };
}

// Funções auxiliares
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'planning': return <Clock className="h-4 w-4" />;
    case 'active': return <Play className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'suspended': return <Pause className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'planning': return 'Planejamento';
    case 'active': return 'Ativo';
    case 'completed': return 'Concluído';
    case 'suspended': return 'Suspenso';
    default: return 'Desconhecido';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning': return 'secondary';
    case 'active': return 'default';
    case 'completed': return 'default';
    case 'suspended': return 'destructive';
    default: return 'secondary';
  }
};

const getPriorityIcon = (priority: string) => {
  const normalizedPriority = priority?.toString().trim().toLowerCase();
  switch (normalizedPriority) {
    case 'low': return <Circle className="h-4 w-4" />;
    case 'medium': return <AlertCircle className="h-4 w-4" />;
    case 'high': return <TrendingUp className="h-4 w-4" />;
    case 'urgent': return <AlertCircle className="h-4 w-4 fill-current" />;
    default: return <Circle className="h-4 w-4" />;
  }
};

const getPriorityLabel = (priority: string) => {
  // Normalizar o valor removendo espaços e convertendo para lowercase
  const normalizedPriority = priority?.toString().trim().toLowerCase();
  
  switch (normalizedPriority) {
    case 'low': return 'Baixa';
    case 'medium': return 'Média';
    case 'high': return 'Alta';
    case 'urgent': return 'Urgente';
    default: 
      return 'Média'; // Valor padrão em vez de "Não definida"
  }
};

const getPriorityColor = (priority: string) => {
  const normalizedPriority = priority?.toString().trim().toLowerCase();
  switch (normalizedPriority) {
    case 'low': return 'bg-blue-100 text-blue-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'urgent': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (date: string | Date | null | undefined) => {
  try {
    // Verificar se a data é válida
    if (!date) {
      return 'Data não informada';
    }

    // Se for string vazia
    if (typeof date === 'string' && date.trim() === '') {
      return 'Data não informada';
    }

    const dateObj = new Date(date);
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    return 'Data inválida';
  }
};

const formatCurrency = (amount: number) => {
  // Forçar exibição do código da moeda "MZN" (evitar símbolo antigo MTn ou símbolo local)
  if (amount == null || isNaN(amount as any)) return 'MZN 0';
  const formatted = new Intl.NumberFormat('pt-MZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return `MZN ${formatted}`;
};

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (slug) {
      loadProjectData();
    }
  }, [slug]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentar buscar dados completos primeiro
      let projectData;
      try {
        projectData = await fetchCompleteProjectData(slug);
      } catch (error) {
        // Fallback para busca básica
        projectData = await fetchProjectDetail(slug);
      }
      
      setProject(projectData);
    } catch (error: any) {
      setError('Projeto não encontrado ou erro ao carregar dados');
      toast.error('Erro ao carregar projeto');
    } finally {
      setLoading(false);
    }
  };

  // Funções auxiliares para cálculos
  const calculateProjectProgress = () => {
    // Priorizar metrics.progressPercentage (dados do ProjectTracker) se disponível
    if (project?.metrics?.progressPercentage !== undefined && project.metrics.progressPercentage > 0) {
      return Math.min(project.metrics.progressPercentage, 100);
    }
    
    if (project?.progress_percentage !== undefined && project.progress_percentage > 0) {
      return Math.min(project.progress_percentage, 100);
    }

    // Calcular baseado em marcos se disponível (suporta ambos formatos)
    if (project?.milestones && project.milestones.length > 0) {
      const completed = project.milestones.filter((m: any) => m.is_completed === true || m.status === 'completed').length;
      return Math.min((completed / project.milestones.length) * 100, 100);
    }

    return 0;
  };

  const calculateBeneficiariesProgress = () => {
    if (!project?.target_beneficiaries) return 0;
    // Priorizar metrics.peopleImpacted (dados do ProjectTracker) se disponível
    const current = project.metrics?.peopleImpacted ?? project.current_beneficiaries ?? 0;
    return Math.min((current / project.target_beneficiaries) * 100, 100);
  };

  const calculateBudgetProgress = () => {
    // Priorizar dados de metrics do ProjectTracker
    if (project?.metrics?.budgetTotal && project.metrics.budgetTotal > 0) {
      const used = project.metrics.budgetUsed || 0;
      const total = project.metrics.budgetTotal;
      return Math.min((used / total) * 100, 100);
    }
    
    // Fallback para dados básicos do projeto
    const total = (project as any).budget ?? project?.target_budget;
    if (!total || total <= 0) return 0;
    const used = project.current_spending || 0;
    return Math.min((used / total) * 100, 100);
  };

  const getCurrentBeneficiaries = () => {
    // Priorizar peopleImpacted do ProjectTracker (mais atualizado)
    const result = project?.metrics?.peopleImpacted ?? project?.current_beneficiaries ?? 0;
    return result;
  };

  const getCurrentBudgetUsed = () => {
    // Priorizar budgetUsed do ProjectTracker (mais atualizado)
    return project?.metrics?.budgetUsed ?? project?.current_spending ?? 0;
  };

  const getTotalBudget = () => {
    // Priorizar budgetTotal do ProjectTracker, depois Project.budget, fallback target_budget legado
    const basic = (project as any).budget ?? project?.target_budget ?? 0;
    return project?.metrics?.budgetTotal ?? basic;
  };

  const getCompletedMilestones = () => {
    let result;
    if (project?.metrics?.completedMilestones !== undefined) {
      result = project.metrics.completedMilestones;
    } else if (project?.milestones && Array.isArray(project.milestones)) {
  result = project.milestones.filter((m: any) => m.is_completed === true || m.status === 'completed').length;
    } else {
      result = 0;
    }
    
    return result;
  };

  const getTotalMilestones = () => {
    let result;
    if (project?.metrics?.totalMilestones !== undefined) {
      result = project.metrics.totalMilestones;
    } else if (project?.milestones && Array.isArray(project.milestones)) {
      result = project.milestones.length;
    } else {
      result = 0;
    }
    
    return result;
  };

  const getPublishedUpdates = () => {
    if (!project?.updates) return [];
    return project.updates.filter(update => update.status === 'published');
  };

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'progress': return <TrendingUp className="h-4 w-4" />;
      case 'issue': return <AlertCircle className="h-4 w-4" />;
      case 'achievement': return <CheckCircle className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case 'milestone': return 'Marco';
      case 'progress': return 'Progresso';
      case 'issue': return 'Problema';
      case 'achievement': return 'Conquista';
      case 'financial': return 'Financeiro';
      case 'community': return 'Comunidade';
      default: return type;
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-green-100 text-green-800';
      case 'issue': return 'bg-red-100 text-red-800';
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'financial': return 'bg-purple-100 text-purple-800';
      case 'community': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Loading 
        variant="fullscreen" 
        message="Carregando detalhes do projeto..." 
        size="xl" 
      />
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Projeto Não Encontrado</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'O projeto que você está procurando não foi encontrado.'}
            </p>
            <Button asChild>
              <Link to="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Projetos
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">      
      <SEOHead 
        title={`${project.name} - Moz Solidária Hub`}
        description={project.description}
        keywords={project.seo_keywords?.join(', ') || project.tags?.join(', ')}
        image={project.featured_image || project.image}
      />
      
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Conteúdo do Hero */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/projects" className="hover:text-primary transition-colors">
                  Projetos
                </Link>
                <span>/</span>
                <span>{project.name}</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={getStatusColor(project.status) as any}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(project.status)}
                    {getStatusLabel(project.status)}
                  </Badge>
                  
                  <Badge className={getPriorityColor(project.priority || 'medium')}>
                    {getPriorityIcon(project.priority || 'medium')}
                    <span className="ml-1">{getPriorityLabel(project.priority || 'medium')}</span>
                  </Badge>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                  {project.name}
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {project.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {project.location}
                      {project.district && project.district !== project.location && `, ${project.district}`}
                      {project.province && `, ${project.province}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Início: {formatDate(project.start_date)}</span>
                  </div>
                </div>

                {/* Métricas Rápidas */}
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {getCurrentBeneficiaries().toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Beneficiários</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {calculateProjectProgress().toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Progresso</div>
                  </div>
                            {getTotalBudget() > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {calculateBudgetProgress().toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Orçamento</div>
                    </div>
                  )}
                            {getTotalMilestones() > 0 && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                  {getCompletedMilestones()}/{getTotalMilestones()}
                                </div>
                                <div className="text-xs text-muted-foreground">Marcos</div>
                              </div>
                            )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to={`/doacao`}>
                    <Heart className="h-4 w-4" />
                    Apoiar Projeto
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </div>
            </div>

            {/* Imagem */}
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                <img 
                  src={project.featured_image || project.image || 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1000&auto=format&fit=crop'}
                  alt={project.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1000&auto=format&fit=crop';
                  }}
                />
              </div>
              
              {/* Overlay com Progresso */}
              <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso do Projeto</span>
                  <span className="text-sm text-muted-foreground">
                    {calculateProjectProgress().toFixed(1)}%
                  </span>
                </div>
                <Progress value={calculateProjectProgress()} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="progress">Progresso</TabsTrigger>
              <TabsTrigger value="gallery">Galeria</TabsTrigger>
              <TabsTrigger value="evidence">Evidências</TabsTrigger>
              <TabsTrigger value="impact">Impacto</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Descrição Principal */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre o Projeto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Resumo curto destacado, quando disponível */}
                      {project.short_description && (
                        <div className="mb-4 p-4 bg-muted/40 border rounded-lg">
                          <p className="text-base text-muted-foreground leading-relaxed">
                            {project.short_description}
                          </p>
                        </div>
                      )}
                      
                      <div className="prose prose-slate max-w-none">
                        {project.content ? (
                          <div dangerouslySetInnerHTML={{ __html: project.content }} />
                        ) : (
                          <p>{project.description}</p>
                        )}
                      </div>
                      
                      {/* Excerpt se disponível */}
                      {project.excerpt && project.excerpt !== project.description && (
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-2">Resumo Executivo</h4>
                          <p className="text-muted-foreground">{project.excerpt}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tags e Categorias */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Categorização
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {project.program && (
                          <div>
                            <Label className="text-sm font-medium">Programa</Label>
                            <Badge variant="secondary" className="ml-2">
                              {project.program.name}
                            </Badge>
                          </div>
                        )}
                        
                        {project.category && (
                          <div>
                            <Label className="text-sm font-medium">Categoria</Label>
                            <Badge variant="outline" className="ml-2">
                              {project.category.name}
                            </Badge>
                          </div>
                        )}

                        {project.tags && project.tags.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Tags</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.tags.map((tag, index) => (
                                <Badge key={index} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline e Cronograma */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Cronograma do Projeto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Data de Início</Label>
                          <p className="text-muted-foreground">
                            {formatDate(project.start_date)}
                          </p>
                        </div>
                        {project.end_date && (
                          <div>
                            <Label className="text-sm font-medium">Data de Término</Label>
                            <p className="text-muted-foreground">
                              {formatDate(project.end_date)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Timeline */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Progresso Geral</Label>
                          <span className="text-sm text-muted-foreground">
                            {calculateProjectProgress().toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={calculateProjectProgress()} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar with Key Info */}
                <div className="space-y-6">
                  {/* Status e Prioridade */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status do Projeto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge 
                          variant={getStatusColor(project.status) as any}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(project.status)}
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Prioridade</Label>
                        <Badge className={getPriorityColor(project.priority || 'medium')}>
                          {getPriorityIcon(project.priority || 'medium')}
                          <span className="ml-1">{getPriorityLabel(project.priority || 'medium')}</span>
                        </Badge>
                      </div>

                      {project.manager && (
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Gestor</Label>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm">{project.manager.full_name || project.manager.username}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Localização */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Localização
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {project.province && (
                        <div>
                          <Label className="text-sm font-medium">Província</Label>
                          <p className="text-muted-foreground">{project.province}</p>
                        </div>
                      )}
                      {project.district && (
                        <div>
                          <Label className="text-sm font-medium">Distrito</Label>
                          <p className="text-muted-foreground">{project.district}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Local</Label>
                        <p className="text-muted-foreground">{project.location}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métricas Principais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Métricas Principais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Beneficiários */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-medium">Beneficiários</Label>
                          <span className="text-sm text-muted-foreground">
                            {getCurrentBeneficiaries().toLocaleString()} / {(project.target_beneficiaries || 0).toLocaleString()}
                          </span>
                        </div>
                        <Progress value={calculateBeneficiariesProgress()} className="h-2" />
                      </div>

                      {/* Orçamento */}
                      {getTotalBudget() > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Orçamento Utilizado</Label>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(getCurrentBudgetUsed())} / {formatCurrency(getTotalBudget())}
                            </span>
                          </div>
                          <Progress value={calculateBudgetProgress()} className="h-2" />
                        </div>
                      )}

                      {/* Marcos */}
                      {getTotalMilestones() > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Marcos Concluídos</Label>
                            <span className="text-sm text-muted-foreground">
                              {getCompletedMilestones()} / {getTotalMilestones()}
                            </span>
                          </div>
                          <Progress 
                            value={getTotalMilestones() > 0 ? (getCompletedMilestones() / getTotalMilestones()) * 100 : 0} 
                            className="h-2" 
                          />
                        </div>
                      )}

                      {/* Marcos */}
                      {/* (Removido bloco duplicado de marcos baseado diretamente em project.milestones) */}
                    </CardContent>
                  </Card>

                  {/* Documentos */}
                  {project.project_document && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Documentação
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <a href={project.project_document} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Documento do Projeto
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Team Members */}
                  {project.team_members && project.team_members.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Equipe
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {project.team_members.map((member, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="text-sm">{member}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Detalhes Completos */}
            <TabsContent value="details" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orçamento Detalhado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Orçamento Detalhado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getTotalBudget() > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Orçamento Total</Label>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(getTotalBudget())}
                        </p>
                      </div>
                    )}

                    {getCurrentBudgetUsed() > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Orçamento Utilizado</Label>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(getCurrentBudgetUsed())}
                        </p>
                      </div>
                    )}

                    {getTotalBudget() > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Execução Orçamentária</Label>
                          <span className="text-sm text-muted-foreground">
                            {calculateBudgetProgress().toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={calculateBudgetProgress()} className="h-3" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Localização Detalhada */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Localização Detalhada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">País</Label>
                      <p className="text-muted-foreground">Moçambique</p>
                    </div>
                    {project.province && (
                      <div>
                        <Label className="text-sm font-medium">Província</Label>
                        <p className="text-muted-foreground">{project.province}</p>
                      </div>
                    )}
                    {project.district && (
                      <div>
                        <Label className="text-sm font-medium">Distrito</Label>
                        <p className="text-muted-foreground">{project.district}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Localização Específica</Label>
                      <p className="text-muted-foreground">{project.location}</p>
                    </div>
                    {project.coordinates && (
                      <div>
                        <Label className="text-sm font-medium">Coordenadas</Label>
                        <p className="text-muted-foreground font-mono">{project.coordinates}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Métricas de Impacto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Métricas de Impacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Beneficiários Alvo</Label>
                        <p className="text-xl font-bold text-primary">{(project.target_beneficiaries || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Beneficiários Atuais</Label>
                        <p className="text-xl font-bold text-green-600">
                          {getCurrentBeneficiaries().toLocaleString()}
                        </p>
                      </div>
                      {getTotalBudget() > 0 && (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Orçamento Total</Label>
                            <p className="text-xl font-bold text-primary">{formatCurrency(getTotalBudget())}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Orçamento Usado</Label>
                            <p className="text-xl font-bold text-orange-600">
                              {formatCurrency(getCurrentBudgetUsed())}
                            </p>
                          </div>
                        </>
                      )}
                      {getTotalMilestones() > 0 && (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Total de Marcos</Label>
                            <p className="text-xl font-bold text-primary">{getTotalMilestones()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Marcos Concluídos</Label>
                            <p className="text-xl font-bold text-green-600">
                              {getCompletedMilestones()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {project.metrics && (
                      <>
                        {project.metrics.communitiesReached && (
                          <div>
                            <Label className="text-sm font-medium">Comunidades Alcançadas</Label>
                            <p className="text-lg font-semibold">{project.metrics.communitiesReached}</p>
                          </div>
                        )}

                        {project.metrics.volunteersInvolved && (
                          <div>
                            <Label className="text-sm font-medium">Voluntários Envolvidos</Label>
                            <p className="text-lg font-semibold">{project.metrics.volunteersInvolved}</p>
                          </div>
                        )}

                        {project.metrics.partnershipsFormed && (
                          <div>
                            <Label className="text-sm font-medium">Parcerias Formadas</Label>
                            <p className="text-lg font-semibold">{project.metrics.partnershipsFormed}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Progresso e Milestones */}
            <TabsContent value="progress" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Marcos do Projeto */}
                  {project.milestones && project.milestones.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Marcos do Projeto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {project.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                              <div className={`mt-1 p-1 rounded-full ${
                                milestone.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {milestone.is_completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className={`font-medium ${
                                  milestone.is_completed ? 'text-green-800' : 'text-foreground'
                                }`}>
                                  {milestone.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {milestone.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>Meta: {formatDate(milestone.target_date)}</span>
                                  {milestone.completion_date && (
                                    <span className="text-green-600">Concluído: {formatDate(milestone.completion_date)}</span>
                                  )}
                                </div>
                                {milestone.progress_percentage !== undefined && (
                                  <Progress value={milestone.progress_percentage} className="mt-2 h-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Marcos em Breve</h3>
                        <p className="text-muted-foreground">
                          Os marcos do projeto serão definidos em breve
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Atualizações do Projeto */}
                  {getPublishedUpdates().length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Atualizações do Projeto
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getPublishedUpdates().length} atualizações publicadas
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {getPublishedUpdates()
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .slice(0, 10) // Mostrar últimas 10 atualizações
                            .map((update, index) => (
                            <div key={update.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex-shrink-0 mt-1">
                                <div className={`p-2 rounded-lg ${getUpdateTypeColor(update.type)}`}>
                                  {getUpdateTypeIcon(update.type)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="font-medium text-foreground">{update.title}</h4>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge className={getUpdateTypeColor(update.type)}>
                                      {getUpdateTypeLabel(update.type)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(update.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{update.description}</p>
                                
                                {/* Métricas da Atualização */}
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                  {update.people_impacted && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{update.people_impacted.toLocaleString()} pessoas impactadas</span>
                                    </div>
                                  )}
                                  {update.budget_spent && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      <span>{formatCurrency(parseFloat(update.budget_spent))} gastos</span>
                                    </div>
                                  )}
                                  {update.progress_percentage && (
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3" />
                                      <span>{update.progress_percentage}% de progresso</span>
                                    </div>
                                  )}
                                  {update.author_name && (
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      <span>por {update.author_name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {getPublishedUpdates().length > 10 && (
                          <div className="mt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                              Mostrando as 10 atualizações mais recentes de {getPublishedUpdates().length} total
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : project.activities && project.activities.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Atividades do Projeto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {project.activities.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{activity.name}</h4>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Início: {formatDate(activity.start_date)}
                                  {activity.end_date && ` • Fim: ${formatDate(activity.end_date)}`}
                                </div>
                              </div>
                              <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                                {activity.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Atualizações em Breve</h3>
                        <p className="text-muted-foreground">
                          As atualizações e atividades do projeto serão publicadas em breve
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Histórico de Atualizações Detalhado */}
                  {getPublishedUpdates().length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Histórico de Atualizações
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Timeline completo das atualizações do projeto
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {getPublishedUpdates()
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((update, index) => (
                            <div key={update.id} className="relative">
                              {/* Timeline line */}
                              {index < getPublishedUpdates().length - 1 && (
                                <div className="absolute left-6 top-12 w-0.5 h-8 bg-border"></div>
                              )}
                              
                              <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                  <div className={`p-3 rounded-full ${getUpdateTypeColor(update.type)}`}>
                                    {getUpdateTypeIcon(update.type)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                      <h4 className="font-medium">{update.title}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(update.created_at)} 
                                        {update.author_name && ` • por ${update.author_name}`}
                                      </p>
                                    </div>
                                    <Badge className={getUpdateTypeColor(update.type)}>
                                      {getUpdateTypeLabel(update.type)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">{update.description}</p>
                                  
                                  {/* Métricas em grid */}
                                  {(update.people_impacted || update.budget_spent || update.progress_percentage) && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                                      {update.people_impacted && (
                                        <div className="text-center">
                                          <div className="text-lg font-semibold text-primary">
                                            {update.people_impacted.toLocaleString()}
                                          </div>
                                          <div className="text-xs text-muted-foreground">Pessoas Impactadas</div>
                                        </div>
                                      )}
                                      {update.budget_spent && (
                                        <div className="text-center">
                                          <div className="text-lg font-semibold text-primary">
                                            {formatCurrency(parseFloat(update.budget_spent))}
                                          </div>
                                          <div className="text-xs text-muted-foreground">Orçamento Gasto</div>
                                        </div>
                                      )}
                                      {update.progress_percentage && (
                                        <div className="text-center">
                                          <div className="text-lg font-semibold text-primary">
                                            {update.progress_percentage}%
                                          </div>
                                          <div className="text-xs text-muted-foreground">Progresso Reportado</div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar com Resumo do Progresso */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo do Progresso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {calculateProjectProgress().toFixed(0)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Progresso Geral</p>
                      </div>

                      <Progress value={calculateProjectProgress()} className="h-3" />

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Marcos Concluídos</span>
                          <span className="font-medium">
                            {getCompletedMilestones()}/{getTotalMilestones()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Beneficiários Alcançados</span>
                          <span className="font-medium">
                            {calculateBeneficiariesProgress().toFixed(0)}% ({getCurrentBeneficiaries().toLocaleString()})
                          </span>
                        </div>

                        {getTotalBudget() > 0 && (
                          <div className="flex justify-between">
                            <span>Orçamento Executado</span>
                            <span className="font-medium">
                              {calculateBudgetProgress().toFixed(0)}% ({formatCurrency(getCurrentBudgetUsed())})
                            </span>
                          </div>
                        )}

                        {project.metrics?.lastUpdate && (
                          <div className="flex justify-between">
                            <span>Última Atualização</span>
                            <span className="font-medium">
                              {formatDate(project.metrics.lastUpdate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Início</Label>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(project.start_date)}
                        </p>
                      </div>
                      
                      {project.end_date && (
                        <div>
                          <Label className="text-sm font-medium">Término Previsto</Label>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(project.end_date)}
                          </p>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium">Duração</Label>
                        <p className="text-sm text-muted-foreground">
                          {project.end_date ? 
                            `${Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))} dias`
                            : 'Em andamento'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status do Projeto */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Atual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge 
                          variant={getStatusColor(project.status) as any}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(project.status)}
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Prioridade</span>
                        <Badge className={getPriorityColor(project.priority)}>
                          {getPriorityIcon(project.priority)}
                          <span className="ml-1">{getPriorityLabel(project.priority)}</span>
                        </Badge>
                      </div>

                      {project.manager && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Gestor</span>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            <span>{project.manager.full_name || project.manager.username}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Galeria */}
            <TabsContent value="gallery" className="space-y-8">
              {project.gallery_images && project.gallery_images.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">Galeria do Projeto</h3>
                    <p className="text-muted-foreground">
                      Imagens que documentam o progresso e impacto do projeto
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.gallery_images.map((image) => (
                      <Card key={image.id} className="overflow-hidden group">
                        <div className="relative">
                          <img 
                            src={image.image_url || image.image || image.url}
                            alt={image.title}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-white text-center p-4">
                              <h4 className="font-medium mb-1">{image.title}</h4>
                              <p className="text-xs text-gray-200">{image.description}</p>
                            </div>
                          </div>
                          <Badge 
                            className="absolute top-2 left-2"
                            variant={image.category === 'before' ? 'destructive' : 
                                   image.category === 'after' ? 'default' : 'secondary'}
                          >
                            {image.category === 'before' ? 'Antes' :
                             image.category === 'after' ? 'Depois' :
                             image.category === 'progress' ? 'Progresso' :
                             image.category === 'team' ? 'Equipe' :
                             image.category === 'community' ? 'Comunidade' :
                             image.category === 'infrastructure' ? 'Infraestrutura' :
                             'Eventos'}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">{image.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{image.description}</p>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(image.upload_date)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Galeria em Breve</h3>
                    <p className="text-muted-foreground">
                      As imagens do projeto serão adicionadas em breve
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Evidências e Documentação - visual minimalista (estilo documentos) */}
            <TabsContent value="evidence" className="space-y-8">
              {project.evidences && project.evidences.length > 0 ? (
                <div className="space-y-8">
                  {/* Lista única de evidências (todas como documentos) */}
                  {(() => {
                    const items = project.evidences!
                      .map(e => ({
                        id: e.id,
                        title: e.title,
                        description: e.description,
                        file: e.file_url || e.file || '',
                        date: e.upload_date || e.created_at || '',
                      }))
                      .filter(e => e.file);

                    return (
                      <div>
                        <div className="mb-6">
                          <h3 className="text-xl font-bold mb-2">Evidências e Documentos</h3>
                          <p className="text-muted-foreground">Arquivos e registros oficiais relacionados ao projeto</p>
                        </div>
                        <div className="space-y-3">
                          {items.map(item => (
                            <Card key={item.id} className="group hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="p-3 bg-primary/10 rounded-lg">
                                    <FileText className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium mb-1">{item.title}</h4>
                                    {item.description && (
                                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" asChild>
                                          <a href={item.file} target="_blank" rel="noopener noreferrer">
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver
                                          </a>
                                        </Button>
                                        <Button size="sm" variant="outline" asChild>
                                          <a href={item.file} download>
                                            <Download className="h-4 w-4 mr-1" />
                                            Baixar
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Sem Evidências</h3>
                    <p className="text-muted-foreground">Ainda não há evidências ou documentos anexados a este projeto.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Impacto */}
            <TabsContent value="impact" className="space-y-8">
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Pessoas Impactadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {getCurrentBeneficiaries().toLocaleString()}
                    </div>
                    <p className="text-muted-foreground mb-3">
                      De {project.target_beneficiaries?.toLocaleString() || 0} pessoas previstas
                    </p>
                    <Progress 
                      value={calculateBeneficiariesProgress()} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                {getTotalBudget() > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5" />
                        Orçamento Utilizado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {calculateBudgetProgress().toFixed(0)}%
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {formatCurrency(getCurrentBudgetUsed())} de {formatCurrency(getTotalBudget())}
                      </p>
                      <Progress 
                        value={calculateBudgetProgress()} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                )}

                {getTotalMilestones() > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Marcos Concluídos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {getCompletedMilestones()}
                      </div>
                      <p className="text-muted-foreground mb-3">
                        De {getTotalMilestones()} marcos planejados
                      </p>
                      <Progress 
                        value={getTotalMilestones() > 0 ? (getCompletedMilestones() / getTotalMilestones()) * 100 : 0} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" />
                      Progresso Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {calculateProjectProgress().toFixed(0)}%
                    </div>
                    <p className="text-muted-foreground mb-3">
                      Conclusão geral do projeto
                    </p>
                    <Progress 
                      value={calculateProjectProgress()} 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes do Impacto */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Métricas Adicionais */}
                {project.metrics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Métricas de Alcance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {project.metrics.communitiesReached && (
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Comunidades Alcançadas</Label>
                          <span className="text-lg font-bold text-primary">
                            {project.metrics.communitiesReached}
                          </span>
                        </div>
                      )}

                      {project.metrics.volunteersInvolved && (
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Voluntários Envolvidos</Label>
                          <span className="text-lg font-bold text-primary">
                            {project.metrics.volunteersInvolved}
                          </span>
                        </div>
                      )}

                      {project.metrics.partnershipsFormed && (
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Parcerias Formadas</Label>
                          <span className="text-lg font-bold text-primary">
                            {project.metrics.partnershipsFormed}
                          </span>
                        </div>
                      )}

                      {project.metrics.lastUpdate && (
                        <div className="pt-4 border-t">
                          <Label className="text-sm font-medium">Última Atualização</Label>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(project.metrics.lastUpdate)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Impacto na Comunidade */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Impacto na Comunidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate max-w-none">
                      <p>
                        Este projeto está transformando a vida de {getCurrentBeneficiaries().toLocaleString()} pessoas em {project.location}. 
                        Com {calculateProjectProgress().toFixed(0)}% do projeto já concluído, estamos construindo um futuro 
                        melhor para toda a comunidade.
                      </p>
                      
                      <h4 className="font-semibold mt-4 mb-2">Resultados Alcançados:</h4>
                      <ul className="space-y-1">
                        <li>• {getCurrentBeneficiaries().toLocaleString()} pessoas diretamente beneficiadas</li>
                        <li>• Melhoria na qualidade de vida da comunidade</li>
                        <li>• Fortalecimento das estruturas locais</li>
                        <li>• Criação de oportunidades de desenvolvimento</li>
                        {getCompletedMilestones() > 0 && (
                          <li>• {getCompletedMilestones()} marcos importantes concluídos</li>
                        )}
                        {project.metrics?.communitiesReached && (
                          <li>• {project.metrics.communitiesReached} comunidades alcançadas</li>
                        )}
                        {project.metrics?.volunteersInvolved && (
                          <li>• {project.metrics.volunteersInvolved} voluntários mobilizados</li>
                        )}
                      </ul>

                      <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold text-primary mb-2">Próximos Passos</h4>
                        <p className="text-sm text-muted-foreground">
                          O projeto continuará expandindo seu impacto, com foco em alcançar as {project.target_beneficiaries?.toLocaleString() || 0} pessoas previstas 
                          e completar todos os marcos estabelecidos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Marcos com Impacto */}
              {project.milestones && project.milestones.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Marcos de Impacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.milestones.map((milestone, index) => (
                        <div key={index} className={`flex items-start gap-4 p-4 rounded-lg border ${
                          milestone.is_completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className={`mt-1 p-2 rounded-full ${
                            milestone.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {milestone.is_completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium mb-1 ${
                              milestone.is_completed ? 'text-green-800' : 'text-foreground'
                            }`}>
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                Meta: {formatDate(milestone.target_date)}
                              </span>
                              {milestone.completion_date && (
                                <span className="text-green-600 font-medium">
                                  ✓ Concluído: {formatDate(milestone.completion_date)}
                                </span>
                              )}
                            </div>
                            {milestone.progress_percentage !== undefined && (
                              <Progress value={milestone.progress_percentage} className="mt-2 h-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
