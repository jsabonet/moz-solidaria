import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp,
  Target,
  FileText,
  Image,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  BarChart3,
  Bell,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { fetchProjects, deleteProject, isAuthenticated } from '@/lib/api';
import ProjectUpdates from '@/components/ProjectUpdates';
import ProjectAnalytics from '@/components/ProjectAnalytics';
import ProjectNotifications from '@/components/ProjectNotifications';
import ProjectTracker from '@/components/ProjectTracker';
import ProjectGalleryManager from '@/components/ProjectGalleryManager';

interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  program?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  status: 'planning' | 'active' | 'completed' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress_percentage?: number;
  manager?: {
    id: number;
    username: string;
    full_name: string;
  };
  location: string;
  start_date: string;
  end_date?: string;
  target_beneficiaries: number;
  current_beneficiaries?: number;
  target_budget?: number;
  current_spending?: number;
  featured_image?: string;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_beneficiaries: number;
  total_budget: number;
  average_progress: number;
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    total_beneficiaries: 0,
    total_budget: 0,
    average_progress: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeProjectTab, setActiveProjectTab] = useState('all');
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailView, setDetailView] = useState<'updates' | 'analytics' | 'notifications' | 'tracker' | 'gallery' | 'metrics' | null>(null);

  // Verificar autenticação uma vez no carregamento
  useEffect(() => {
    const isAuth = isAuthenticated();
    setIsUserAuthenticated(isAuth);
  }, []);

  // Mostrar mensagem de autenticação uma única vez
  useEffect(() => {
    if (!loading && !showAuthMessage) {
      setShowAuthMessage(true);
      if (!isUserAuthenticated) {
        toast.info('Visualizando projetos públicos. Faça login para acessar o painel administrativo.', {
          duration: 5000,
        });
      }
    }
  }, [loading, showAuthMessage, isUserAuthenticated]);

  // Função auxiliar para calcular estatísticas
  const calculateStats = (projectsData: Project[]) => {
    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(p => p.status === 'active').length;
    const completedProjects = projectsData.filter(p => p.status === 'completed').length;
    const totalBeneficiaries = projectsData.reduce((sum, p) => sum + (p.current_beneficiaries || 0), 0);
    const totalBudget = projectsData.reduce((sum, p) => sum + (p.target_budget || 0), 0);
    const averageProgress = totalProjects > 0 ? 
      projectsData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalProjects : 0;

    return {
      total_projects: totalProjects,
      active_projects: activeProjects,
      completed_projects: completedProjects,
      total_beneficiaries: totalBeneficiaries,
      total_budget: totalBudget,
      average_progress: averageProgress
    };
  };

  // Carregar projetos da API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        
        // Buscar projetos usando lógica centralizada na API
        const projectsData = await fetchProjects();
        setProjects(projectsData);
        
        // Calcular e definir estatísticas
        setStats(calculateStats(projectsData));

      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        // Mostrar toast de erro após um delay para evitar conflitos
        setTimeout(() => {
          toast.error('Erro ao carregar projetos. Usando dados de demonstração.');
        }, 100);
        
        // Fallback para dados mock em caso de erro
        const mockProjects: Project[] = [
          {
            id: 1,
            name: "Reconstrução da Escola Primária de Nangade",
            slug: "reconstrucao-escola-nangade",
            description: "Projeto completo de reconstrução da escola primária com novas salas de aula, biblioteca e laboratório.",
            short_description: "Reconstrução completa da escola primária beneficiando 300+ crianças.",
            program: { id: 1, name: "Educação" },
            status: "active",
            priority: "high",
            progress_percentage: 75,
            manager: { id: 1, username: "admin", full_name: "Administrador" },
            location: "Nangade, Cabo Delgado",
            start_date: "2025-01-15",
            end_date: "2025-08-30",
            target_beneficiaries: 300,
            current_beneficiaries: 200,
            target_budget: 50000,
            current_spending: 37500,
            featured_image: "/projects/escola-nangade.jpg",
            is_featured: true,
            is_public: true,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-08-01T00:00:00Z"
          },
          {
            id: 2,
            name: "Distribuição de Cestas Básicas",
            slug: "distribuicao-cestas-basicas",
            description: "Programa contínuo de distribuição de cestas básicas para famílias em vulnerabilidade social.",
            short_description: "Apoio alimentar mensal para 150 famílias deslocadas.",
            program: { id: 2, name: "Apoio Humanitário" },
            status: "active",
            priority: "urgent",
            progress_percentage: 40,
            manager: { id: 2, username: "coordinator", full_name: "Coordenador" },
            location: "Mocímboa da Praia",
            start_date: "2025-02-01",
            target_beneficiaries: 150,
            current_beneficiaries: 60,
            target_budget: 25000,
            current_spending: 10000,
            is_featured: false,
            is_public: true,
            created_at: "2025-01-15T00:00:00Z",
            updated_at: "2025-08-01T00:00:00Z"
          },
          {
            id: 3,
            name: "Formação Profissional em Marcenaria",
            slug: "formacao-marcenaria",
            description: "Curso de capacitação profissional em marcenaria para jovens da comunidade.",
            short_description: "Capacitação profissional para 25 jovens.",
            program: { id: 3, name: "Formação Juvenil" },
            status: "completed",
            priority: "medium",
            progress_percentage: 100,
            manager: { id: 1, username: "admin", full_name: "Administrador" },
            location: "Cabo Delgado",
            start_date: "2025-03-01",
            end_date: "2025-07-31",
            target_beneficiaries: 25,
            current_beneficiaries: 25,
            target_budget: 15000,
            current_spending: 14500,
            is_featured: false,
            is_public: true,
            created_at: "2025-02-15T00:00:00Z",
            updated_at: "2025-07-31T00:00:00Z"
          }
        ];

        setProjects(mockProjects);
        
        // Calcular estatísticas do fallback
        setStats(calculateStats(mockProjects));
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

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
        return <AlertCircle className="h-4 w-4" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return 'Planejamento';
      case 'active':
        return 'Ativo';
      case 'completed':
        return 'Concluído';
      case 'suspended':
        return 'Suspenso';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Baixa';
      case 'medium':
        return 'Média';
      case 'high':
        return 'Alta';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  };

  const filteredProjects = projects.filter(project => {
    if (activeProjectTab === 'all') return true;
    if (activeProjectTab === 'active') return project.status === 'active';
    if (activeProjectTab === 'completed') return project.status === 'completed';
    if (activeProjectTab === 'featured') return project.is_featured;
    return true;
  });

  const handleDeleteProject = async (projectId: number) => {
    if (!isUserAuthenticated) {
      toast.error('Você precisa estar logado para excluir projetos.');
      return;
    }

    try {
      // Chamar API para deletar projeto
      await deleteProject(projectId);
      
      // Atualizar estado local após sucesso
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      // Recalcular estatísticas
      setStats(calculateStats(updatedProjects));
      
      toast.success('Projeto removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover projeto:', error);
      toast.error('Erro ao remover projeto. Tente novamente.');
    }
  };

  const openProjectDetail = (project: Project, view: 'updates' | 'analytics' | 'notifications' | 'tracker' | 'gallery' | 'metrics') => {
    setSelectedProject(project);
    setDetailView(view);
  };

  const closeProjectDetail = () => {
    setSelectedProject(null);
    setDetailView(null);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando projetos...</div>;
  }

  // Se há um projeto selecionado para visualização detalhada
  if (selectedProject && detailView) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button 
            onClick={closeProjectDetail}
            className="text-primary hover:underline"
          >
            ← Voltar para Gestão de Projetos
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{selectedProject.name}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">
            {detailView === 'updates' ? 'Atualizações' : 
             detailView === 'analytics' ? 'Análises' : 
             detailView === 'notifications' ? 'Notificações' :
             detailView === 'tracker' ? 'Rastreamento Completo' :
             detailView === 'gallery' ? 'Galeria de Imagens' :
             detailView === 'metrics' ? 'Métricas Detalhadas' : ''}
          </span>
        </div>

        {/* Conteúdo da visualização detalhada */}
        {detailView === 'updates' && (
          <ProjectUpdates 
            projectId={selectedProject.id} 
            projectName={selectedProject.name} 
          />
        )}
        
        {detailView === 'analytics' && (
          <ProjectAnalytics 
            projectId={selectedProject.id} 
            showComparison={true}
          />
        )}
        
        {detailView === 'notifications' && (
          <ProjectNotifications 
            projectId={selectedProject.id} 
            projectName={selectedProject.name} 
          />
        )}
        
        {detailView === 'tracker' && (
          <ProjectTracker 
            projectId={selectedProject.id.toString()} 
            projectTitle={selectedProject.slug} 
          />
        )}
        
        {detailView === 'gallery' && (
          <ProjectGalleryManager 
            projectId={selectedProject.id.toString()} 
            projectTitle={selectedProject.slug} 
          />
        )}
        
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_projects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active_projects} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_beneficiaries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              pessoas impactadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.total_budget / 1000).toFixed(0)}k MZN</div>
            <p className="text-xs text-muted-foreground">
              investimento total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_progress.toFixed(0)}%</div>
            <Progress value={stats.average_progress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Projetos</h2>
          <p className="text-muted-foreground">
            {isUserAuthenticated ? 'Gerencie todos os projetos da organização' : 'Visualização pública dos projetos'}
          </p>
        </div>
        {isUserAuthenticated && (
          <Button asChild>
            <Link to="/dashboard/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs de Filtro */}
      <Tabs value={activeProjectTab} onValueChange={setActiveProjectTab}>
        <TabsList>
          <TabsTrigger value="all">Todos ({projects.length})</TabsTrigger>
          <TabsTrigger value="active">Ativos ({stats.active_projects})</TabsTrigger>
          <TabsTrigger value="completed">Concluídos ({stats.completed_projects})</TabsTrigger>
          <TabsTrigger value="featured">Em Destaque ({projects.filter(p => p.is_featured).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeProjectTab} className="mt-6">
          {filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Beneficiários</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          <div className="font-medium truncate">{project.name}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {project.short_description}
                          </div>
                          {project.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              Destaque
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {project.program?.name || project.category?.name || 'Sem categoria'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={getStatusColor(project.status) as any} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(project.status)}
                          {getStatusLabel(project.status)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={getPriorityColor(project.priority) as any}>
                          {getPriorityLabel(project.priority)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{project.progress_percentage || 0}%</span>
                          </div>
                          <Progress value={project.progress_percentage || 0} className="w-20" />
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{project.current_beneficiaries || 0}</div>
                          <div className="text-muted-foreground">
                            de {project.target_beneficiaries}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-20">{project.location}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {project.manager?.full_name || project.manager?.username || 'Não definido'}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/dashboard/projects/view/${project.slug}`} title="Visualizar projeto">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {isUserAuthenticated && (
                            <>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/dashboard/projects/edit/${project.slug}`} title="Editar projeto">
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openProjectDetail(project, 'updates')}
                                title="Gerenciar atualizações"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openProjectDetail(project, 'analytics')}
                                title="Ver análises"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openProjectDetail(project, 'notifications')}
                                title="Configurar notificações"
                              >
                                <Bell className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openProjectDetail(project, 'tracker')}
                                title="Rastreamento completo"
                              >
                                <Target className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openProjectDetail(project, 'gallery')}
                                title="Gerenciar galeria"
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                                                      
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title="Remover projeto">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover Projeto</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover o projeto "{project.name}"? 
                                      Esta ação não pode ser desfeita e removerá:
                                      <ul className="list-disc list-inside mt-2 text-sm">
                                        <li>Todos os dados do projeto</li>
                                        <li>Imagens e documentos anexos</li>
                                        <li>Histórico e estatísticas</li>
                                      </ul>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteProject(project.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Remover Definitivamente
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {activeProjectTab === 'all' 
                    ? isUserAuthenticated 
                      ? 'Comece criando seu primeiro projeto.'
                      : 'Não há projetos públicos disponíveis no momento.'
                    : `Não há projetos ${activeProjectTab === 'active' ? 'ativos' : activeProjectTab === 'completed' ? 'concluídos' : 'em destaque'} no momento.`
                  }
                </p>
                {isUserAuthenticated && (
                  <Button asChild>
                    <Link to="/dashboard/projects/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;
