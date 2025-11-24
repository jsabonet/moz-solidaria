// src/components/PartnerAssignmentNotifications.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  FileText,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingAssignment {
  id: number;
  project_details: {
    id: number;
  // Support both legacy 'title' and new 'name'
  title?: string;
  name?: string;
    slug: string;
    status: string;
  };
  assigned_by_details: {
    username: string;
    first_name: string;
    last_name: string;
  };
  role: string;
  assignment_notes: string;
  terms_and_conditions: string;
  start_date?: string;
  expected_end_date?: string;
  created_at: string;
}

interface PartnerAssignmentNotificationsProps {
  onAssignmentResponse?: () => void;
  className?: string;
}

const PartnerAssignmentNotifications: React.FC<PartnerAssignmentNotificationsProps> = ({
  onAssignmentResponse,
  className = ""
}) => {
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);
  const [responseNotes, setResponseNotes] = useState<{[key: number]: string}>({});
  const [responseError, setResponseError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingAssignments();
  }, []);

  const fetchPendingAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/partnerships/assignments/?status=pending');
      setPendingAssignments(res.data.results || res.data || []);
    } catch (error) {
      // Error handled silently - empty assignments list
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (assignmentId: number, response: 'accept' | 'reject') => {
    setResponding(assignmentId);
  setResponseError(null);
    try {
      const payload = {
        response,
        response_notes: responseNotes[assignmentId] || ''
      };
      
      await api.post(`/partnerships/assignments/${assignmentId}/respond/`, payload);
      
      // Remove from pending list
      setPendingAssignments(prev => prev.filter(a => a.id !== assignmentId));
      
      // Clear response notes
      setResponseNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[assignmentId];
        return newNotes;
      });
      
      onAssignmentResponse?.();
    } catch (error: any) {
      // Extrair mensagem detalhada do backend
      const detail = error?.response?.data;
      if (detail) {
        if (typeof detail === 'string') setResponseError(detail);
        else if (detail.non_field_errors) setResponseError(detail.non_field_errors.join(' '));
        else if (detail.error) setResponseError(detail.error);
        else if (detail.response) setResponseError(`Resposta inválida: ${detail.response}`);
        else if (typeof detail === 'object') setResponseError(JSON.stringify(detail));
        else setResponseError('Falha ao enviar resposta.');
      } else {
        setResponseError('Falha ao enviar resposta.');
      }
    } finally {
      setResponding(null);
    }
  };

  const updateResponseNotes = (assignmentId: number, notes: string) => {
    setResponseNotes(prev => ({
      ...prev,
      [assignmentId]: notes
    }));
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
            <span className="ml-2">Carregando notificações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingAssignments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Atribuições Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Você não tem novas atribuições de projetos pendentes.
            </AlertDescription>
          </Alert>
          {responseError && (
            <p className="text-xs text-red-600 mt-3 break-words">{responseError}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Atribuições Pendentes
          <Badge variant="destructive">{pendingAssignments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {pendingAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="border-2 border-orange-200 rounded-lg p-4 space-y-4 bg-orange-50/50"
          >
            {responseError && (
              <div className="text-xs text-red-600 -mt-2 mb-1 break-words">{responseError}</div>
            )}
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-lg">{assignment.project_details.title || assignment.project_details.name || 'Projeto'}</h3>
                  <Badge variant="outline">{assignment.project_details.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    Atribuído por {assignment.assigned_by_details.first_name || assignment.assigned_by_details.username}
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(assignment.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    Função: {getRoleLabel(assignment.role)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {(assignment.start_date || assignment.expected_end_date) && (
              <div className="bg-white/70 p-3 rounded border">
                <div className="flex items-center gap-1 text-sm font-medium mb-2">
                  <Calendar className="h-4 w-4" />
                  Cronograma
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {assignment.start_date && (
                    <div>
                      <span className="text-muted-foreground">Início:</span>
                      <div className="font-medium">
                        {new Date(assignment.start_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )}
                  {assignment.expected_end_date && (
                    <div>
                      <span className="text-muted-foreground">Prazo esperado:</span>
                      <div className="font-medium">
                        {new Date(assignment.expected_end_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assignment Notes */}
            {assignment.assignment_notes && (
              <div className="bg-white/70 p-3 rounded border">
                <div className="flex items-center gap-1 text-sm font-medium mb-2">
                  <FileText className="h-4 w-4" />
                  Detalhes da Atribuição
                </div>
                <p className="text-sm text-muted-foreground">{assignment.assignment_notes}</p>
              </div>
            )}

            {/* Terms & Conditions */}
            {assignment.terms_and_conditions && (
              <div className="bg-white/70 p-3 rounded border">
                <div className="flex items-center gap-1 text-sm font-medium mb-2">
                  <FileText className="h-4 w-4" />
                  Termos e Condições
                </div>
                <p className="text-sm text-muted-foreground">{assignment.terms_and_conditions}</p>
              </div>
            )}

            {/* Response Section */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Sua Resposta (opcional)</label>
                <Textarea
                  placeholder="Adicione comentários sobre esta atribuição..."
                  value={responseNotes[assignment.id] || ''}
                  onChange={(e) => updateResponseNotes(assignment.id, e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleResponse(assignment.id, 'accept')}
                  disabled={responding === assignment.id}
                  className="flex-1"
                >
                  {responding === assignment.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aceitar Atribuição
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResponse(assignment.id, 'reject')}
                  disabled={responding === assignment.id}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PartnerAssignmentNotifications;
