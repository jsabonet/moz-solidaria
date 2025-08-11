// src/components/admin/VolunteerManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Star, 
  Clock, 
  Award, 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle,
  Edit,
  Calendar,
  TrendingUp,
  Target,
  UserCheck,
  UserX,
  Loader2,
  Trash2,
  Wrench
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface VolunteerStats {
  total_volunteers: number;
  active_opportunities: number;
  pending_applications: number;
  active_participations: number;
  completed_participations: number;
  total_hours_contributed: number;
  total_people_helped: number;
}

interface VolunteerProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  volunteer_level: string;
  total_hours_contributed: number;
  total_people_helped: number;
  average_rating: number;
  active_participations_count: number;
  completed_participations_count: number;
  skills: Array<{ id: number; name: string; category: string }>;
  is_active: boolean;
}

interface VolunteerOpportunity {
  id: number;
  title: string;
  description: string;
  location?: string;
  is_remote: boolean;
  estimated_hours: number;
  people_helped_estimate: number;
  urgency_level: string;
  status: string;
  applications_count: number;
  created_at: string;
}

const translateUrgency = (value: string) => {
  switch (value) {
    case 'low': return 'Baixa';
    case 'medium': return 'Média';
    case 'high': return 'Alta';
    case 'critical': return 'Crítica';
    default: return value;
  }
};

interface PendingApplication {
  id: number;
  volunteer_name: string;
  opportunity_title: string;
  application_message: string;
  created_at: string;
}

