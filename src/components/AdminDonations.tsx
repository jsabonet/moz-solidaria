import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';

interface Donation {
  id: number;
  amount: string;
  donation_method: {
    id: number;
    name: string;
  } | null;
  status: string;
  donor_message: string;
  payment_proof?: string;
  created_at: string;
  updated_at: string;
  donor: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email?: string;
    is_active?: boolean;
  };
  admin_notes?: string;
}

interface DonationStats {
  total_donations: number;
  total_amount: string;
  pending_count: number;
  approved_count: number;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    actions: ['approve', 'reject', 'under_review']
  },
  submitted: {
    label: 'Submetida',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
    actions: ['approve', 'reject', 'under_review']
  },
  under_review: {
    label: 'Em Análise',
    color: 'bg-purple-100 text-purple-800',
    icon: AlertTriangle,
    actions: ['approve', 'reject']
  },
  approved: {
    label: 'Aprovada',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    actions: ['complete', 'reject']
  },
  rejected: {
    label: 'Rejeitada',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    actions: ['approve', 'under_review']
  },
  completed: {
    label: 'Completada',
    color: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle,
    actions: []
  }
};

const statusActions = {
  approve: { label: 'Aprovar', color: 'bg-green-600 hover:bg-green-700' },
  reject: { label: 'Rejeitar', color: 'bg-red-600 hover:bg-red-700' },
  under_review: { label: 'Em Análise', color: 'bg-purple-600 hover:bg-purple-700' },
  complete: { label: 'Completar', color: 'bg-emerald-600 hover:bg-emerald-700' }
};

// Mapping from action names to actual status values
const actionToStatus = {
  approve: 'approved',
  reject: 'rejected',
  under_review: 'under_review',
  complete: 'completed'
};

interface AdminDonationsProps {
  onViewDetails: (donation: Donation) => void;
}

