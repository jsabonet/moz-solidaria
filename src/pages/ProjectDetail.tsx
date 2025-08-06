import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  ImageIcon
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { fetchCompleteProjectData, fetchProjectDetail } from '@/lib/api';
import { toast } from 'sonner';

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
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress_percentage: number;
  manager?: {
    id: number;
    username: string;
    full_name: string;
  };
  location: string;
  district: string;
  province: string;
  start_date: string;
  end_date?: string;
  target_beneficiaries: number;
  current_beneficiaries: number;
  target_budget?: number;
  current_spending: number;
  featured_image?: string;
  gallery_images?: ProjectGalleryImage[];
  evidences?: ProjectEvidence[];
  milestones?: ProjectMilestone[];
  is_featured: boolean;
  tags: string[];
  meta_description: string;
  created_at: string;
  updated_at: string;
  updates: ProjectUpdate[];
  metrics: ProjectMetrics;
}

interface ProjectUpdate {
  id: number;
  title: string;
  content: string;
  author: {
    full_name: string;
  };
  beneficiaries_reached: number;
  budget_spent: number;
  featured_image?: string;
  is_milestone: boolean;
  status: 'draft' | 'published';
  people_impacted?: number;
  created_at: string;
}

interface ProjectGalleryImage {
  id: number;
  title: string;
  description: string;
  url: string;
  category: 'before' | 'after' | 'progress' | 'team' | 'community' | 'infrastructure' | 'events';
  uploadDate: string;
}

interface ProjectEvidence {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: 'pdf' | 'doc' | 'image' | 'video';
  uploaded_at: string;
}

interface ProjectMilestone {
  id: number;
  title: string;
  description: string;
  target_date: string;
  completion_date?: string;
  is_completed: boolean;
  progress_percentage: number;
}

