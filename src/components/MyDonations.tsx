import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageCircle, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
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
  comments_count: number;
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

interface MyDonationsProps {
  onViewDetails: (donation: Donation) => void;
}

const MyDonations: React.FC<MyDonationsProps> = ({ onViewDetails }) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/donations/');
      setDonations(response.data.results || response.data);
    } catch (error: any) {
      setError('Erro ao carregar doações');
      console.error('Erro ao carregar doações:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <Button onClick={fetchDonations} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (donations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Você ainda não fez nenhuma doação.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Doações</h2>
        <Badge variant="secondary">{donations.length} doações</Badge>
      </div>

      <div className="grid gap-4">
        {donations.map((donation) => {
          const status = statusConfig[donation.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={donation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {formatAmount(donation.amount)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {donation.donation_method.name}
                    </p>
                  </div>
                  <Badge className={status.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>

                {donation.donor_message && (
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {donation.donor_message}
                  </p>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Criada em {formatDate(donation.created_at)}</span>
                  {donation.comments_count > 0 && (
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {donation.comments_count} comentários
                    </span>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(donation)}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MyDonations;