const AdminDonations: React.FC<AdminDonationsProps> = ({ onViewDetails }) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Estatísticas agregadas diretamente do banco (paginando todas as doações)
  const [aggregateStats, setAggregateStats] = useState({
    totalDonations: 0,
    approvedCount: 0,
    pendingCount: 0,
    approvedAmount: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    method: ''
  });
  const [selectedDonations, setSelectedDonations] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [actionComment, setActionComment] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [rejectingDonation, setRejectingDonation] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Carrega lista filtrada (UI) e estatísticas básicas do endpoint quando filtros mudam
  useEffect(() => {
    if (user?.is_staff) {
      fetchDonations();
      fetchStats();
    }
  }, [user, filters]);

  // Carrega agregados completos (independente de filtros) apenas quando usuário vira staff ou após ações
  useEffect(() => {
    if (user?.is_staff) {
      fetchAllDonationsAggregate();
    }
  }, [user?.is_staff]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.method) params.append('method', filters.method);

      const response = await api.get(`/donations/?${params.toString()}`);
      setDonations(response.data.results || response.data);
    } catch (error: any) {
      console.error('Erro ao carregar doações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Busca todas as páginas de doações para calcular estatísticas reais (ignora filtros da UI)
  const fetchAllDonationsAggregate = async () => {
    try {
      let nextUrl: string | null = '/donations/';
      let totalDonations = 0;
      let approvedCount = 0; // approved + completed
      let pendingCount = 0;  // pending + submitted + under_review
      let approvedAmount = 0;
      const safetyPageLimit = 100; // limite de segurança
      let page = 0;

      while (nextUrl) {
        page++;
        if (page > safetyPageLimit) {
          console.warn('Limite de páginas atingido na agregação de doações.');
          break;
        }
        const { data } = await api.get(nextUrl);
        const results = data.results || data;
        if (!Array.isArray(results)) break;

        for (const d of results) {
          totalDonations++;
          const status = d.status;
          if (status === 'approved' || status === 'completed') {
            approvedCount++;
            const val = parseFloat(d.amount || '0');
            if (!isNaN(val)) approvedAmount += val;
          } else if (status === 'pending' || status === 'submitted' || status === 'under_review') {
            pendingCount++;
          }
        }
        nextUrl = data.next || null; // DRF 'next'
      }

      setAggregateStats({ totalDonations, approvedCount, pendingCount, approvedAmount });
    } catch (error) {
      console.error('Erro ao agregar estatísticas completas de doações:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/donations/statistics/');
      setStats(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleRejectDonation = async (donationId: number) => {
    try {
      setProcessingAction(true);
      
      const requestData = {
        status: 'rejected',
        admin_comment: 'Doação rejeitada pelo administrador'
      };
      
      await api.patch(`/donations/${donationId}/`, requestData);
  fetchDonations();
  fetchStats();
  fetchAllDonationsAggregate();
      
      alert('Doação rejeitada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao rejeitar doação:', error);
      
      if (error.response?.data?.detail) {
        alert(`Erro: ${error.response.data.detail}`);
      } else {
        alert('Erro ao rejeitar doação. Tente novamente.');
      }
    } finally {
      setProcessingAction(false);
    }
  };

  const handleStatusUpdate = async (donationId: number, newAction: string) => {
    // Se for rejeição, usar a função específica
    if (newAction === 'reject') {
      return handleRejectDonation(donationId);
    }
    
    try {
      setProcessingAction(true);
      
      // Convert action to actual status value
      const newStatus = actionToStatus[newAction as keyof typeof actionToStatus] || newAction;
      const statusInfo = statusConfig[newStatus as keyof typeof statusConfig];
      const defaultComment = statusInfo ? `Status alterado para ${statusInfo.label}` : `Status alterado para ${newStatus}`;
      
      const requestData: any = {
        status: newStatus,
        admin_comment: actionComment || defaultComment
      };
      
      console.log('🔍 Enviando PATCH request:', {
        url: `/donations/${donationId}/`,
        action: newAction,
        mappedStatus: newStatus,
        data: requestData
      });
      
      await api.patch(`/donations/${donationId}/`, requestData);
  fetchDonations();
  fetchStats();
  fetchAllDonationsAggregate();
      setActionComment('');
      
      alert(`Doação ${statusInfo?.label.toLowerCase() || 'atualizada'} com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      // Mostrar erro específico para o usuário
      if (error.response?.data?.rejection_reason) {
        alert(`Erro: ${error.response.data.rejection_reason[0]}`);
      } else if (error.response?.data?.detail) {
        alert(`Erro: ${error.response.data.detail}`);
      } else {
        alert('Erro ao atualizar status da doação. Tente novamente.');
      }
    } finally {
      setProcessingAction(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedDonations.length === 0) return;

    try {
      setProcessingAction(true);
      
      // Convert action to actual status value
      const newStatus = actionToStatus[bulkAction as keyof typeof actionToStatus] || bulkAction;
      
      // Se o status é 'rejected', é obrigatório fornecer rejection_reason
      if (newStatus === 'rejected') {
        if (!actionComment || actionComment.trim() === '') {
          alert('Por favor, forneça um motivo para a rejeição em massa.');
          setProcessingAction(false);
          return;
        }
      }
      
      const requestData: any = {
        donation_ids: selectedDonations,
        status: newStatus,
        admin_comment: actionComment || `Ação em massa: ${statusActions[bulkAction as keyof typeof statusActions].label}`
      };
      
      // Adicionar rejection_reason para rejeições
      if (newStatus === 'rejected') {
        requestData.rejection_reason = actionComment;
      }
      
      await api.post('/donations/bulk-update/', requestData);
      setSelectedDonations([]);
      setBulkAction('');
      setActionComment('');
  fetchDonations();
  fetchStats();
  fetchAllDonationsAggregate();
    } catch (error: any) {
      console.error('Erro na ação em massa:', error);
      
      // Mostrar erro específico para o usuário
      if (error.response?.data?.rejection_reason) {
        alert(`Erro: ${error.response.data.rejection_reason[0]}`);
      } else if (error.response?.data?.detail) {
        alert(`Erro: ${error.response.data.detail}`);
      } else {
        alert('Erro na ação em massa. Tente novamente.');
      }
    } finally {
      setProcessingAction(false);
    }
  };

  const toggleDonationSelection = (donationId: number) => {
    setSelectedDonations(prev => 
      prev.includes(donationId) 
        ? prev.filter(id => id !== donationId)
        : [...prev, donationId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} MZN`;
  };

  const getUserDisplayName = (user: any) => {
    // Para doações de convidados, verificar se é um usuário inativo
    if (!user.is_active && user.username.startsWith('guest_')) {
      return `${user.first_name} ${user.last_name}`.trim() || user.email || user.username;
    }
    
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user.username;
  };

  const isGuestDonation = (donation: Donation) => {
    return !donation.donor.is_active && donation.donor.username.startsWith('guest_');
  };

  if (!user?.is_staff) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Acesso negado. Apenas administradores podem ver esta página.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Arrecadado</p>
                  <p className="text-2xl font-bold">
                    {aggregateStats.approvedAmount > 0
                      ? formatAmount(String(aggregateStats.approvedAmount))
                      : stats?.total_amount
                        ? formatAmount(stats.total_amount)
                        : formatAmount('0')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {aggregateStats.approvedAmount > 0 ? 'Aprovadas / Completadas (agregado real)' : 'Fallback estatística API'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Doações</p>
                  <p className="text-2xl font-bold">{aggregateStats.totalDonations || stats?.total_donations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold">{aggregateStats.pendingCount || stats?.pending_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-2xl font-bold">{aggregateStats.approvedCount || stats?.approved_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                placeholder="Buscar por doador..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Button onClick={fetchDonations} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedDonations.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <span className="font-medium">
                {selectedDonations.length} selecionadas
              </span>
              <Select
                value={bulkAction}
                onValueChange={setBulkAction}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ação em massa" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusActions).map(([key, action]) => (
                    <SelectItem key={key} value={key}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={
                  bulkAction === 'reject' 
                    ? "Motivo da rejeição (obrigatório)" 
                    : "Comentário (opcional)"
                }
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                className={`flex-1 ${
                  bulkAction === 'reject' && !actionComment.trim() 
                    ? 'border-red-300 focus:border-red-500' 
                    : ''
                }`}
                required={bulkAction === 'reject'}
              />
              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction || processingAction}
                className={bulkAction ? statusActions[bulkAction as keyof typeof statusActions].color : ''}
              >
                {processingAction ? 'Processando...' : 'Aplicar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Donations List */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Doações</CardTitle>
          <CardDescription>
            Gerir e acompanhar todas as doações da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Nenhuma doação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => {
                const status = statusConfig[donation.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                const isSelected = selectedDonations.includes(donation.id);

                return (
                  <Card 
                    key={donation.id} 
                    className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDonationSelection(donation.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold">
                                {formatAmount(donation.amount)}
                              </h3>
                              <Badge className={status.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Doador:</span> 
                                <span>{getUserDisplayName(donation.donor)}</span>
                                {isGuestDonation(donation) && (
                                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                    Convidado
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <span className="font-medium">Método:</span> {donation.donation_method?.name || 'Não especificado'}
                              </div>
                              <div>
                                <span className="font-medium">Data:</span> {formatDate(donation.created_at)}
                              </div>
                            </div>

                            {donation.donor_message && (
                              <p className="text-gray-700 mb-4 line-clamp-2">
                                {donation.donor_message}
                              </p>
                            )}

                            {/* Informação especial para doações de convidados */}
                            {isGuestDonation(donation) && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center space-x-2 text-blue-800 text-sm">
                                  <span className="font-medium">💝 Doação de Convidado</span>
                                </div>
                                <p className="text-blue-700 text-xs mt-1">
                                  Esta doação foi enviada por um usuário não registrado. 
                                  Os dados pessoais estão nas notas administrativas.
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                {status.actions.map((action) => (
                                  <Button
                                    key={action}
                                    size="sm"
                                    onClick={() => handleStatusUpdate(donation.id, action)}
                                    disabled={processingAction}
                                    className={statusActions[action as keyof typeof statusActions].color}
                                  >
                                    {statusActions[action as keyof typeof statusActions].label}
                                  </Button>
                                ))}
                              </div>
                              
                              <div className="flex space-x-2">
                                {donation.payment_proof && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(donation.payment_proof, '_blank')}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onViewDetails(donation)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDonations;
