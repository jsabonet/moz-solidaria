import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { getApiBase } from '@/lib/config';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'matching' | 'donation' | 'volunteer';
  is_read: boolean;
  action_url?: string;
  action_text?: string;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  connect: () => void;
  disconnect: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const API_URL = getApiBase();
    const baseUrl = API_URL.replace('/api/v1', '').replace('http://', '').replace('https://', '');
    const host = process.env.NODE_ENV === 'development' 
      ? baseUrl || 'localhost:8000' 
      : window.location.host;
    return `${protocol}//${host}/ws/notifications/`;
  };

  const showNotificationToast = useCallback((notification: Notification) => {
    const toastConfig = {
      duration: 5000,
      action: notification.action_url ? {
        label: notification.action_text || 'Ver',
        onClick: () => window.location.href = notification.action_url!
      } : undefined
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, {
          description: notification.message,
          ...toastConfig
        });
        break;
      case 'warning':
        toast.warning(notification.title, {
          description: notification.message,
          ...toastConfig
        });
        break;
      case 'error':
        toast.error(notification.title, {
          description: notification.message,
          ...toastConfig
        });
        break;
      default:
        toast.info(notification.title, {
          description: notification.message,
          ...toastConfig
        });
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }

      wsRef.current = new WebSocket(`${getWebSocketUrl()}?token=${token}`);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Solicitar contagem de não lidas
        wsRef.current?.send(JSON.stringify({
          action: 'get_unread_count'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'notification':
              const newNotification = data.notification;
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
              showNotificationToast(newNotification);
              break;
              
            case 'unread_count':
            case 'unread_count_update':
              setUnreadCount(data.count);
              break;
              
            case 'error':
              toast.error('Erro de notificação', {
                description: data.message
              });
              break;
          }
        } catch (error) {
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        
        // Tentar reconectar se não foi fechamento intencional
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        setIsConnected(false);
      };

    } catch (error) {
      setIsConnected(false);
    }
  }, [showNotificationToast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  const markAsRead = useCallback((notificationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'mark_read',
        notification_id: notificationId
      }));
    }

    // Atualizar estado local
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    // Fazer requisição HTTP para marcar todas como lidas
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const API_BASE = getApiBase();
    fetch(`${API_BASE}/client-area/notifications/mark-all-read/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(() => {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    })
    .catch(error => {
      toast.error('Erro ao marcar notificações como lidas');
    });
  }, []);

  // Conectar automaticamente quando o hook é usado
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    connect,
    disconnect
  };
};
