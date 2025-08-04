// src/components/clientArea/BeneficiaryDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  HandHeart, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Gift,
  FileText
} from 'lucide-react';
import { DashboardStats } from '@/types/clientArea';
import { fetchMatchingRequests } from '@/lib/clientAreaApi';
import { MatchingRequest } from '@/types/clientArea';

interface BeneficiaryDashboardProps {
  stats: DashboardStats | null;
}

const BeneficiaryDashboard: React.FC<BeneficiaryDashboardProps> = ({ stats }) => {
  const [matchingRequests, setMatchingRequests] = useState<MatchingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatchingRequests = async () => {
      try {
        const requests = await fetchMatchingRequests();
        setMatchingRequests(requests);
      } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatchingRequests();
  }, []);

  const beneficiaryStats = stats?.stats || {};

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'matched': return 'bg-purple-500';
      case 'open': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ajudas Recebidas</CardTitle>
            <HandHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaryStats.help_received || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total de ajudas recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Ativas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaryStats.active_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando atendimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voluntários Conectados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaryStats.volunteers_connected || 0}</div>
            <p className="text-xs text-muted-foreground">
              Voluntários que já ajudaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaryStats.success_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Solicitações atendidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso de Necessidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Progresso das Necessidades</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Alimentação</span>
                <span>75% atendido</span>
              </div>
              <Progress value={75} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Educação</span>
                <span>45% atendido</span>
              </div>
              <Progress value={45} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Saúde</span>
                <span>90% atendido</span>
              </div>
              <Progress value={90} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solicitações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Suas Solicitações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando solicitações...</p>
            ) : (
              <div className="space-y-3">
                {matchingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{request.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getUrgencyColor(request.urgency_level)}>
                          {request.urgency_level}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {request.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location || 'Localização não especificada'}
                      </span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {matchingRequests.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma solicitação encontrada.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Ações Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <HandHeart className="h-4 w-4 mr-2" />
              Nova Solicitação de Ajuda
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Ver Voluntários Disponíveis
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Atualizar Localização
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Documentação de Necessidades
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Ajudas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ajudas Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recent_activities?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">Concluído</Badge>
                  <p className="text-sm text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma ajuda recebida ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeneficiaryDashboard;
