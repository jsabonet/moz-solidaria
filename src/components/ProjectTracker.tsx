// src/components/ProjectTracker.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { 
  useProjectDataStore, 
  type ProjectMetrics, 
  type ProjectUpdate, 
  type ProjectMilestone,
  type ProjectEvidence,
  type ProjectGalleryImage 
} from '@/components/ProjectDataBridgeNew';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Calendar as CalendarIcon,
  Upload,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Camera,
  FileText,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Download,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectTrackerProps {
  projectId: string;
  projectTitle: string;
  onMetricsUpdate?: (metrics: ProjectMetrics) => void;
}

const ProjectTracker: React.FC<ProjectTrackerProps> = ({ 
  projectId, 
  projectTitle, 
  onMetricsUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [localLoading, setLocalLoading] = useState(true);
  
  // Use the real data store
  const {
    fetchProjectData,
    updateProjectMetrics,
    addProjectUpdate,
    addProjectMilestone,
    addProjectEvidence,
    deleteProjectEvidence,
    projects,
    loading,
    errors
  } = useProjectDataStore();

  // Get current project data
  const projectData = projects.get(projectTitle || projectId || '');
  const metrics = projectData?.metrics;
  const updates = projectData?.updates || [];
  const milestones = projectData?.milestones || [];
  const evidence = projectData?.evidence || [];
  const gallery_images = projectData?.gallery_images || [];
  const isLoading = loading.has(projectTitle || projectId || '');

  // Calcular métricas derivadas dos updates para complementar as métricas base
  const derivedMetrics = React.useMemo(() => {
    const publishedUpdates = updates.filter(u => u.status === 'published');
    const totalPeopleFromUpdates = publishedUpdates.reduce((sum, update) => 
      sum + (update.people_impacted || 0), 0);
    const totalBudgetFromUpdates = publishedUpdates.reduce((sum, update) => 
      sum + (parseFloat(update.budget_spent || '0') || 0), 0);
    
    return {
      totalPeopleFromUpdates,
      totalBudgetFromUpdates,
      totalUpdates: publishedUpdates.length,
      recentUpdates: publishedUpdates.slice(0, 5),
      achievementUpdates: publishedUpdates.filter(u => u.type === 'achievement').length,
      issueUpdates: publishedUpdates.filter(u => u.type === 'issue').length
    };
  }, [updates]);

  // Load project data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalLoading(true);
        // Tentar carregar pelos diferentes IDs disponíveis
        await fetchProjectData(projectTitle || projectId || '');
      } catch (error) {
        toast.error('Erro ao carregar dados do projeto');
      } finally {
        setLocalLoading(false);
      }
    };

    if (projectTitle || projectId) {
      loadData();
    }
  }, [projectId, projectTitle, fetchProjectData]);

  // State para dialogs
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);

  // Form states
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    type: 'progress' as ProjectUpdate['type'],
    people_impacted: '',
    budget_spent: '',
    progress_percentage: ''
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'pending' as ProjectMilestone['status']
  });

  const [evidenceForm, setEvidenceForm] = useState({
    title: '',
    description: '',
    type: 'document' as ProjectEvidence['type'],
    category: '',
    files: [] as File[]
  });

  const handleMetricsUpdate = async (field: string, value: number) => {
    if (!metrics) {
      toast.error('Métricas não carregadas');
      return;
    }

    try {
      const updates = { [field]: value };
      await updateProjectMetrics(projectTitle || projectId || '', updates);
      
      // Recarregar dados após atualização
      await fetchProjectData(projectTitle || projectId || '', true);
      toast.success('Métricas atualizadas com sucesso!');
      
      // Notificar componente pai se fornecido
      if (onMetricsUpdate && projectData?.metrics) {
        onMetricsUpdate(projectData.metrics);
      }
    } catch (error) {
      toast.error('Erro ao atualizar métricas');
    }
  };

  // Funções para abrir dialogs de edição
  const openUpdateDialog = (update?: ProjectUpdate) => {
    if (update) {
      setEditingUpdate(update);
      setUpdateForm({
        title: update.title,
        description: update.description,
        type: update.type,
        people_impacted: update.people_impacted?.toString() || '',
        budget_spent: update.budget_spent || '',
        progress_percentage: update.progress_percentage?.toString() || ''
      });
    } else {
      setEditingUpdate(null);
      setUpdateForm({
        title: '',
        description: '',
        type: 'progress',
        people_impacted: '',
        budget_spent: '',
        progress_percentage: ''
      });
    }
    setShowUpdateDialog(true);
  };

  const openMilestoneDialog = (milestone?: ProjectMilestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setMilestoneForm({
        title: milestone.title,
        description: milestone.description,
        target_date: milestone.target_date,
        status: milestone.status
      });
    } else {
      setEditingMilestone(null);
      setMilestoneForm({
        title: '',
        description: '',
        target_date: '',
        status: 'pending'
      });
    }
    setShowMilestoneDialog(true);
  };

  // Função para calcular status do projeto baseado nas métricas
  const getProjectStatus = () => {
    if (!metrics) return { status: 'unknown', color: 'gray', label: 'Desconhecido' };
    
    const progress = Number(metrics.progress_percentage || 0);
    const isCompleted = progress >= 100;
    const isDelayed = metrics.end_date && new Date() > new Date(metrics.end_date) && !isCompleted;
    
    if (isCompleted) {
      return { status: 'completed', color: 'green', label: 'Concluído' };
    } else if (isDelayed) {
      return { status: 'delayed', color: 'red', label: 'Atrasado' };
    } else if (progress > 0) {
      return { status: 'in-progress', color: 'blue', label: 'Em Progresso' };
    } else {
      return { status: 'not-started', color: 'gray', label: 'Não Iniciado' };
    }
  };

  const projectStatus = getProjectStatus();

  const handleAddUpdate = async () => {
    if (!updateForm.title || !updateForm.description) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    try {
      if (editingUpdate) {
        // TODO: Implementar função de atualização de update no store
        // await updateProjectUpdate(projectTitle || projectId || '', editingUpdate.id, {
        //   title: updateForm.title,
        //   description: updateForm.description,
        //   type: updateForm.type,
        //   people_impacted: updateForm.people_impacted ? parseInt(updateForm.people_impacted) : undefined,
        //   budget_spent: updateForm.budget_spent,
        //   progress_percentage: updateForm.progress_percentage ? parseInt(updateForm.progress_percentage) : undefined,
        // });
        toast.info('Funcionalidade de edição será implementada em breve');
        setShowUpdateDialog(false);
        return;
      } else {
        await addProjectUpdate(projectTitle || projectId || '', {
          title: updateForm.title,
          description: updateForm.description,
          type: updateForm.type,
          people_impacted: updateForm.people_impacted ? parseInt(updateForm.people_impacted) : undefined,
          budget_spent: updateForm.budget_spent,
          progress_percentage: updateForm.progress_percentage ? parseInt(updateForm.progress_percentage) : undefined,
          status: 'published'
        });
      }

      setUpdateForm({
        title: '',
        description: '',
        type: 'progress',
        people_impacted: '',
        budget_spent: '',
        progress_percentage: ''
      });
      setEditingUpdate(null);
      setShowUpdateDialog(false);
      toast.success(editingUpdate ? 'Atualização editada com sucesso!' : 'Atualização adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar atualização');
    }
  };

  const handleAddMilestone = async () => {
    if (!milestoneForm.title || !milestoneForm.description || !milestoneForm.target_date) {
      toast.error('Título, descrição e data alvo são obrigatórios');
      return;
    }

    try {
      if (editingMilestone) {
        // TODO: Implementar função de atualização de milestone no store
        // await updateProjectMilestone(projectTitle || projectId || '', editingMilestone.id, {
        //   title: milestoneForm.title,
        //   description: milestoneForm.description,
        //   target_date: milestoneForm.target_date,
        //   status: milestoneForm.status,
        // });
        toast.info('Funcionalidade de edição será implementada em breve');
        setShowMilestoneDialog(false);
        return;
      } else {
        await addProjectMilestone(projectTitle || projectId || '', {
          title: milestoneForm.title,
          description: milestoneForm.description,
          target_date: milestoneForm.target_date,
          status: milestoneForm.status,
          progress: 0,
          order: 0,
          dependencies: []
        });
      }

      setMilestoneForm({
        title: '',
        description: '',
        target_date: '',
        status: 'pending'
      });
      setEditingMilestone(null);
      setShowMilestoneDialog(false);
      toast.success(editingMilestone ? 'Marco editado com sucesso!' : 'Marco adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar marco');
    }
  };

  const handleAddEvidence = async () => {
    if (!evidenceForm.title || !evidenceForm.description || evidenceForm.files.length === 0) {
      toast.error('Título, descrição e pelo menos um arquivo são obrigatórios');
      return;
    }

    try {
      const uploadPromises = evidenceForm.files.map(async (file, index) => {
        const formData = new FormData();
        
        // Para múltiplos arquivos, adicionar índice no título se houver mais de um
        const fileTitle = evidenceForm.files.length > 1 
          ? `${evidenceForm.title} - Arquivo ${index + 1}`
          : evidenceForm.title;
        
        formData.append('title', fileTitle);
        formData.append('description', evidenceForm.description);
        
        // Detectar tipo automaticamente baseado no arquivo
        const detectedType = file.type.startsWith('image/') ? 'image' : 'document';
        formData.append('type', detectedType);
        formData.append('category', evidenceForm.category);
        formData.append('file', file);

        return addProjectEvidence(projectTitle || projectId || '', formData);
      });

      await Promise.all(uploadPromises);

      setEvidenceForm({
        title: '',
        description: '',
        type: 'document',
        category: '',
        files: []
      });
      setShowEvidenceDialog(false);
      toast.success(`${evidenceForm.files.length} evidência(s) adicionada(s) com sucesso!`);
    } catch (error) {
      toast.error('Erro ao adicionar evidências');
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    if (confirm('Tem certeza que deseja excluir esta evidência?')) {
      try {
        const success = await deleteProjectEvidence(projectTitle || projectId || '', evidenceId);
        if (success) {
          toast.success('Evidência excluída com sucesso!');
        } else {
          toast.error('Erro ao excluir evidência');
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          toast.warning('Evidência já foi excluída anteriormente');
        } else {
          toast.error('Erro ao excluir evidência');
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in-progress': return 'Em Progresso';
      case 'delayed': return 'Atrasado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'progress': return <TrendingUp className="h-4 w-4" />;
      case 'issue': return <AlertCircle className="h-4 w-4" />;
      case 'achievement': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">Acompanhamento: {projectTitle}</h2>
            <Badge 
              variant="outline" 
              className={`bg-${projectStatus.color}-50 border-${projectStatus.color}-200 text-${projectStatus.color}-700`}
            >
              {projectStatus.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">Gestão completa do progresso e documentação</p>
          {metrics?.last_updated && (
            <p className="text-xs text-muted-foreground mt-1">
              Última atualização: {format(new Date(metrics.last_updated), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => openUpdateDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Atualização
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingUpdate ? 'Editar Atualização do Projeto' : 'Adicionar Atualização do Projeto'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Construção de poço finalizada"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o progresso, conquistas ou problemas..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Atualização</Label>
                  <Select 
                    value={updateForm.type} 
                    onValueChange={(value: ProjectUpdate['type']) => 
                      setUpdateForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milestone">Marco/Objetivo</SelectItem>
                      <SelectItem value="progress">Progresso</SelectItem>
                      <SelectItem value="achievement">Conquista</SelectItem>
                      <SelectItem value="issue">Problema/Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="peopleImpacted">Pessoas Impactadas</Label>
                    <Input
                      id="peopleImpacted"
                      type="number"
                      value={updateForm.people_impacted}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, people_impacted: e.target.value }))}
                      placeholder="Ex: 150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetSpent">Orçamento Gasto (MZN)</Label>
                    <Input
                      id="budgetSpent"
                      type="number"
                      value={updateForm.budget_spent}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, budget_spent: e.target.value }))}
                      placeholder="Ex: 15000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="progressPercentage">Progresso (%)</Label>
                    <Input
                      id="progressPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={updateForm.progress_percentage}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, progress_percentage: e.target.value }))}
                      placeholder="Ex: 75"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddUpdate}>
                    {editingUpdate ? 'Salvar Alterações' : 'Adicionar Atualização'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Impactadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.people_impacted || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              pessoas beneficiadas diretamente
            </p>
            {derivedMetrics.totalPeopleFromUpdates > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                +{derivedMetrics.totalPeopleFromUpdates.toLocaleString()} registradas em atualizações
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Utilizado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.budget_total && parseFloat(metrics.budget_total) > 0 ? 
                ((parseFloat(metrics.budget_used || '0') / parseFloat(metrics.budget_total)) * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              {parseFloat(metrics?.budget_used || '0').toLocaleString()} MZN de {parseFloat(metrics?.budget_total || '0').toLocaleString()} MZN
            </p>
            {derivedMetrics.totalBudgetFromUpdates > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                {derivedMetrics.totalBudgetFromUpdates.toLocaleString()} MZN em atualizações
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(metrics?.progress_percentage || 0)}%</div>
            <Progress value={Number(metrics?.progress_percentage || 0)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {derivedMetrics.totalUpdates} atualizações publicadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marcos Concluídos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.completed_milestones || 0}/{metrics?.total_milestones || 0}
            </div>
            <Progress 
              value={metrics?.total_milestones && Number(metrics.total_milestones) > 0 ? 
                (Number(metrics.completed_milestones) / Number(metrics.total_milestones)) * 100 : 0} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {derivedMetrics.achievementUpdates} conquistas registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="updates">Atualizações</TabsTrigger>
          <TabsTrigger value="milestones">Marcos</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Progresso do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Progresso Geral</span>
                      <span>{Number(metrics?.progress_percentage || 0)}%</span>
                    </div>
                    <Progress value={Number(metrics?.progress_percentage || 0)} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Orçamento Utilizado</span>
                      <span>
                        {metrics?.budget_total && parseFloat(metrics.budget_total) > 0 ? 
                          ((parseFloat(metrics.budget_used || '0') / parseFloat(metrics.budget_total)) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.budget_total && parseFloat(metrics.budget_total) > 0 ? 
                        (parseFloat(metrics.budget_used || '0') / parseFloat(metrics.budget_total)) * 100 : 0} 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Marcos Concluídos</span>
                      <span>{metrics?.completed_milestones || 0}/{metrics?.total_milestones || 0}</span>
                    </div>
                    <Progress 
                      value={metrics?.total_milestones && Number(metrics.total_milestones) > 0 ? 
                        (Number(metrics.completed_milestones) / Number(metrics.total_milestones)) * 100 : 0} 
                      className="mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total de Atualizações</span>
                    <span className="font-bold">{derivedMetrics.totalUpdates}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conquistas Registradas</span>
                    <span className="font-bold text-green-600">{derivedMetrics.achievementUpdates}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Problemas Reportados</span>
                    <span className="font-bold text-red-600">{derivedMetrics.issueUpdates}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Evidências Coletadas</span>
                    <span className="font-bold">{evidence.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Imagens na Galeria</span>
                    <span className="font-bold">{gallery_images.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline de Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics?.start_date && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Data de Início</span>
                    <span>{format(new Date(metrics.start_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                )}
                {metrics?.end_date && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Data Prevista de Conclusão</span>
                    <span>{format(new Date(metrics.end_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                )}
                {metrics?.actual_end_date && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Data Real de Conclusão</span>
                    <span className="text-green-600 font-medium">
                      {format(new Date(metrics.actual_end_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
                {metrics?.last_updated && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Última Atualização</span>
                    <span>{format(new Date(metrics.last_updated), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <div className="space-y-4">
            {updates.map((update) => (
              <Card key={update.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(update.type)}
                      <div>
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(update.created_at), 'dd/MM/yyyy', { locale: ptBR })} • {update.author_name || 'Sistema'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={update.type === 'milestone' ? 'default' : 'secondary'}>
                        {update.type === 'milestone' ? 'Marco' : 
                         update.type === 'achievement' ? 'Conquista' :
                         update.type === 'issue' ? 'Problema' : 'Progresso'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUpdateDialog(update)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{update.description}</p>
                  {(update.people_impacted || update.budget_spent || update.progress_percentage) && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                      {update.people_impacted && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            +{update.people_impacted}
                          </div>
                          <div className="text-xs text-muted-foreground">Pessoas impactadas</div>
                        </div>
                      )}
                      {update.budget_spent && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {parseFloat(update.budget_spent || '0').toLocaleString()} MZN
                          </div>
                          <div className="text-xs text-muted-foreground">Orçamento gasto</div>
                        </div>
                      )}
                      {update.progress_percentage && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {update.progress_percentage}%
                          </div>
                          <div className="text-xs text-muted-foreground">Progresso</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Marcos do Projeto</CardTitle>
                <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => openMilestoneDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Marco
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMilestone ? 'Editar Marco do Projeto' : 'Adicionar Marco do Projeto'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="milestone-title">Título do Marco</Label>
                        <Input
                          id="milestone-title"
                          value={milestoneForm.title}
                          onChange={(e) => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Construção de poço concluída"
                        />
                      </div>
                      <div>
                        <Label htmlFor="milestone-description">Descrição</Label>
                        <Textarea
                          id="milestone-description"
                          value={milestoneForm.description}
                          onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o que este marco representa..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="milestone-date">Data Alvo</Label>
                          <Input
                            id="milestone-date"
                            type="date"
                            value={milestoneForm.target_date}
                            onChange={(e) => setMilestoneForm(prev => ({ ...prev, target_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="milestone-status">Status</Label>
                          <Select 
                            value={milestoneForm.status} 
                            onValueChange={(value: ProjectMilestone['status']) => 
                              setMilestoneForm(prev => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="in-progress">Em Progresso</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="delayed">Atrasado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddMilestone}>
                          {editingMilestone ? 'Salvar Alterações' : 'Adicionar Marco'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum marco definido ainda</p>
                    <p className="text-sm">Adicione marcos para acompanhar o progresso do projeto</p>
                  </div>
                ) : (
                  milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(milestone.status)}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(milestone.status) + ' text-white'}>
                              {getStatusLabel(milestone.status)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openMilestoneDialog(milestone)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Prazo: {format(new Date(milestone.target_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          {milestone.completed_date && (
                            <span>Concluído: {format(new Date(milestone.completed_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          )}
                        </div>
                        <Progress 
                          value={milestone.status === 'completed' ? 100 : 
                                 milestone.status === 'in-progress' ? 50 : 
                                 milestone.status === 'delayed' ? 25 : 0} 
                          className="mt-2" 
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Evidências e Documentação</CardTitle>
                <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Evidência</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="evidence-title">Título</Label>
                        <Input
                          id="evidence-title"
                          value={evidenceForm.title}
                          onChange={(e) => setEvidenceForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Relatório de Progresso - Agosto 2025"
                        />
                      </div>
                      <div>
                        <Label htmlFor="evidence-description">Descrição</Label>
                        <Textarea
                          id="evidence-description"
                          value={evidenceForm.description}
                          onChange={(e) => setEvidenceForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o conteúdo e importância desta evidência..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="evidence-category">Categoria</Label>
                          <Input
                            id="evidence-category"
                            value={evidenceForm.category}
                            onChange={(e) => setEvidenceForm(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="Ex: Relatórios, Fotos, Contratos"
                          />
                        </div>
                        <div>
                          <Label htmlFor="evidence-count">Arquivos Selecionados</Label>
                          <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                            <span className="text-sm text-muted-foreground">
                              {evidenceForm.files.length} arquivo(s) selecionado(s)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="evidence-file">Arquivos (Múltipla Seleção)</Label>
                        <Input
                          id="evidence-file"
                          type="file"
                          multiple
                          onChange={(e) => {
                            const selectedFiles = Array.from(e.target.files || []);
                            
                            // Filtrar apenas imagens e PDFs
                            const validFiles = selectedFiles.filter(file => {
                              const isImage = file.type.startsWith('image/');
                              const isPDF = file.type === 'application/pdf';
                              return isImage || isPDF;
                            });

                            if (validFiles.length !== selectedFiles.length) {
                              toast.warning('Alguns arquivos foram ignorados. Apenas imagens e PDFs são aceitos.');
                            }

                            setEvidenceForm(prev => ({ 
                              ...prev, 
                              files: validFiles 
                            }));
                          }}
                          accept="image/*,.pdf"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Apenas imagens (JPG, PNG, GIF) e documentos PDF são aceitos. Selecione múltiplos arquivos mantendo Ctrl pressionado.
                        </p>
                        {evidenceForm.files.length > 0 && (
                          <div className="mt-2 p-2 border rounded-md bg-muted">
                            <p className="text-xs font-medium mb-1">Arquivos selecionados:</p>
                            <ul className="text-xs space-y-1">
                              {evidenceForm.files.map((file, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  {file.type.startsWith('image/') ? (
                                    <Camera className="h-3 w-3 text-blue-500" />
                                  ) : (
                                    <FileText className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-muted-foreground">
                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowEvidenceDialog(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleAddEvidence}
                          disabled={evidenceForm.files.length === 0}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar {evidenceForm.files.length} Evidência(s)
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {evidence.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma evidência adicionada ainda</p>
                  <p className="text-sm">Faça upload de documentos, fotos e relatórios</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evidence.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.type === 'image' ? <Camera className="h-4 w-4" /> : 
                           item.type === 'document' ? <FileText className="h-4 w-4" /> : 
                           item.type === 'video' ? <ImageIcon className="h-4 w-4" /> :
                           item.type === 'report' ? <FileText className="h-4 w-4" /> :
                           item.type === 'certificate' ? <FileText className="h-4 w-4" /> :
                           <FileText className="h-4 w-4" />}
                          <h4 className="font-medium text-sm">{item.title}</h4>
                        </div>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>{item.created_at ? format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(item.file, '_blank')}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = item.file;
                              link.download = item.title;
                              link.click();
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteEvidence(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Galeria de Imagens */}
              {gallery_images.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Galeria de Imagens</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery_images.slice(0, 8).map((image) => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={image.image}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        {image.featured && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            Destaque
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  {gallery_images.length > 8 && (
                    <Button variant="outline" className="mt-4 w-full">
                      Ver todas as {gallery_images.length} imagens
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectTracker;
