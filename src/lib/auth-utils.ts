// src/lib/auth-utils.ts
// Utilitários centralizados para gestão de autenticação

// Chaves do localStorage
export const AUTH_KEYS = {
  TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData'
} as const;

// Funções para gestão de tokens
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_KEYS.TOKEN);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_KEYS.TOKEN, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, token);
}

export function getUserData(): any | null {
  const userData = localStorage.getItem(AUTH_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
}

export function setUserData(userData: any): void {
  localStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(userData));
}

export function clearAuthData(): void {
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER_DATA);
}

// Verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return token !== null && token !== undefined && token.trim() !== '';
}

// Obter headers de autenticação
export function getAuthHeaders(includeContentType: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Fazer requisição autenticada
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(!options.body || typeof options.body === 'string'),
    ...options
  };

  // Merge headers se já existirem
  if (options.headers) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      ...options.headers
    };
  }

  const response = await fetch(url, defaultOptions);

  // Se token expirou, tentar refresh
  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Tentar novamente com novo token
      const newOptions = {
        ...defaultOptions,
        headers: {
          ...defaultOptions.headers,
          ...getAuthHeaders(!options.body || typeof options.body === 'string')
        }
      };
      return fetch(url, newOptions);
    } else {
      // Se refresh falhou, limpar dados e redirecionar para login
      clearAuthData();
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  return response;
}

// Tentar refresh do token
export async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    
    const response = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setAuthToken(data.access);
      return true;
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
  }

  return false;
}

// Debug: Verificar estado da autenticação
export function debugAuthState(): void {
  console.group('🔐 Estado da Autenticação');
  console.log('Token:', getAuthToken() ? '✅ Presente' : '❌ Ausente');
  console.log('Refresh Token:', getRefreshToken() ? '✅ Presente' : '❌ Ausente');
  console.log('User Data:', getUserData());
  console.log('Headers:', getAuthHeaders());
  console.groupEnd();
}
