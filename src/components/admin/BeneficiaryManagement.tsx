// src/components/admin/BeneficiaryManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  FileText, 
  MessageCircle, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  UserCheck,
  RefreshCcw,
  MapPin,
  Calendar,
  Heart,
  GraduationCap,
  Home,
  Package,
  Plus,
  Edit,
  User
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { toast } from 'sonner';

interface BeneficiaryProfile {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  // Dados completos do usuário
  user_complete: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    date_joined: string;
    last_login: string | null;
  };
  // Perfil client_area se existir
  client_profile: {
    id: number;
    user_type: string;
    phone: string;
    address: string;
    description: string;
    avatar: string;
    date_of_birth: string | null;
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    profile_public: boolean;
    show_activity: boolean;
    created_at: string;
    updated_at: string;
  } | null;
  // Campos do usuário para acesso direto
  user_email: string;
  username: string;
  user_first_name: string;
  user_last_name: string;
  user_full_name: string;
  user_date_joined: string;
  user_last_login: string | null;
  user_is_active: boolean;
  // Dados do beneficiário
  full_name: string;
  date_of_birth: string;
  age: number;
  gender: string;
  phone_number: string;
  alternative_phone: string;
  province: string;
  district: string;
  administrative_post: string;
  locality: string;
  neighborhood: string;
  address_details: string;
  education_level: string;
  employment_status: string;
  monthly_income: number | null;
  family_status: string;
  family_members_count: number;
  children_count: number;
  elderly_count: number;
  disabled_count: number;
  is_displaced: boolean;
  displacement_reason: string;
  has_chronic_illness: boolean;
  chronic_illness_details: string;
  priority_needs: string;
  additional_information: string;
  vulnerability_score: number;
  is_verified: boolean;
  verification_date: string | null;
  created_at: string;
  updated_at: string;
}

interface SupportRequest {
  id: number;
  beneficiary: {
    id: number;
    full_name: string;
    district: string;
  };
  // Dados completos do beneficiário
  beneficiary_complete: BeneficiaryProfile;
  beneficiary_name: string;
  beneficiary_location: string;
  // Dados da solicitação
  request_type: string;
  title: string;
  description: string;
  urgency: string;
  status: string;
  estimated_beneficiaries: number;
  estimated_cost?: number;
  requested_date: string;
  needed_by_date?: string;
  // Dados do revisor
  reviewed_by?: {
    id: number;
    username: string;
  };
  reviewed_by_complete?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    date_joined: string;
    last_login: string | null;
  };
  reviewed_by_name?: string;
  reviewed_at?: string;
  // Dados do responsável
  assigned_to?: {
    id: number;
    username: string;
  };
  assigned_to_complete?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    date_joined: string;
    last_login: string | null;
  };
  assigned_to_name?: string;
  started_at?: string;
  completed_at?: string;
  actual_cost?: number;
  actual_beneficiaries?: number;
  // Campos calculados
  is_overdue: boolean;
  days_since_request: number;
  communications_count: number;
  admin_notes: string;
}

interface BeneficiaryStats {
  total_beneficiaries: number;
  verified_beneficiaries: number;
  pending_verification: number;
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  urgent_requests: number;
}

const BeneficiaryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BeneficiaryStats | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryProfile[]>([]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryProfile | null>(null);
  // Rejeição de solicitação
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadBeneficiaries(),
        loadRequests()
      ]);
    } catch (error) {
      toast.error('Erro ao carregar dados do sistema de beneficiários');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
  // Correção de rota: endpoints admin estão sob /beneficiaries/admin/
  const response = await api.get('/beneficiaries/admin/stats/');
      setStats(response.data);
    } catch (error) {
      // Error handled silently
    }
  };

  const loadBeneficiaries = async () => {
    try {
  const response = await api.get('/beneficiaries/admin/beneficiaries/');
      setBeneficiaries(response.data.results || response.data);
    } catch (error) {
      // Error handled silently
    }
  };

  const loadRequests = async () => {
    try {
  const response = await api.get('/beneficiaries/admin/support-requests/');
      setRequests(response.data.results || response.data);
    } catch (error) {
      // Error handled silently
    }
  };

  const handleVerifyBeneficiary = async (beneficiaryId: number) => {
    try {
  await api.patch(`/beneficiaries/admin/beneficiaries/${beneficiaryId}/verify/`);
      toast.success('Beneficiário verificado com sucesso');
      loadBeneficiaries();
      loadStats();
    } catch (error) {
      toast.error('Erro ao verificar beneficiário');
    }
  };

  const handleRequestAction = async (requestId: number, action: 'approve' | 'reject', notes?: string) => {
    try {
      const payload = notes ? { admin_notes: notes } : {};
      const response = await api.patch(`/beneficiaries/admin/support-requests/${requestId}/${action}/`, payload);
      toast.success(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso`);
      loadRequests();
      loadStats();
      setSelectedRequest(null);
      if (action === 'reject') {
        // limpar estado do diálogo de rejeição
        setRejectDialogOpen(false);
        setRejectRequestId(null);
        setRejectNotes('');
      }
    } catch (error: any) {
      // Mostrar erro mais específico
      let errorMessage = `Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} solicitação`;
      if (error.response?.data?.detail) {
        errorMessage += `: ${error.response.data.detail}`;
      } else if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`;
      } else if (error.response?.status) {
        errorMessage += ` (${error.response.status})`;
      }
      
      toast.error(errorMessage);
    }
  };

  const openRejectDialog = (requestId: number) => {
    setRejectRequestId(requestId);
    setRejectNotes('');
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!rejectNotes.trim()) {
      toast.error('Informe as notas administrativas para rejeição');
      return;
    }
    if (rejectRequestId) {
      handleRequestAction(rejectRequestId, 'reject', rejectNotes.trim());
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { label: 'Pendente', variant: 'secondary' as const },
      'em_analise': { label: 'Em Análise', variant: 'default' as const },
      'aprovada': { label: 'Aprovada', variant: 'default' as const },
      'em_andamento': { label: 'Em Andamento', variant: 'default' as const },
      'concluida': { label: 'Concluída', variant: 'default' as const },
      'rejeitada': { label: 'Rejeitada', variant: 'destructive' as const },
      'cancelada': { label: 'Cancelada', variant: 'outline' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      'baixa': { label: '🟢 Baixa', variant: 'outline' as const },
      'media': { label: '🟡 Média', variant: 'secondary' as const },
      'alta': { label: '🟠 Alta', variant: 'default' as const },
      'critica': { label: '🔴 Crítica', variant: 'destructive' as const }
    };
    
    const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || { label: urgency, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRequestTypeIcon = (type: string) => {
    const icons = {
      'alimentar': <Package className="w-4 h-4" />,
      'medico': <Heart className="w-4 h-4" />,
      'educacao': <GraduationCap className="w-4 h-4" />,
      'habitacao': <Home className="w-4 h-4" />,
      'emergencia': <AlertTriangle className="w-4 h-4" />,
      'outro': <FileText className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) {
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
      const matchesType = typeFilter === 'all' || request.request_type === typeFilter;
      return matchesStatus && matchesUrgency && matchesType;
    }
    
    const term = searchTerm.toLowerCase();
    const title = (request.title || '').toLowerCase();
    const beneficiaryName = (request.beneficiary?.full_name || '').toLowerCase();
    const matchesSearch = title.includes(term) || beneficiaryName.includes(term);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    const matchesType = typeFilter === 'all' || request.request_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando sistema de beneficiários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sistema de Beneficiários</h2>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Beneficiários
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Solicitações
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total de Beneficiários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_beneficiaries}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.verified_beneficiaries} verificados
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Total de Solicitações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_requests}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.pending_requests} pendentes
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Solicitações Aprovadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approved_requests}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Solicitações Urgentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.urgent_requests}</div>
                  <div className="text-xs text-red-600">Necessitam atenção</div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Solicitações Urgentes */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Urgentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {requests
                  .filter(r => r.urgency === 'critica' || r.urgency === 'alta')
                  .slice(0, 5)
                  .map(request => (
                    <div key={request.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {getRequestTypeIcon(request.request_type)}
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.beneficiary.full_name} - {request.beneficiary.district}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUrgencyBadge(request.urgency)}
                        <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beneficiaries Tab */}
        <TabsContent value="beneficiaries" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar beneficiários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Lista de Beneficiários</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead>Dados do Usuário</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Vulnerabilidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beneficiaries
                    .filter(b => {
                      if (!searchTerm) return true;
                      const term = searchTerm.toLowerCase();
                      const fullName = (b.full_name || '').toLowerCase();
                      const email = (b.user_email || '').toLowerCase();
                      const username = (b.username || '').toLowerCase();
                      return fullName.includes(term) || email.includes(term) || username.includes(term);
                    })
                    .map(beneficiary => (
                      <TableRow key={beneficiary.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{beneficiary.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {beneficiary.age} anos • {beneficiary.gender}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Tel: {beneficiary.phone_number}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{beneficiary.user_email}</p>
                            <p className="text-sm text-muted-foreground">
                              @{beneficiary.username}
                            </p>
                            {beneficiary.user_first_name && (
                              <p className="text-xs text-muted-foreground">
                                {beneficiary.user_full_name}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant={beneficiary.user_is_active ? 'default' : 'secondary'} className="text-xs">
                                {beneficiary.user_is_active ? 'Ativo' : 'Inativo'}
                              </Badge>
                              {beneficiary.user_complete.is_staff && (
                                <Badge variant="outline" className="text-xs">Staff</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <div>
                              <p className="text-sm">{beneficiary.district}</p>
                              <p className="text-xs text-muted-foreground">
                                {beneficiary.administrative_post}, {beneficiary.locality}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={beneficiary.vulnerability_score >= 7 ? 'destructive' : 
                                       beneficiary.vulnerability_score >= 4 ? 'default' : 'outline'}>
                            Score: {beneficiary.vulnerability_score}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {beneficiary.is_verified ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!beneficiary.is_verified && (
                              <Button 
                                size="sm" 
                                onClick={() => handleVerifyBeneficiary(beneficiary.id)}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Verificar
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => setSelectedBeneficiary(beneficiary)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar solicitações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Apoio</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitação</TableHead>
                    <TableHead>Beneficiário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Urgência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {request.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.beneficiary.full_name}</p>
                          <p className="text-sm text-muted-foreground">{request.beneficiary.district}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRequestTypeIcon(request.request_type)}
                          <span className="capitalize">{request.request_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.requested_date).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {request.status === 'pendente' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleRequestAction(request.id, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => openRejectDialog(request.id)}
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Request Details Dialog - Dados Completos do Beneficiário */}
      {selectedRequest && (
        <AlertDialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg">
                {getRequestTypeIcon(selectedRequest.request_type)}
                {selectedRequest.title}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 text-left">
                  
                  {/* Dados Completos do Beneficiário */}
                  {selectedRequest.beneficiary_complete && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Dados Completos do Beneficiário
                      </h3>
                      
                      {/* Informações Pessoais */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Nome Completo</Label>
                          <p className="font-medium">{selectedRequest.beneficiary_complete.full_name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Data de Nascimento</Label>
                          <p>{new Date(selectedRequest.beneficiary_complete.date_of_birth).toLocaleDateString('pt-BR')} ({selectedRequest.beneficiary_complete.age} anos)</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Sexo</Label>
                          <p className="capitalize">{selectedRequest.beneficiary_complete.gender}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Telefone Principal</Label>
                          <p>{selectedRequest.beneficiary_complete.phone_number}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Telefone Alternativo</Label>
                          <p>{selectedRequest.beneficiary_complete.alternative_phone || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Email</Label>
                          <p>{selectedRequest.beneficiary_complete.user_email}</p>
                        </div>
                      </div>

                      {/* Localização/Moradia */}
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Localização e Moradia
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Província</Label>
                            <p>{selectedRequest.beneficiary_complete.province}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Distrito</Label>
                            <p>{selectedRequest.beneficiary_complete.district}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Posto Administrativo</Label>
                            <p>{selectedRequest.beneficiary_complete.administrative_post}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Localidade</Label>
                            <p>{selectedRequest.beneficiary_complete.locality}</p>
                          </div>
                          {selectedRequest.beneficiary_complete.neighborhood && (
                            <div>
                              <Label className="text-xs font-medium text-gray-600">Bairro</Label>
                              <p>{selectedRequest.beneficiary_complete.neighborhood}</p>
                            </div>
                          )}
                          {selectedRequest.beneficiary_complete.address_details && (
                            <div className="md:col-span-2">
                              <Label className="text-xs font-medium text-gray-600">Detalhes do Endereço</Label>
                              <p>{selectedRequest.beneficiary_complete.address_details}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Informações sobre a Família */}
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Informações sobre a Família
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Total de Membros</Label>
                            <p className="font-medium">{selectedRequest.beneficiary_complete.family_members_count} pessoas</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Crianças</Label>
                            <p>{selectedRequest.beneficiary_complete.children_count}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Idosos</Label>
                            <p>{selectedRequest.beneficiary_complete.elderly_count}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Pessoas com Deficiência</Label>
                            <p>{selectedRequest.beneficiary_complete.disabled_count}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Estado Civil</Label>
                            <p className="capitalize">{selectedRequest.beneficiary_complete.family_status}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Situação de Emprego</Label>
                            <p className="capitalize">{selectedRequest.beneficiary_complete.employment_status}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Educação</Label>
                            <p className="capitalize">{selectedRequest.beneficiary_complete.education_level}</p>
                          </div>
                          {selectedRequest.beneficiary_complete.monthly_income && (
                            <div>
                              <Label className="text-xs font-medium text-gray-600">Renda Mensal</Label>
                              <p>{selectedRequest.beneficiary_complete.monthly_income.toLocaleString('pt-BR')} MZN</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vulnerabilidades e Situações Especiais */}
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Vulnerabilidades e Situações Especiais
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Score de Vulnerabilidade</Label>
                            <div className="flex items-center gap-2">
                              <Badge variant={selectedRequest.beneficiary_complete.vulnerability_score >= 7 ? 'destructive' : 
                                           selectedRequest.beneficiary_complete.vulnerability_score >= 4 ? 'default' : 'outline'}>
                                {selectedRequest.beneficiary_complete.vulnerability_score}/10
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Pessoa Deslocada</Label>
                            <p>{selectedRequest.beneficiary_complete.is_displaced ? 'Sim' : 'Não'}</p>
                            {selectedRequest.beneficiary_complete.is_displaced && selectedRequest.beneficiary_complete.displacement_reason && (
                              <p className="text-xs text-gray-500 mt-1">Motivo: {selectedRequest.beneficiary_complete.displacement_reason}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Doença Crónica</Label>
                            <p>{selectedRequest.beneficiary_complete.has_chronic_illness ? 'Sim' : 'Não'}</p>
                            {selectedRequest.beneficiary_complete.has_chronic_illness && selectedRequest.beneficiary_complete.chronic_illness_details && (
                              <p className="text-xs text-gray-500 mt-1">Detalhes: {selectedRequest.beneficiary_complete.chronic_illness_details}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Necessidades Prioritárias */}
                      {selectedRequest.beneficiary_complete.priority_needs && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium text-gray-600">Necessidades Prioritárias</Label>
                          <p className="mt-1 text-sm bg-white p-2 rounded border">{selectedRequest.beneficiary_complete.priority_needs}</p>
                        </div>
                      )}

                      {/* Informações Adicionais */}
                      {selectedRequest.beneficiary_complete.additional_information && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Informações Adicionais</Label>
                          <p className="mt-1 text-sm bg-white p-2 rounded border">{selectedRequest.beneficiary_complete.additional_information}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detalhes da Solicitação */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Detalhes da Solicitação
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Tipo de Solicitação</Label>
                        <div className="flex items-center gap-2">
                          {getRequestTypeIcon(selectedRequest.request_type)}
                          <span className="capitalize">{selectedRequest.request_type}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Urgência</Label>
                        <div>{getUrgencyBadge(selectedRequest.urgency)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status Atual</Label>
                        <div>{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Data da Solicitação</Label>
                        <p>{new Date(selectedRequest.requested_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-600">Descrição da Solicitação</Label>
                      <p className="mt-1 bg-white p-3 rounded border">{selectedRequest.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Beneficiários Estimados</Label>
                        <p className="font-medium">{selectedRequest.estimated_beneficiaries} pessoas</p>
                      </div>
                      {selectedRequest.estimated_cost && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Custo Estimado</Label>
                          <p className="font-medium">{selectedRequest.estimated_cost.toLocaleString('pt-BR')} MZN</p>
                        </div>
                      )}
                    </div>

                    {selectedRequest.needed_by_date && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-gray-600">Necessário até</Label>
                        <p>{new Date(selectedRequest.needed_by_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>

                  {/* Notas Administrativas */}
                  {selectedRequest.admin_notes && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <Label className="text-sm font-medium text-gray-600">Notas Administrativas</Label>
                      <p className="mt-1">{selectedRequest.admin_notes}</p>
                    </div>
                  )}

                  {/* Informações de Processamento */}
                  {(selectedRequest.reviewed_by_name || selectedRequest.assigned_to_name) && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Informações de Processamento</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedRequest.reviewed_by_name && (
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Revisado por</Label>
                            <p>{selectedRequest.reviewed_by_name}</p>
                            {selectedRequest.reviewed_at && (
                              <p className="text-xs text-gray-500">
                                {new Date(selectedRequest.reviewed_at).toLocaleString('pt-BR')}
                              </p>
                            )}
                          </div>
                        )}
                        {selectedRequest.assigned_to_name && (
                          <div>
                            <Label className="text-xs font-medium text-gray-600">Responsável</Label>
                            <p>{selectedRequest.assigned_to_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
              {selectedRequest.status === 'pendente' && (
                <>
                  <AlertDialogAction 
                    onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Aprovar
                  </AlertDialogAction>
                  <AlertDialogAction 
                    onClick={() => openRejectDialog(selectedRequest.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Rejeitar
                  </AlertDialogAction>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialogo para Rejeição com Notas */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={(open) => { if(!open){ setRejectDialogOpen(false); setRejectRequestId(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Solicitação</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Forneça as notas administrativas justificando a rejeição. Campo obrigatório.</p>
              <div className="space-y-2">
                <Label htmlFor="reject_notes">Notas Administrativas</Label>
                <Textarea
                  id="reject_notes"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Descreva o motivo da rejeição..."
                  className="min-h-[120px]"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setRejectDialogOpen(false); setRejectRequestId(null); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-red-600 hover:bg-red-700">Confirmar Rejeição</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Beneficiary Details Dialog */}
      {selectedBeneficiary && (
        <AlertDialog open={!!selectedBeneficiary} onOpenChange={() => setSelectedBeneficiary(null)}>
          <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Detalhes do Beneficiário
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 text-left">
                  {/* Informações Pessoais */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Nome Completo</Label>
                        <p className="font-medium">{selectedBeneficiary.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Data de Nascimento</Label>
                        <p>{new Date(selectedBeneficiary.date_of_birth).toLocaleDateString('pt-BR')} ({selectedBeneficiary.age} anos)</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Sexo</Label>
                        <p className="capitalize">{selectedBeneficiary.gender}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Telefone</Label>
                        <p>{selectedBeneficiary.phone_number}</p>
                      </div>
                      {selectedBeneficiary.alternative_phone && (
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Telefone Alternativo</Label>
                          <p>{selectedBeneficiary.alternative_phone}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Email</Label>
                        <p>{selectedBeneficiary.user_email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Localização */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Localização
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Província</Label>
                        <p>{selectedBeneficiary.province}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Distrito</Label>
                        <p>{selectedBeneficiary.district}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Posto Administrativo</Label>
                        <p>{selectedBeneficiary.administrative_post}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Localidade</Label>
                        <p>{selectedBeneficiary.locality}</p>
                      </div>
                      {selectedBeneficiary.neighborhood && (
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Bairro</Label>
                          <p>{selectedBeneficiary.neighborhood}</p>
                        </div>
                      )}
                      {selectedBeneficiary.address_details && (
                        <div className="md:col-span-2">
                          <Label className="text-xs font-medium text-gray-600">Detalhes do Endereço</Label>
                          <p>{selectedBeneficiary.address_details}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Família */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Família
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Membros</Label>
                        <p className="font-medium">{selectedBeneficiary.family_members_count}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Crianças</Label>
                        <p>{selectedBeneficiary.children_count}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Idosos</Label>
                        <p>{selectedBeneficiary.elderly_count}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Deficiência</Label>
                        <p>{selectedBeneficiary.disabled_count}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Estado Civil</Label>
                        <p className="capitalize">{selectedBeneficiary.family_status}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Educação</Label>
                        <p className="capitalize">{selectedBeneficiary.education_level}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Emprego</Label>
                        <p className="capitalize">{selectedBeneficiary.employment_status}</p>
                      </div>
                      {selectedBeneficiary.monthly_income && (
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Renda Mensal</Label>
                          <p>{selectedBeneficiary.monthly_income.toLocaleString('pt-BR')} MZN</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vulnerabilidades */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Vulnerabilidades
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Score</Label>
                        <Badge variant={selectedBeneficiary.vulnerability_score >= 7 ? 'destructive' : selectedBeneficiary.vulnerability_score >= 4 ? 'default' : 'outline'}>
                          {selectedBeneficiary.vulnerability_score}/10
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Deslocado</Label>
                        <p>{selectedBeneficiary.is_displaced ? 'Sim' : 'Não'}</p>
                        {selectedBeneficiary.is_displaced && selectedBeneficiary.displacement_reason && (
                          <p className="text-xs text-gray-500 mt-1">Motivo: {selectedBeneficiary.displacement_reason}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Doença Crónica</Label>
                        <p>{selectedBeneficiary.has_chronic_illness ? 'Sim' : 'Não'}</p>
                        {selectedBeneficiary.has_chronic_illness && selectedBeneficiary.chronic_illness_details && (
                          <p className="text-xs text-gray-500 mt-1">Detalhes: {selectedBeneficiary.chronic_illness_details}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedBeneficiary.priority_needs && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Necessidades Prioritárias</Label>
                      <p className="mt-1 text-sm bg-white p-2 rounded border">{selectedBeneficiary.priority_needs}</p>
                    </div>
                  )}
                  {selectedBeneficiary.additional_information && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Informações Adicionais</Label>
                      <p className="mt-1 text-sm bg-white p-2 rounded border">{selectedBeneficiary.additional_information}</p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default BeneficiaryManagement;
