import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { 
  fetchNotifications, 
  markNotificationAsRead,
  getNotificationStats 
} from '@/lib/clientAreaApi';
import { Notification } from '@/types/clientArea';
import { toast } from 'sonner';

const NotificationTest: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Testando busca de notificações...');
      const data = await fetchNotifications();
      console.log('✅ Notificações carregadas:', data);
      setNotifications(data);
      toast.success(`${data.length} notificações carregadas`);
    } catch (err: any) {
      console.error('❌ Erro ao buscar notificações:', err);
      setError(err.message);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const testGetStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Testando estatísticas...');
      const data = await getNotificationStats();
      console.log('✅ Estatísticas carregadas:', data);
      setStats(data);
      toast.success('Estatísticas carregadas');
    } catch (err: any) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      setError(err.message);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const testMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      toast.success('Notificação marcada como lida');
    } catch (err: any) {
      console.error('❌ Erro ao marcar como lida:', err);
      toast.error('Erro ao marcar como lida');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Teste do Sistema de Notificações</span>
          </CardTitle>
          <CardDescription>
            Use os botões abaixo para testar as funcionalidades do sistema de notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button 
              onClick={testFetchNotifications}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Buscar Notificações
            </Button>
            <Button 
              variant="outline"
              onClick={testGetStats}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Buscar Estatísticas
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>📊 Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
                    <div className="text-sm text-gray-600">Não Lidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.read}</div>
                    <div className="text-sm text-gray-600">Lidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(stats.by_type).length}
                    </div>
                    <div className="text-sm text-gray-600">Tipos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {notifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📋 Notificações ({notifications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg ${
                        !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {notification.type_display}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.priority_display}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="text-xs text-gray-500">
                            {notification.time_ago} • {notification.notification_type}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testMarkAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {notification.action_url && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                if (notification.related_donation_id) {
                                  console.log(`Navegar para doação ${notification.related_donation_id}`);
                                  toast.info(`Redirecionando para doação ${notification.related_donation_id}`);
                                }
                              }}
                            >
                              {notification.action_text || 'Ver'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTest;
