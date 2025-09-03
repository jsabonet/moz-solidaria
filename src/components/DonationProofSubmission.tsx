import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, AlertCircle, CheckCircle, User, UserPlus, FileText, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { toast } from 'sonner';

interface DonationMethod {
  id: number;
  name: string;
  is_active: boolean;
}

interface DonationProofData {
  amount: string;
  donation_method: string;
  description: string;
  payment_proof?: File;
  // Campos para usuários não logados
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}

interface DonationProofSubmissionProps {
  onSuccess?: () => void;
  showModeSelector?: boolean;
  defaultMode?: 'guest' | 'logged';
}

const DonationProofSubmission: React.FC<DonationProofSubmissionProps> = ({ 
  onSuccess, 
  showModeSelector = true,
  defaultMode
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donationMethods, setDonationMethods] = useState<DonationMethod[]>([]);
  const [mode, setMode] = useState<'guest' | 'logged'>(defaultMode || (user ? 'logged' : 'guest'));
  const [formData, setFormData] = useState<DonationProofData>({
    amount: '',
    donation_method: '',
    description: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonationMethods();
    // Se o usuário estiver logado, preencher os dados
    if (user && mode === 'logged') {
      setFormData(prev => ({
        ...prev,
        guest_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        guest_email: user.email || '',
      }));
    }
  }, [user, mode]);

  const fetchDonationMethods = async () => {
    try {
      console.log('🔄 Carregando métodos de doação...');
      const response = await api.get('/donations/methods/');
      console.log('📊 Resposta métodos de doação:', response.data);
      
      let methods = [];
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        methods = response.data.results;
      } else if (Array.isArray(response.data)) {
        methods = response.data;
      }
      
      const activeMethods = methods.filter((method: DonationMethod) => method.is_active);
      console.log('🔧 Métodos ativos processados:', activeMethods);
      setDonationMethods(activeMethods);
    } catch (error) {
      console.error('❌ Erro ao carregar métodos de doação:', error);
      setDonationMethods([]);
    }
  };

  const handleInputChange = (field: keyof DonationProofData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (máx 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Arquivo muito grande. O limite é 5MB.');
        event.target.value = '';
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato não suportado. Use JPG, PNG ou PDF.');
        event.target.value = '';
        return;
      }

      setFormData(prev => ({ ...prev, payment_proof: file }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Por favor, insira um valor válido para a doação.');
      return false;
    }

    if (!formData.donation_method) {
      setError('Por favor, selecione o método de doação.');
      return false;
    }

    if (!formData.payment_proof) {
      setError('Por favor, faça upload do comprovante de pagamento.');
      return false;
    }

    if (mode === 'guest') {
      if (!formData.guest_name?.trim()) {
        setError('Por favor, insira seu nome completo.');
        return false;
      }
      if (!formData.guest_email?.trim()) {
        setError('Por favor, insira seu email.');
        return false;
      }
      if (!formData.guest_phone?.trim()) {
        setError('Por favor, insira seu telefone.');
        return false;
      }
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.guest_email)) {
        setError('Por favor, insira um email válido.');
        return false;
      }
    }

    return true;
  };

  const handleModeChange = (newMode: 'guest' | 'logged') => {
    if (newMode === 'logged' && !user) {
      // Redirecionar para login se usuário não estiver logado
      navigate('/login?redirect=/enviar-comprovante');
      return;
    }
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('donation_method', formData.donation_method);
      formDataToSend.append('description', formData.description || '');
      
      if (formData.payment_proof) {
        formDataToSend.append('payment_proof', formData.payment_proof);
      }

      // Para usuários não logados, adicionar informações de contato
      if (mode === 'guest') {
        formDataToSend.append('guest_name', formData.guest_name || '');
        formDataToSend.append('guest_email', formData.guest_email || '');
        formDataToSend.append('guest_phone', formData.guest_phone || '');
        formDataToSend.append('is_guest_donation', 'true');
      }

      const endpoint = mode === 'guest' ? '/donations/guest/' : '/donations/';
      
      // Debug: log dos dados sendo enviados
      console.log('🔍 Enviando dados:', {
        endpoint,
        mode,
        formData: Object.fromEntries(formDataToSend.entries())
      });
      
      const response = await api.post(endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      toast.success(
        mode === 'guest' 
          ? 'Comprovante enviado com sucesso! Você receberá uma confirmação por email.'
          : 'Doação criada com sucesso!'
      );
      
      // Reset form
      setFormData({
        amount: '',
        donation_method: '',
        description: '',
        guest_name: mode === 'logged' ? formData.guest_name : '',
        guest_email: mode === 'logged' ? formData.guest_email : '',
        guest_phone: '',
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Erro ao enviar comprovante:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.amount) {
        setError(error.response.data.amount[0]);
      } else {
        setError('Erro ao enviar comprovante. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Comprovante Enviado com Sucesso!
          </h3>
          <p className="text-gray-600 mb-6">
            {mode === 'guest' ? (
              <>
                Obrigado pela sua doação! Você receberá uma confirmação por email em breve.
                <br />Nossa equipe analisará seu comprovante e entrará em contato se necessário.
              </>
            ) : (
              'Sua doação foi registrada e está sendo processada pela nossa equipe.'
            )}
          </p>
          
          {mode === 'guest' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2 text-blue-800 mb-2">
                <UserPlus className="h-5 w-5" />
                <span className="font-medium">Acompanhe o Impacto da Sua Doação</span>
              </div>
              <p className="text-blue-700 text-sm mb-4">
                Crie uma conta no portal da comunidade para acompanhar o impacto das suas doações,
                ver relatórios de transparência e receber atualizações sobre os projetos apoiados.
              </p>
              <Link to="/login?mode=register">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Criar Conta Gratuita
                </Button>
              </Link>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setSuccess(false);
                setError('');
              }}
              variant="outline"
            >
              Enviar Outro Comprovante
            </Button>
            <Link to="/doacao">
              <Button>
                Voltar às Informações de Doação
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <span>Envio de Comprovante de Doação</span>
        </CardTitle>
        <CardDescription>
          Envie o comprovante da sua doação para que possamos processar e confirmar sua contribuição.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Seletor de Modo */}
        {showModeSelector && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Como você gostaria de enviar o comprovante?
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant={mode === 'logged' ? 'default' : 'outline'}
                className="flex items-center justify-center space-x-2 h-auto py-3"
                onClick={() => handleModeChange('logged')}
              >
                <User className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Como Usuário Logado</div>
                  <div className="text-xs opacity-75">
                    {user ? 'Dados pré-preenchidos' : 'Clique para fazer login'}
                  </div>
                </div>
              </Button>
              <Button
                variant={mode === 'guest' ? 'default' : 'outline'}
                className="flex items-center justify-center space-x-2 h-auto py-3"
                onClick={() => handleModeChange('guest')}
              >
                <UserPlus className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Como Convidado</div>
                  <div className="text-xs opacity-75">Sem necessidade de conta</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais para Convidados */}
          {mode === 'guest' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800 mb-2">
                <Shield className="h-4 w-4" />
                <span className="font-medium text-sm">Suas Informações de Contato</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guest_name">Nome Completo *</Label>
                  <Input
                    id="guest_name"
                    type="text"
                    value={formData.guest_name}
                    onChange={(e) => handleInputChange('guest_name', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="guest_phone">Telefone *</Label>
                  <Input
                    id="guest_phone"
                    type="tel"
                    value={formData.guest_phone}
                    onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                    placeholder="+258 84 123 4567"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="guest_email">Email *</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={formData.guest_email}
                  onChange={(e) => handleInputChange('guest_email', e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
          )}

          {/* Informações da Doação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor da Doação (MZN) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="100.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="donation_method">Método de Doação *</Label>
              {donationMethods.length === 0 ? (
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg mt-2">
                  <p className="text-sm text-orange-800 font-medium">⚠️ Nenhum método de pagamento disponível</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Entre em contato com o administrador para configurar métodos de doação.
                  </p>
                </div>
              ) : (
                <Select
                  value={formData.donation_method}
                  onValueChange={(value) => handleInputChange('donation_method', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método usado" />
                  </SelectTrigger>
                  <SelectContent>
                    {donationMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Upload do Comprovante */}
          <div>
            <Label htmlFor="payment_proof">Comprovante de Pagamento *</Label>
            <div className="mt-2">
              <Input
                id="payment_proof"
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                required
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="text-xs text-gray-500 mt-1">
                Formatos aceites: JPG, PNG, PDF (máx. 5MB)
              </div>
            </div>
          </div>

          {/* Descrição Opcional */}
          <div>
            <Label htmlFor="description">Mensagem (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Alguma observação sobre a doação..."
              rows={3}
            />
          </div>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Informações de Segurança */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800 mb-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium text-sm">Segurança e Privacidade</span>
            </div>
            <div className="text-green-700 text-sm space-y-1">
              <p>✓ Seus dados são protegidos por HTTPS</p>
              <p>✓ Comprovantes armazenados de forma segura</p>
              <p>✓ Dados pessoais não são compartilhados</p>
              <p>✓ Processamento em conformidade com a legislação moçambicana</p>
            </div>
          </div>

          {/* Botão de Envio */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando Comprovante...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Comprovante
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DonationProofSubmission;
