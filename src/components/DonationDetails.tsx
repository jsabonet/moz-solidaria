import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Download, 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';

interface Donation {
  id: number;
  amount: string;
  donation_method: {
    id: number;
    name: string;
  };
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
  };
}

interface Comment {
  id: number;
  content: string;
  message: string; // Keep both for compatibility
  created_at: string;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
  };
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
  };
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  submitted: {
    label: 'Submetida',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock
  },
  under_review: {
    label: 'Em Análise',
    color: 'bg-purple-100 text-purple-800',
    icon: AlertTriangle
  },
  approved: {
    label: 'Aprovada',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejeitada',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  },
  completed: {
    label: 'Completada',
    color: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle
  }
};

interface DonationDetailsProps {
  donationId: number;
  onBack: () => void;
}

const DonationDetails: React.FC<DonationDetailsProps> = ({ donationId, onBack }) => {
  const { user } = useAuth();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonationDetails();
    fetchComments();
  }, [donationId]);

  const fetchDonationDetails = async () => {
    try {
      const response = await api.get(`/donations/${donationId}/`);
      setDonation(response.data);
    } catch (error: any) {
      setError('Erro ao carregar detalhes da doação');
      console.error('Erro ao carregar doação:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for donation:', donationId);
      const response = await api.get(`/donations/${donationId}/comments/`);
      console.log('Comments response:', response);
      
      // Handle direct array response (comments API returns array directly)
      let comments = [];
      if (Array.isArray(response.data)) {
        comments = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        comments = response.data.results;
      } else if (response.data) {
        comments = [response.data];
      }
      
      console.log('Processed comments:', comments);
      setComments(comments);
    } catch (error: any) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await api.post(`/donations/${donationId}/comments/`, {
        message: newComment
      });
      setNewComment('');
      fetchComments(); // Recarregar comentários
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
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
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user.username;
  };

  const getUserInitials = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error || 'Doação não encontrada'}</p>
            <Button onClick={onBack} className="mt-4">
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[donation.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Badge className={status.color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      {/* Donation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Doação #{donation.id}</span>
            <span className="text-2xl font-bold text-green-600">
              {formatAmount(donation.amount)}
            </span>
          </CardTitle>
          <CardDescription>
            Criada em {formatDate(donation.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Método de Pagamento</h4>
              <p className="text-gray-600">{donation.donation_method.name}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              <Badge className={status.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
          </div>

          {donation.donor_message && (
            <div>
              <h4 className="font-semibold mb-2">Mensagem</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {donation.donor_message}
              </p>
            </div>
          )}

          {donation.payment_proof && (
            <div>
              <h4 className="font-semibold mb-2">Comprovativo de Pagamento</h4>
              <Button
                variant="outline"
                onClick={() => window.open(donation.payment_proof, '_blank')}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Visualizar Comprovativo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comentários ({comments.length})
          </CardTitle>
          <CardDescription>
            Comunicação entre doador e administração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`flex space-x-3 p-4 rounded-lg ${
                    comment.user.is_staff 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-gray-50'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {comment.user.is_staff ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">
                        {getUserDisplayName(comment.user)}
                      </span>
                      {comment.user.is_staff && (
                        <Badge variant="secondary" className="text-xs">
                          Administrador
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content || comment.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhum comentário ainda.
            </p>
          )}

          {/* Add Comment */}
          <div className="border-t pt-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Adicione um comentário ou pergunta..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submittingComment ? 'Enviando...' : 'Enviar Comentário'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationDetails;
