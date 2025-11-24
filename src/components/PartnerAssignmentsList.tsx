// src/components/PartnerAssignmentsList.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Assignment {
  id: number;
  partner_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  project_details: {
    id: number;
  // Backend recently changed to expose 'name' instead of 'title'. Keep both optional for compatibility.
  title?: string;
  name?: string;
    slug: string;
    status: string;
  };
  assigned_by_details: {
    username: string;
  };
  role: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  assignment_notes: string;
  response_notes?: string;
  start_date?: string;
  expected_end_date?: string;
  response_date?: string;
  created_at: string;
}

interface PartnerAssignmentsListProps {
  partnerId?: number;
  projectId?: number;
  status?: string;
  onAssignmentUpdate?: () => void;
  className?: string;
}

const PartnerAssignmentsList: React.FC<PartnerAssignmentsListProps> = ({
  partnerId,
  projectId,
  status,
  onAssignmentUpdate,
  className = ""
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [partnerId, projectId, status]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (partnerId) params.append('partner', partnerId.toString());
      if (projectId) params.append('project', projectId.toString());
      if (status) params.append('status', status);

      const res = await api.get(`/partnerships/assignments/?${params.toString()}`);
      setAssignments(res.data.results || res.data || []);
    } catch (error) {
      // Error handled silently - empty assignments list
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (assignmentId: number) => {
    setActionLoading(assignmentId);
    try {
      await api.post(`/partnerships/assignments/${assignmentId}/complete/`);
      await fetchAssignments();
      onAssignmentUpdate?.();
    } catch (error) {
      // Error handled silently - action not completed
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pendente' },
      accepted: { variant: 'default' as const, icon: CheckCircle, label: 'Aceito' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejeitado' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Concluído' },
      cancelled: { variant: 'outline' as const, icon: XCircle, label: 'Cancelado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      implementer: 'Implementador',
      supporter: 'Apoiador',
      advisor: 'Consultor',
      sponsor: 'Patrocinador'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando atribuições...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atribuições de Projetos
            {assignments.length > 0 && (
              <Badge variant="outline">{assignments.length}</Badge>
            )}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={fetchAssignments}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma atribuição encontrada para os critérios selecionados.
            </AlertDescription>
          </Alert>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{assignment.project_details.title || assignment.project_details.name || 'Projeto'}</span>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>
                      {assignment.partner_details.first_name || assignment.partner_details.username} 
                      ({assignment.partner_details.email})
                    </span>
                    <span>•</span>
                    <span>{getRoleLabel(assignment.role)}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>Criado {formatTimeAgo(assignment.created_at)}</div>
                  <div>por {assignment.assigned_by_details.username}</div>
                </div>
              </div>

              {/* Dates */}
              {(assignment.start_date || assignment.expected_end_date) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {assignment.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Início: {new Date(assignment.start_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {assignment.expected_end_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Prazo: {new Date(assignment.expected_end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {assignment.assignment_notes && (
                <div className="text-sm">
                  <span className="font-medium">Notas: </span>
                  <span className="text-muted-foreground">{assignment.assignment_notes}</span>
                </div>
              )}

              {/* Response */}
              {assignment.response_notes && (
                <div className="text-sm bg-muted/50 p-2 rounded">
                  <div className="flex items-center gap-1 font-medium mb-1">
                    <MessageSquare className="h-3 w-3" />
                    Resposta do parceiro:
                  </div>
                  <p className="text-muted-foreground">{assignment.response_notes}</p>
                  {assignment.response_date && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(assignment.response_date)}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {assignment.status === 'accepted' && (
                <div className="flex justify-end pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleMarkComplete(assignment.id)}
                    disabled={actionLoading === assignment.id}
                  >
                    {actionLoading === assignment.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Marcando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marcar como Concluído
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerAssignmentsList;