const VolunteerManagement: React.FC = () => {
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpportunityOpen, setCreateOpportunityOpen] = useState(false);
  const [evaluateModalOpen, setEvaluateModalOpen] = useState(false);
  const [selectedParticipation, setSelectedParticipation] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustVolunteer, setAdjustVolunteer] = useState<VolunteerProfile | null>(null);
  const [adjustData, setAdjustData] = useState({ added_hours: 0, added_people_helped: 0, admin_rating: 5, notes: '' });

  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    location: '',
    is_remote: false,
    estimated_hours: 0,
    people_helped_estimate: 1,
    urgency_level: 'medium'
  });
  const [editingOpportunity, setEditingOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [evaluation, setEvaluation] = useState({
    actual_hours: 0,
    people_helped: 0,
    admin_notes: '',
    admin_rating: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, volunteersRes, opportunitiesRes, applicationsRes] = await Promise.all([
        api.get('/volunteers/admin/stats/'),
        api.get('/volunteers/profiles/'),
        api.get('/volunteers/opportunities/'),
        api.get('/volunteers/admin/pending_applications/')
      ]);

      setStats(statsRes.data);
      setVolunteers(volunteersRes.data.results || volunteersRes.data || []);
      setOpportunities(opportunitiesRes.data.results || opportunitiesRes.data || []);
      setPendingApplications(applicationsRes.data.results || applicationsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de voluntários');
    } finally {
      setLoading(false);
    }
  };

  const openAdjustModal = (vol: VolunteerProfile) => {
    setAdjustVolunteer(vol);
    setAdjustData({ added_hours: 0, added_people_helped: 0, admin_rating: 5, notes: '' });
    setAdjustModalOpen(true);
  };

  const handleApplyAdjustment = async () => {
    if (!adjustVolunteer) return;
    try {
      await api.post(`/volunteers/profiles/${adjustVolunteer.id}/manual_adjust/`, adjustData);
      toast.success('Ajuste aplicado');
      setAdjustModalOpen(false);
      setAdjustVolunteer(null);
      loadData();
    } catch (error:any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Erro ao aplicar ajuste');
    }
  };

  const handleCreateOpportunity = async () => {
    try {
      await api.post('/volunteers/opportunities/', newOpportunity);
      toast.success('Oportunidade criada com sucesso!');
      setCreateOpportunityOpen(false);
      setNewOpportunity({
        title: '',
        description: '',
        location: '',
        is_remote: false,
        estimated_hours: 0,
        people_helped_estimate: 1,
        urgency_level: 'medium'
      });
      loadData();
    } catch (error) {
      toast.error('Erro ao criar oportunidade');
    }
  };

  const openEditOpportunity = (op: VolunteerOpportunity) => {
    setEditingOpportunity(op);
    setEditModalOpen(true);
  };

  const handleUpdateOpportunity = async () => {
    if (!editingOpportunity) return;
    try {
      await api.patch(`/volunteers/opportunities/${editingOpportunity.id}/`, {
        title: editingOpportunity.title,
        description: editingOpportunity.description,
        location: editingOpportunity.location,
        estimated_hours: editingOpportunity.estimated_hours,
        people_helped_estimate: editingOpportunity.people_helped_estimate,
        urgency_level: editingOpportunity.urgency_level,
        is_remote: editingOpportunity.is_remote,
        status: editingOpportunity.status,
      });
      toast.success('Oportunidade atualizada');
      setEditModalOpen(false);
      setEditingOpportunity(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar oportunidade');
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    try {
      await api.post(`/volunteers/participations/${applicationId}/accept_application/`);
      toast.success('Candidatura aceita!');
      loadData();
    } catch (error) {
      toast.error('Erro ao aceitar candidatura');
    }
  };

  const handleDeleteOpportunity = async (opportunityId: number) => {
    setDeletingId(opportunityId);
    try {
      await api.delete(`/volunteers/opportunities/${opportunityId}/`);
      toast.success('Oportunidade excluída');
      loadData();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir oportunidade');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    try {
      await api.post(`/volunteers/participations/${applicationId}/reject_application/`);
      toast.success('Candidatura rejeitada');
      loadData();
    } catch (error) {
      toast.error('Erro ao rejeitar candidatura');
    }
  };

  const handleCompleteParticipation = async () => {
    if (!selectedParticipation) return;

    try {
      await api.post(`/volunteers/participations/${selectedParticipation.id}/complete_participation/`, evaluation);
      toast.success('Participação avaliada com sucesso!');
      setEvaluateModalOpen(false);
      setSelectedParticipation(null);
      setEvaluation({
        actual_hours: 0,
        people_helped: 0,
        admin_notes: '',
        admin_rating: 5
      });
      loadData();
    } catch (error) {
      toast.error('Erro ao avaliar participação');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      default: return 'destructive';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Voluntários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_volunteers || 0}</div>
            <p className="text-xs text-muted-foreground">Voluntários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_opportunities || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando voluntários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Totais</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_hours_contributed || 0}h</div>
            <p className="text-xs text-muted-foreground">Contribuídas pelos voluntários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Ajudadas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_people_helped || 0}</div>
            <p className="text-xs text-muted-foreground">Beneficiários atendidos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="applications">
            Candidaturas Pendentes 
            {pendingApplications.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingApplications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="volunteers">Voluntários</TabsTrigger>
        </TabsList>

        {/* Oportunidades */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Gerenciar Oportunidades</h3>
            <Dialog open={createOpportunityOpen} onOpenChange={setCreateOpportunityOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Oportunidade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Oportunidade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Título</label>
                      <Input
                        value={newOpportunity.title}
                        onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                        placeholder="Ex: Ensino de informática"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Urgência</label>
                      <Select
                        value={newOpportunity.urgency_level}
                        onValueChange={(value) => setNewOpportunity({...newOpportunity, urgency_level: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={newOpportunity.description}
                      onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
                      placeholder="Descreva a oportunidade de voluntariado..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Horas Estimadas</label>
                      <Input
                        type="number"
                        value={newOpportunity.estimated_hours}
                        onChange={(e) => setNewOpportunity({...newOpportunity, estimated_hours: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Pessoas a Ajudar</label>
                      <Input
                        type="number"
                        value={newOpportunity.people_helped_estimate}
                        onChange={(e) => setNewOpportunity({...newOpportunity, people_helped_estimate: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Localização</label>
                      <Input
                        value={newOpportunity.location}
                        onChange={(e) => setNewOpportunity({...newOpportunity, location: e.target.value})}
                        placeholder="Ex: Maputo"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateOpportunityOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateOpportunity}>
                      Criar Oportunidade
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Urgência</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Candidatos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opportunity) => (
                    <TableRow key={opportunity.id}>
                      <TableCell className="font-medium">{opportunity.title}</TableCell>
                      <TableCell>{opportunity.is_remote ? 'Remoto' : opportunity.location}</TableCell>
                      <TableCell>
                        <Badge variant={getUrgencyColor(opportunity.urgency_level)}>
                          {translateUrgency(opportunity.urgency_level)}
                        </Badge>
                      </TableCell>
                      <TableCell>{opportunity.estimated_hours}h</TableCell>
                      <TableCell>{opportunity.applications_count}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(opportunity.status)}>
                          {opportunity.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openEditOpportunity(opportunity)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" disabled={deletingId === opportunity.id}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir oportunidade</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{opportunity.title}"? Esta ação não pode ser desfeita.
                                  {opportunity.applications_count > 0 && (
                                    <span className="block mt-2 text-red-600 font-medium">
                                      Atenção: existem {opportunity.applications_count} candidatura(s) associada(s).
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOpportunity(opportunity.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deletingId === opportunity.id ? 'Excluindo...' : 'Confirmar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidaturas Pendentes */}
        <TabsContent value="applications" className="space-y-4">
          <h3 className="text-lg font-medium">Candidaturas Pendentes</h3>
          
          <div className="space-y-4">
            {pendingApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="font-medium">{application.volunteer_name}</h4>
                      <p className="text-sm text-muted-foreground">{application.opportunity_title}</p>
                      {application.application_message && (
                        <p className="text-sm bg-muted p-2 rounded">{application.application_message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Candidatura enviada em {new Date(application.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptApplication(application.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectApplication(application.id)}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {pendingApplications.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhuma candidatura pendente no momento.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Voluntários */}
        <TabsContent value="volunteers" className="space-y-4">
          <h3 className="text-lg font-medium">Voluntários Registrados</h3>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Pessoas Ajudadas</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Participações</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.map((volunteer) => (
                    <TableRow key={volunteer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{volunteer.user.full_name || volunteer.user.username}</p>
                          <p className="text-sm text-muted-foreground">{volunteer.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{volunteer.volunteer_level}</Badge>
                      </TableCell>
                      <TableCell>{volunteer.total_hours_contributed}h</TableCell>
                      <TableCell>{volunteer.total_people_helped}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {volunteer.average_rating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Ativas: {volunteer.active_participations_count}</p>
                          <p>Concluídas: {volunteer.completed_participations_count}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={volunteer.is_active ? 'default' : 'secondary'}>
                          {volunteer.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openAdjustModal(volunteer)}>
                          <Wrench className="h-4 w-4 mr-1" /> Ajustar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Avaliação */}
      <Dialog open={evaluateModalOpen} onOpenChange={setEvaluateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Participação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Horas Trabalhadas</label>
                <Input
                  type="number"
                  value={evaluation.actual_hours}
                  onChange={(e) => setEvaluation({...evaluation, actual_hours: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pessoas Ajudadas</label>
                <Input
                  type="number"
                  value={evaluation.people_helped}
                  onChange={(e) => setEvaluation({...evaluation, people_helped: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Avaliação (1-5)</label>
              <Select
                value={evaluation.admin_rating.toString()}
                onValueChange={(value) => setEvaluation({...evaluation, admin_rating: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Insatisfatório</SelectItem>
                  <SelectItem value="2">2 - Abaixo do Esperado</SelectItem>
                  <SelectItem value="3">3 - Satisfatório</SelectItem>
                  <SelectItem value="4">4 - Bom</SelectItem>
                  <SelectItem value="5">5 - Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Notas Administrativas</label>
              <Textarea
                value={evaluation.admin_notes}
                onChange={(e) => setEvaluation({...evaluation, admin_notes: e.target.value})}
                placeholder="Comentários sobre o desempenho do voluntário..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEvaluateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCompleteParticipation}>
                Concluir e Avaliar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ajuste Manual */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajuste Manual de Métricas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {adjustVolunteer && (
              <div className="p-3 rounded bg-muted text-sm">
                Ajustando: <strong>{adjustVolunteer.user.full_name || adjustVolunteer.user.username}</strong><br/>
                Horas atuais: {adjustVolunteer.total_hours_contributed}h | Pessoas: {adjustVolunteer.total_people_helped} | Nível: {adjustVolunteer.volunteer_level}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Horas (+)</label>
                <Input
                  type="number"
                  value={adjustData.added_hours}
                  onChange={(e) => setAdjustData({...adjustData, added_hours: parseInt(e.target.value) || 0})}
                  min={0}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pessoas (+)</label>
                <Input
                  type="number"
                  value={adjustData.added_people_helped}
                  onChange={(e) => setAdjustData({...adjustData, added_people_helped: parseInt(e.target.value) || 0})}
                  min={0}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Avaliação</label>
                <Select
                  value={adjustData.admin_rating.toString()}
                  onValueChange={(v) => setAdjustData({...adjustData, admin_rating: parseInt(v)})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notas</label>
              <Textarea
                rows={3}
                value={adjustData.notes}
                onChange={(e) => setAdjustData({...adjustData, notes: e.target.value})}
                placeholder="Motivo / contexto do ajuste"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAdjustModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleApplyAdjustment}>Aplicar Ajuste</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Oportunidade */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Oportunidade</DialogTitle>
          </DialogHeader>
          {editingOpportunity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={editingOpportunity.title}
                    onChange={(e) => setEditingOpportunity({...editingOpportunity, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Urgência</label>
                  <Select
                    value={editingOpportunity.urgency_level}
                    onValueChange={(v) => setEditingOpportunity({...editingOpportunity, urgency_level: v})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  rows={4}
                  value={editingOpportunity.description}
                  onChange={(e) => setEditingOpportunity({...editingOpportunity, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium">Localização</label>
                  <Input
                    value={editingOpportunity.location || ''}
                    onChange={(e) => setEditingOpportunity({...editingOpportunity, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Horas</label>
                  <Input
                    type="number"
                    value={editingOpportunity.estimated_hours}
                    onChange={(e) => setEditingOpportunity({...editingOpportunity, estimated_hours: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pessoas</label>
                  <Input
                    type="number"
                    value={editingOpportunity.people_helped_estimate}
                    onChange={(e) => setEditingOpportunity({...editingOpportunity, people_helped_estimate: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editingOpportunity.status}
                  onValueChange={(v) => setEditingOpportunity({...editingOpportunity, status: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberta</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleUpdateOpportunity}>Salvar Alterações</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerManagement;
