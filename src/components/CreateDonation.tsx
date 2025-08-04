import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import useClientAreaNotifications from '@/hooks/use-client-area-notifications';

interface DonationMethod {
  id: number;
  name: string;
  is_active: boolean;
}

interface CreateDonationData {
  amount: string;
  donation_method: string;
  description: string;
  payment_proof?: File;
}

const CreateDonation: React.FC = () => {
  const { user } = useAuth();
  const { notifyDonationSuccess, notifyDonationError, notification } = useClientAreaNotifications();
  const [donationMethods, setDonationMethods] = useState<DonationMethod[]>([]);
  const [formData, setFormData] = useState<CreateDonationData>({
    amount: '',
    donation_method: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  console.log('🔍 CreateDonation - donationMethods:', donationMethods, 'count:', donationMethods.length);

  useEffect(() => {
    fetchDonationMethods();
  }, []);

  const fetchDonationMethods = async () => {
    try {
      const response = await api.get('/donations/methods/');
      console.log('Métodos de doação response:', response);
      
      // Handle paginated response
      let methods = [];
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Paginated response
        methods = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        methods = response.data;
      } else if (Array.isArray(response)) {
        // Response is already the array
        methods = response;
      }
      
      console.log('Métodos processados:', methods);
      setDonationMethods(methods.filter((method: DonationMethod) => method.is_active));
    } catch (error) {
      console.error('Erro ao carregar métodos de doação:', error);
      setDonationMethods([]); // Set empty array on error
    }
  };

  const handleInputChange = (field: keyof CreateDonationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (máx 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        notification.error('Arquivo muito grande', {
          description: 'O arquivo deve ter no máximo 10MB.'
        });
        event.target.value = ''; // Limpar seleção
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        notification.error('Tipo de arquivo não permitido', {
          description: 'Por favor, selecione uma imagem, PDF ou documento Word.'
        });
        event.target.value = ''; // Limpar seleção
        return;
      }

      console.log('Arquivo selecionado:', { name: file.name, type: file.type, size: file.size });
      
      setFormData(prev => ({
        ...prev,
        payment_proof: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      notification.error('Valor inválido', {
        description: 'Por favor, insira um valor de doação válido.'
      });
      return;
    }
    
    if (!formData.donation_method) {
      notification.error('Método obrigatório', {
        description: 'Por favor, selecione um método de doação.'
      });
      return;
    }

    // Mostrar modal de confirmação
    setShowConfirmDialog(true);
  };

  const handleConfirmDonation = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setShowConfirmDialog(false);

    try {
      const submitData = new FormData();
      submitData.append('amount', formData.amount);
      submitData.append('donation_method', formData.donation_method);
      submitData.append('donor_message', formData.description);
      
      if (formData.payment_proof) {
        submitData.append('payment_proof', formData.payment_proof);
      }

      console.log('Enviando dados da doação:', {
        amount: formData.amount,
        donation_method: formData.donation_method,
        donor_message: formData.description,
        payment_proof: formData.payment_proof ? 'arquivo anexado' : 'sem arquivo'
      });

      const response = await api.post('/donations/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      notification.success('Doação enviada com sucesso!', {
        description: `Sua doação de MT ${formData.amount} foi registrada e está sendo processada.`,
        duration: 10000,
        action: {
          label: 'Ver Doações',
          onClick: () => {
            // Implementar navegação para lista de doações
            console.log('Navegar para minhas doações');
          }
        }
      });

      setFormData({
        amount: '',
        donation_method: '',
        description: '',
      });
      
      // Reset file input
      const fileInput = document.getElementById('payment-proof') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error: any) {
      console.error('Erro ao criar doação:', error);
      
      let errorMessage = 'Erro ao processar doação';
      let errorDescription = 'Ocorreu um erro inesperado. Tente novamente.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorDescription = error.response.data;
        } else if (error.response.data.detail) {
          errorDescription = error.response.data.detail;
        } else if (error.response.data.error) {
          errorDescription = error.response.data.error;
        }
      }
      
      setError(errorDescription);
      notification.error(errorMessage, {
        description: errorDescription,
        duration: 8000,
        action: {
          label: 'Tentar Novamente',
          onClick: () => setError('')
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você precisa estar logado para fazer uma doação.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Fazer Doação</CardTitle>
        <CardDescription className="text-center">
          Contribua para nossos programas de solidariedade
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Doação submetida com sucesso! Você receberá uma confirmação em breve.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor da Doação (MZN) *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="100.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donation-method">Método de Pagamento *</Label>
              {donationMethods.length === 0 && (
                <p className="text-sm text-muted-foreground">Carregando métodos de pagamento...</p>
              )}
              <Select
                value={formData.donation_method}
                onValueChange={(value) => handleInputChange('donation_method', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    donationMethods.length === 0 
                      ? "Carregando..." 
                      : "Selecione o método"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {donationMethods.length > 0 ? (
                    donationMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Carregando métodos...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {donationMethods.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {donationMethods.length} métodos disponíveis
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mensagem (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Deixe uma mensagem sobre sua doação..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-proof">Comprovativo de Pagamento</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="payment-proof"
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              Anexe uma imagem, PDF ou documento do comprovativo de pagamento (máx 10MB)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !formData.amount || !formData.donation_method}
          >
            {loading ? 'Submetendo...' : 'Submeter Doação'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Como funciona:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Preencha os dados da doação</li>
            <li>2. Faça o pagamento usando o método escolhido</li>
            <li>3. Anexe o comprovativo de pagamento</li>
            <li>4. Aguarde a confirmação da nossa equipe</li>
          </ol>
        </div>
      </CardContent>
    </Card>

    {/* Modal de Confirmação */}
    <ConfirmationDialog
      open={showConfirmDialog}
      onOpenChange={setShowConfirmDialog}
      title="Confirmar Doação"
      description={`Deseja confirmar o envio de uma doação de MT ${formData.amount}?`}
      confirmText="Confirmar Doação"
      cancelText="Cancelar"
      variant="success"
      onConfirm={handleConfirmDonation}
      loading={loading}
    />
  </>
  );
};

export default CreateDonation;
