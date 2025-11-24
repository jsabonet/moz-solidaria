import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  Send, 
  Users, 
  Mail, 
  MessageCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  milestoneAlerts: boolean;
  progressUpdates: boolean;
  budgetAlerts: boolean;
  donorNotifications: boolean;
  weeklyReports: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'milestone' | 'progress' | 'budget' | 'general';
  subject: string;
  content: string;
  variables: string[];
}

interface Notification {
  id: number;
  type: 'milestone' | 'progress' | 'budget' | 'donation' | 'general';
  title: string;
  message: string;
  recipients: number;
  status: 'pending' | 'sent' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  project_id?: number;
  project_name?: string;
}

interface ProjectNotificationsProps {
  projectId: number;
  projectName: string;
}

const ProjectNotifications: React.FC<ProjectNotificationsProps> = ({ projectId, projectName }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    milestoneAlerts: true,
    progressUpdates: true,
    budgetAlerts: true,
    donorNotifications: true,
    weeklyReports: false,
    emailNotifications: true,
    smsNotifications: false
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [recipientType, setRecipientType] = useState('donors');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Simulação de dados - substituir pela API real
      const mockTemplates: NotificationTemplate[] = [
        {
          id: 'milestone_reached',
          name: 'Marco Alcançado',
          type: 'milestone',
          subject: 'Marco importante alcançado em {project_name}!',
          content: 'Temos o prazer de informar que o projeto {project_name} alcançou um marco importante: {milestone_title}. Agradecemos seu apoio contínuo!',
          variables: ['project_name', 'milestone_title', 'progress_percentage']
        },
        {
          id: 'progress_update',
          name: 'Atualização de Progresso',
          type: 'progress',
          subject: 'Atualização do projeto {project_name}',
          content: 'Olá! Queremos compartilhar as últimas novidades do projeto {project_name}. Progresso atual: {progress_percentage}%. {update_message}',
          variables: ['project_name', 'progress_percentage', 'update_message', 'beneficiaries_count']
        },
        {
          id: 'budget_alert',
          name: 'Alerta de Orçamento',
          type: 'budget',
          subject: 'Atualização orçamentária - {project_name}',
          content: 'O projeto {project_name} utilizou {budget_spent} MZN dos {budget_total} MZN disponíveis ({budget_percentage}% do orçamento).',
          variables: ['project_name', 'budget_spent', 'budget_total', 'budget_percentage']
        }
      ];

      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'milestone',
          title: 'Marco: Início da construção',
          message: 'Notificação enviada para 150 doadores sobre o início das obras.',
          recipients: 150,
          status: 'sent',
          sent_at: '2025-02-15T10:00:00Z',
          project_id: projectId,
          project_name: projectName
        },
        {
          id: 2,
          type: 'progress',
          title: 'Atualização mensal de progresso',
          message: 'Relatório mensal enviado para todos os interessados.',
          recipients: 300,
          status: 'sent',
          sent_at: '2025-07-01T14:00:00Z',
          project_id: projectId,
          project_name: projectName
        },
        {
          id: 3,
          type: 'donation',
          title: 'Agradecimento por doação',
          message: 'Mensagem de agradecimento agendada para novo doador.',
          recipients: 1,
          status: 'pending',
          scheduled_at: '2025-08-10T09:00:00Z',
          project_id: projectId,
          project_name: projectName
        }
      ];

      setTemplates(mockTemplates);
      setNotifications(mockNotifications);
    } catch (error) {
      toast.error('Erro ao carregar configurações de notificação');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Aqui você salvaria as configurações na API
    toast.success('Configuração atualizada');
  };

  const handleSendNotification = async () => {
    if (!selectedTemplate && !customMessage) {
      toast.error('Selecione um template ou digite uma mensagem personalizada');
      return;
    }

    try {
      // Simulação do envio - substituir pela API real
      const newNotification: Notification = {
        id: Date.now(),
        type: 'general',
        title: selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name || 'Notificação personalizada' : 'Mensagem personalizada',
        message: customMessage || `Notificação baseada no template: ${selectedTemplate}`,
        recipients: recipientType === 'donors' ? 150 : recipientType === 'volunteers' ? 45 : 200,
        status: 'sent',
        sent_at: new Date().toISOString(),
        project_id: projectId,
        project_name: projectName
      };

      setNotifications(prev => [newNotification, ...prev]);
      setIsDialogOpen(false);
      setSelectedTemplate('');
      setCustomMessage('');
      
      toast.success(`Notificação enviada para ${newNotification.recipients} pessoas!`);
    } catch (error) {
      toast.error('Erro ao enviar notificação');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-green-100 text-green-800';
      case 'progress': return 'bg-blue-100 text-blue-800';
      case 'budget': return 'bg-yellow-100 text-yellow-800';
      case 'donation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Sistema de Notificações</h3>
          <p className="text-muted-foreground">
            Configure alertas automáticos e envie comunicações para "{projectName}"
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Enviar Notificação
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Notificação</DialogTitle>
              <DialogDescription>
                Envie uma notificação personalizada ou use um template
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Destinatários</Label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donors">Doadores (150 pessoas)</SelectItem>
                    <SelectItem value="volunteers">Voluntários (45 pessoas)</SelectItem>
                    <SelectItem value="all">Todos os interessados (200 pessoas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Template (opcional)</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template ou deixe em branco para mensagem personalizada" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTemplate && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Preview do Template:</h4>
                  <p className="text-sm text-muted-foreground">
                    {templates.find(t => t.id === selectedTemplate)?.content}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Mensagem Personalizada</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Digite sua mensagem personalizada aqui..."
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendNotification}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Agora
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações Automáticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Alertas Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="milestone-alerts" className="text-sm">
                Marcos importantes
              </Label>
              <Switch
                id="milestone-alerts"
                checked={settings.milestoneAlerts}
                onCheckedChange={(checked) => handleSettingChange('milestoneAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="progress-updates" className="text-sm">
                Atualizações de progresso
              </Label>
              <Switch
                id="progress-updates"
                checked={settings.progressUpdates}
                onCheckedChange={(checked) => handleSettingChange('progressUpdates', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="budget-alerts" className="text-sm">
                Alertas de orçamento
              </Label>
              <Switch
                id="budget-alerts"
                checked={settings.budgetAlerts}
                onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="donor-notifications" className="text-sm">
                Notificações de doadores
              </Label>
              <Switch
                id="donor-notifications"
                checked={settings.donorNotifications}
                onCheckedChange={(checked) => handleSettingChange('donorNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-reports" className="text-sm">
                Relatórios semanais
              </Label>
              <Switch
                id="weekly-reports"
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Canais de Comunicação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Canais Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label className="text-sm">Email</Label>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <Label className="text-sm">SMS</Label>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
              />
            </div>

            <div className="pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doadores cadastrados:</span>
                <span className="font-medium">150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voluntários ativos:</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lista geral:</span>
                <span className="font-medium">200</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de Envio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {notifications.filter(n => n.status === 'sent').length}
              </div>
              <p className="text-sm text-muted-foreground">notificações enviadas</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {notifications.reduce((sum, n) => sum + (n.status === 'sent' ? n.recipients : 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">pessoas alcançadas</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-sm text-muted-foreground">taxa de entrega</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map(notification => (
              <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                    {getStatusIcon(notification.status)}
                  </div>
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusColor(notification.status) as any}>
                        {notification.status === 'sent' ? 'Enviado' : 
                         notification.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {notification.recipients} destinatários
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  {notification.sent_at ? (
                    <div>
                      Enviado em<br />
                      {new Date(notification.sent_at).toLocaleDateString('pt-BR')}
                    </div>
                  ) : notification.scheduled_at ? (
                    <div>
                      Agendado para<br />
                      {new Date(notification.scheduled_at).toLocaleDateString('pt-BR')}
                    </div>
                  ) : (
                    'Data não definida'
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectNotifications;
