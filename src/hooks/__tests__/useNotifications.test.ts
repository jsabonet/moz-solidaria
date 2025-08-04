// src/hooks/__tests__/useNotifications.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNotifications } from '@/hooks/useNotifications';

// Mock WebSocket
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  onopen: null as any,
  onmessage: null as any,
  onclose: null as any,
  onerror: null as any,
  readyState: WebSocket.OPEN
};

global.WebSocket = vi.fn(() => mockWebSocket) as any;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('conecta ao WebSocket quando inicializado', () => {
    const { result } = renderHook(() => useNotifications());

    expect(global.WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('ws://localhost:8000/ws/notifications/?token=mock-token')
    );
  });

  it('não conecta se não houver token', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    renderHook(() => useNotifications());

    expect(global.WebSocket).not.toHaveBeenCalled();
  });

  it('atualiza estado quando conectado', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      mockWebSocket.onopen?.();
    });

    expect(result.current.isConnected).toBe(true);
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ action: 'get_unread_count' })
    );
  });

  it('adiciona nova notificação quando recebida', () => {
    const { result } = renderHook(() => useNotifications());

    const newNotification = {
      id: 1,
      title: 'Nova Notificação',
      message: 'Mensagem de teste',
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString()
    };

    act(() => {
      mockWebSocket.onmessage?.({
        data: JSON.stringify({
          type: 'notification',
          notification: newNotification
        })
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual(newNotification);
    expect(result.current.unreadCount).toBe(1);
  });

  it('atualiza contador de não lidas', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      mockWebSocket.onmessage?.({
        data: JSON.stringify({
          type: 'unread_count',
          count: 5
        })
      });
    });

    expect(result.current.unreadCount).toBe(5);
  });

  it('marca notificação como lida', () => {
    const { result } = renderHook(() => useNotifications());

    // Adicionar notificação primeiro
    const notification = {
      id: 1,
      title: 'Teste',
      message: 'Mensagem',
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString()
    };

    act(() => {
      mockWebSocket.onmessage?.({
        data: JSON.stringify({
          type: 'notification',
          notification
        })
      });
    });

    // Marcar como lida
    act(() => {
      result.current.markAsRead(1);
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        action: 'mark_read',
        notification_id: 1
      })
    );

    expect(result.current.notifications[0].is_read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('desconecta quando desmontado', () => {
    const { unmount } = renderHook(() => useNotifications());

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'User disconnected');
  });

  it('tenta reconectar após desconexão', async () => {
    vi.useFakeTimers();
    
    renderHook(() => useNotifications());

    // Simular desconexão
    act(() => {
      mockWebSocket.onclose?.({ code: 1006 }); // Desconexão anormal
    });

    // Avançar timers para trigger de reconexão
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(global.WebSocket).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