interface ProjectMetrics {
  peopleImpacted: number;
  budgetUsed: number;
  budgetTotal: number;
  progressPercentage: number;
  completedMilestones: number;
  totalMilestones: number;
  lastUpdate: string | null;
}

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      console.log('🔍 ProjectDetail - Carregando projeto público:', slug);
      
      const projectData = await fetchCompleteProjectData(slug);
      console.log('✅ ProjectDetail - Dados carregados:', projectData);
      setProject(projectData);
      
    } catch (error) {
      console.error('❌ ProjectDetail - Erro ao carregar projeto:', error);
      
      // Tentar fallback com dados básicos apenas
      try {
        console.log('🔄 ProjectDetail - Tentando fallback com dados básicos...');
        const basicProject = await fetchProjectDetail(slug);
        
        if (basicProject) {
          // Adicionar campos vazios para evitar erros
          const projectWithDefaults = {
            ...basicProject,
            updates: [],
            evidences: [],
            gallery_images: [],
            milestones: [],
            metrics: {
              peopleImpacted: basicProject.current_beneficiaries || 0,
              budgetUsed: basicProject.current_spending || 0,
              budgetTotal: basicProject.target_budget || 0,
              progressPercentage: basicProject.progress_percentage || 0,
              completedMilestones: 0,
              totalMilestones: 0,
              lastUpdate: basicProject.updated_at || null
            }
          };
          
          console.log('✅ ProjectDetail - Fallback bem-sucedido:', projectWithDefaults);
          setProject(projectWithDefaults);
          toast.warning('Algumas informações do projeto podem estar limitadas.');
          return;
        }
      } catch (fallbackError) {
        console.error('❌ ProjectDetail - Fallback também falhou:', fallbackError);
      }
      
      toast.error('Projeto não encontrado');
      
      // Projeto mock final como último recurso
      const mockProject: Project = {
        id: 0,
        name: "Projeto não encontrado",
        slug: slug || "unknown",
        description: "Este projeto não foi encontrado no sistema.",
        short_description: "Projeto não encontrado.",
        content: "<p>Este projeto não foi encontrado no sistema. Verifique o link ou tente novamente mais tarde.</p>",
        excerpt: "Projeto não encontrado no sistema.",
        program: {
          id: 1,
          name: "Programa Geral",
          color: "gray"
        },
        status: "planning",
        priority: "low",
        progress_percentage: 0,
        location: "Não definida",
        district: "Não definido",
        province: "Não definida",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        target_beneficiaries: 0,
        current_beneficiaries: 0,
        target_budget: 0,
        current_spending: 0,
        featured_image: "https://images.unsplash.com/photo-1661345665867-63e6b12b774a?q=80&w=735&auto=format&fit=crop",
        gallery_images: [],
        evidences: [],
        milestones: [],
        is_featured: false,
        tags: [],
        meta_description: "Projeto não encontrado",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updates: [],
        metrics: {
          peopleImpacted: 0,
          budgetUsed: 0,
          budgetTotal: 0,
          progressPercentage: 0,
          completedMilestones: 0,
          totalMilestones: 0,
          lastUpdate: null
        }
      };
      setProject(mockProject);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'suspended':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Em Planejamento';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'secondary';
      case 'active':
        return 'default';
      case 'completed':
        return 'success';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.name,
        text: project?.short_description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para área de transferência!');
    }
  };

  const handleDonate = () => {
    // Redirecionar para página de doação com contexto do projeto
    window.location.href = `/doacao?projeto=${project?.slug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <h2 className="text-xl font-semibold">Carregando projeto...</h2>
              <p className="text-muted-foreground">
                Aguarde enquanto buscamos as informações do projeto
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Projeto não encontrado</h2>
            <p className="text-muted-foreground">
              O projeto que você está procurando não existe ou foi removido.
            </p>
            <Button asChild>
              <Link to="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Projetos
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
        title={`${project.name} - MOZ SOLIDÁRIA`}
        description={project.meta_description || project.short_description}
        keywords={project.tags?.join(', ') || ''}
        type="article"
        image={project.featured_image}
      />
      
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white">
        {project.featured_image && (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={project.featured_image} 
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-2 mb-4">
              <Link to="/" className="text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-white/80">Projetos</span>
              <span className="text-white/80">/</span>
              <span className="text-white">{project.name}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {project.program && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {project.program.name}
                </Badge>
              )}
              <Badge 
                variant={getStatusColor(project.status) as any}
                className="flex items-center gap-1"
              >
                {getStatusIcon(project.status)}
                {getStatusLabel(project.status)}
              </Badge>
              {project.is_featured && (
                <Badge variant="outline" className="border-white/20 text-white">
                  Projeto em Destaque
                </Badge>
              )}
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold mb-6">
              {project.name}
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              {project.short_description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={handleDonate}
              >
                <Heart className="h-4 w-4 mr-2" />
                Apoiar Projeto
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 text-white bg-white/10"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="progress">Progresso</TabsTrigger>
              <TabsTrigger value="gallery">Galeria</TabsTrigger>
              <TabsTrigger value="evidence">Evidências</TabsTrigger>
              <TabsTrigger value="impact" className="hidden lg:block">Impacto</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre o Projeto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: project.content }}
                      />
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
                            {new Date(project.start_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {project.end_date && (
                          <div>
                            <Label className="text-sm font-medium">Data de Término</Label>
                            <p className="text-muted-foreground">
                              {new Date(project.end_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Timeline */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Progresso Geral</Label>
                          <span className="text-sm text-muted-foreground">
                            {project.metrics?.progressPercentage || project.progress_percentage || 0}%
                          </span>
                        </div>
                        <Progress 
                          value={project.metrics?.progressPercentage || project.progress_percentage || 0} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metas e Recursos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Metas e Recursos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Beneficiários</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-2xl font-bold text-primary">
                                {project.metrics?.peopleImpacted || project.current_beneficiaries || 0}
                              </div>
                              <span className="text-muted-foreground">
                                de {project.target_beneficiaries}
                              </span>
                            </div>
                            <Progress 
                              value={project.target_beneficiaries ? 
                                ((project.metrics?.peopleImpacted || project.current_beneficiaries || 0) / project.target_beneficiaries) * 100 : 
                                0
                              } 
                              className="mt-2"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Orçamento</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="text-2xl font-bold text-primary">
                                {(project.metrics?.budgetUsed || project.current_spending || 0).toLocaleString('pt-BR')}
                              </div>
                              <span className="text-muted-foreground">MZN</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              de {(project.metrics?.budgetTotal || project.target_budget || 0).toLocaleString('pt-BR')} MZN
                            </p>
                            <Progress 
                              value={project.target_budget ? 
                                ((project.metrics?.budgetUsed || project.current_spending || 0) / (project.metrics?.budgetTotal || project.target_budget)) * 100 : 
                                0
                              } 
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalhes do Projeto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Informações Básicas */}
                      <div>
                        <Label className="font-medium">Status:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(project.status)}
                          <Badge variant={getStatusColor(project.status) as any}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                      </div>

                      {project.program && (
                        <div>
                          <Label className="font-medium">Programa:</Label>
                          <p className="text-muted-foreground mt-1">{project.program.name}</p>
                        </div>
                      )}

                      {project.category && (
                        <div>
                          <Label className="font-medium">Categoria:</Label>
                          <p className="text-muted-foreground mt-1">{project.category.name}</p>
                        </div>
                      )}
                      
                      {/* Localização */}
                      <div>
                        <Label className="font-medium">Localização:</Label>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <div>
                            <p>{project.location}</p>
                            <p className="text-sm">{project.district}, {project.province}</p>
                          </div>
                        </div>
                      </div>

                      {project.manager && (
                        <div>
                          <Label className="font-medium">Responsável:</Label>
                          <p className="text-muted-foreground mt-1">{project.manager.full_name}</p>
                        </div>
                      )}

                      {project.tags && project.tags.length > 0 && (
                        <div>
                          <Label className="font-medium mb-2 block">Tags:</Label>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, index) => (
                              <Badge key={index} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Documentos */}
                  {project.evidences && project.evidences.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Documentos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {project.evidences.slice(0, 3).map((evidence) => (
                          <div key={evidence.id} className="flex items-center gap-3 p-2 border rounded-lg">
                            <div className="p-2 bg-primary/10 rounded">
                              {evidence.file_type === 'pdf' ? (
                                <FileText className="h-4 w-4 text-primary" />
                              ) : (
                                <Download className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{evidence.title}</p>
                              <p className="text-xs text-muted-foreground">{evidence.description}</p>
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                              <a href={evidence.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                        {project.evidences.length > 3 && (
                          <p className="text-sm text-center text-muted-foreground">
                            E mais {project.evidences.length - 3} documentos...
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-bold mb-4">Apoie Este Projeto</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sua doação faz a diferença na vida de {project.target_beneficiaries} pessoas
                      </p>
                      <Button className="w-full" onClick={handleDonate}>
                        <Heart className="h-4 w-4 mr-2" />
                        Fazer Doação
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Progresso */}
            <TabsContent value="progress" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Atualizações do Projeto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(project.updates || []).length > 0 ? (
                    (project.updates || []).map((update) => (
                      <div key={update.id} className="border-l-4 border-primary pl-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{update.title}</h4>
                            {update.is_milestone && (
                              <Badge variant="secondary" className="mt-1">
                                Marco Importante
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {update.created_at ? new Date(update.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                          </span>
                        </div>
                        
                        <p className="text-muted-foreground">{update.content}</p>
                        
                        {update.featured_image && (
                          <img 
                            src={update.featured_image}
                            alt={update.title}
                            className="w-full max-w-sm h-32 object-cover rounded-md"
                          />
                        )}
                        
                        <div className="flex gap-4 text-sm">
                          <span>
                            <Users className="h-3 w-3 inline mr-1" />
                            {update.beneficiaries_reached || 0} beneficiários
                          </span>
                          <span>
                            <Target className="h-3 w-3 inline mr-1" />
                            {(update.budget_spent || 0).toLocaleString()} MZN gastos
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Por {update.author?.full_name || 'Autor desconhecido'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhuma atualização ainda</h3>
                      <p className="text-muted-foreground">
                        As atualizações do projeto serão publicadas em breve
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                            src={image.url}
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
                            {new Date(image.uploadDate).toLocaleDateString('pt-BR')}
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

            {/* Evidências e Documentação */}
            <TabsContent value="evidence" className="space-y-8">
              {project.evidences && project.evidences.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">Evidências e Documentação</h3>
                    <p className="text-muted-foreground">
                      Documentos, relatórios e evidências do projeto
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.evidences.map((evidence) => (
                      <Card key={evidence.id} className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              {evidence.file_type === 'pdf' ? (
                                <FileText className="h-6 w-6 text-primary" />
                              ) : evidence.file_type === 'image' ? (
                                <ImageIcon className="h-6 w-6 text-primary" />
                              ) : (
                                <Download className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium mb-1">{evidence.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{evidence.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(evidence.uploaded_at).toLocaleDateString('pt-BR')}
                                </span>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={evidence.file_url} target="_blank" rel="noopener noreferrer">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver
                                    </a>
                                  </Button>
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={evidence.file_url} download>
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
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Documentação em Breve</h3>
                    <p className="text-muted-foreground">
                      Os documentos e evidências do projeto serão adicionados em breve
                    </p>
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
                      {project.metrics?.peopleImpacted?.toLocaleString() || project.current_beneficiaries?.toLocaleString() || 0}
                    </div>
                    <p className="text-muted-foreground mb-3">
                      De {project.target_beneficiaries?.toLocaleString() || 0} pessoas previstas
                    </p>
                    <Progress 
                      value={project.target_beneficiaries ? 
                        ((project.metrics?.peopleImpacted || project.current_beneficiaries || 0) / project.target_beneficiaries) * 100 : 
                        0
                      } 
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5" />
                      Orçamento Utilizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {project.metrics?.budgetUsed && project.metrics?.budgetTotal
                        ? `${(((project.metrics.budgetUsed / project.metrics.budgetTotal) * 100).toFixed(0))}%`
                        : `${(((project.current_spending || 0) / (project.target_budget || 1)) * 100).toFixed(0)}%`
                      }
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {(project.metrics?.budgetUsed || project.current_spending || 0).toLocaleString()} MZN gastos
                    </p>
                    <Progress 
                      value={project.target_budget ? 
                        ((project.metrics?.budgetUsed || project.current_spending || 0) / (project.metrics?.budgetTotal || project.target_budget)) * 100 : 
                        0
                      } 
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5" />
                      Progresso Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {project.metrics?.progressPercentage || project.progress_percentage || 0}%
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {project.status === 'completed' ? 'Projeto finalizado' : 'Do projeto concluído'}
                    </p>
                    <Progress 
                      value={project.metrics?.progressPercentage || project.progress_percentage || 0} 
                      className="h-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5" />
                      Marcos Concluídos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {project.metrics?.completedMilestones || 0}
                    </div>
                    <p className="text-muted-foreground mb-3">
                      De {project.metrics?.totalMilestones || project.milestones?.length || 0} marcos
                    </p>
                    <Progress 
                      value={project.metrics?.totalMilestones ? 
                        ((project.metrics?.completedMilestones || 0) / project.metrics.totalMilestones) * 100 : 
                        0
                      } 
                      className="h-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Marcos do Projeto */}
              {project.milestones && project.milestones.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Marcos do Projeto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className={`p-2 rounded-full ${milestone.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                            {milestone.is_completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                Meta: {new Date(milestone.target_date).toLocaleDateString('pt-BR')}
                              </span>
                              {milestone.completion_date && (
                                <span className="text-green-600">
                                  Concluído: {new Date(milestone.completion_date).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                            <Progress value={milestone.progress_percentage} className="mt-2 h-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Impacto na Comunidade */}
              <Card>
                <CardHeader>
                  <CardTitle>Impacto na Comunidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate max-w-none">
                    <p>
                      Este projeto está transformando a vida de centenas de famílias em {project.location}. 
                      Com {project.metrics?.peopleImpacted || project.current_beneficiaries || 0} pessoas já beneficiadas, estamos construindo um futuro 
                      melhor para toda a comunidade.
                    </p>
                    
                    <h4>Resultados Alcançados:</h4>
                    <ul>
                      <li>{project.metrics?.peopleImpacted || project.current_beneficiaries || 0} pessoas diretamente beneficiadas</li>
                      <li>Melhoria na qualidade de vida da comunidade</li>
                      <li>Fortalecimento das estruturas locais</li>
                      <li>Criação de oportunidades de desenvolvimento</li>
                      {project.metrics?.completedMilestones && project.metrics.completedMilestones > 0 && (
                        <li>{project.metrics.completedMilestones} marcos importantes concluídos</li>
                      )}
                    </ul>

                    {project.metrics?.lastUpdate && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Última atualização: {new Date(project.metrics.lastUpdate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
