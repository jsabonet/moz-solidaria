// src/components/clientArea/NotificationCenter.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  Clock,
  Filter,
  Check,
  Heart,
  MessageCircle,
  CreditCard,
  UserCheck,
  Gift
} from 'lucide-react';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getNotificationStats,
  bulkActionNotifications 
} from '@/lib/clientAreaApi';
import { Notification } from '@/types/clientArea';
import { toast } from 'sonner';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [stats, setStats] = useState<{
    total: number;
    unread: number;
    read: number;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
  } | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getNotificationStats();
      setStats(data);
    } catch (error) {
      // Error handled silently
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      loadStats(); // Reload stats
      toast.success('Notificação marcada como lida');
    } catch (error) {
      toast.error('Erro ao marcar como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      loadStats();
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar todas como lidas');
    }
  };

  const handleBulkAction = async (action: 'mark_read' | 'mark_unread' | 'delete') => {
    if (selectedNotifications.size === 0) {
      toast.error('Selecione pelo menos uma notificação');
      return;
    }

    try {
      await bulkActionNotifications(Array.from(selectedNotifications), action);
      
      if (action === 'delete') {
        setNotifications(prev => 
          prev.filter(n => !selectedNotifications.has(n.id))
        );
        toast.success(`${selectedNotifications.size} notificações deletadas`);
      } else {
        setNotifications(prev => 
          prev.map(n => selectedNotifications.has(n.id) 
            ? { ...n, is_read: action === 'mark_read' }
            : n
          )
        );
        toast.success(`${selectedNotifications.size} notificações atualizadas`);
      }
      
      setSelectedNotifications(new Set());
      loadStats();
    } catch (error) {
      toast.error('Erro ao executar ação');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'donation_created': 
      case 'donation_approved': 
        return <Gift className="h-4 w-4 text-green-500" />;
      case 'donation_status_changed': 
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'donation_comment_added':
      case 'admin_comment':
      case 'donor_comment':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'donation_rejected': 
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'payment_verified': 
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      default: 
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.is_read;
      case 'important': return notification.priority === 'high' || notification.priority === 'urgent';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Central de Notificações</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} não lidas</Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar Todas Como Lidas
              </Button>
            </div>
          </div>
          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
                <div className="text-sm text-muted-foreground">Não Lidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.read}</div>
                <div className="text-sm text-muted-foreground">Lidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(stats.by_priority).find((_, i) => Object.keys(stats.by_priority)[i] === 'high') || 0}
                </div>
                <div className="text-sm text-muted-foreground">Importantes</div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Não Lidas ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="important">
            Importantes ({notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma notificação encontrada.
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-muted/50 transition-colors ${
                          !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-1">
                              {getNotificationIcon(notification.notification_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-sm">
                                  {notification.title}
                                </h4>
                                <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                                  {notification.priority_display}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {notification.time_ago}
                                </span>
                                {notification.type_display && (
                                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {notification.type_display}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                title="Marcar como lida"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {notification.action_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (notification.related_donation_id) {
                                    // Navigate to donation details - you can implement router navigation here
                                    window.location.href = `/dashboard/donations/${notification.related_donation_id}`;
                                  } else if (notification.action_url.startsWith('http')) {
                                    window.open(notification.action_url, '_blank');
                                  } else {
                                    window.location.href = notification.action_url;
                                  }
                                }}
                              >
                                {notification.action_text || 'Ver Detalhes'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Configurações de Notificação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Notificações por Email</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Novas oportunidades de voluntariado</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Atualizações de projetos</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Newsletter semanal</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Notificações Push</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Mensagens urgentes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Lembretes de atividades</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Atualizações em tempo real</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button>Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
