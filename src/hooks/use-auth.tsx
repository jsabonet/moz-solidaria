import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getApiBase } from '@/lib/config';

interface User {
  id: number;
  username: string;
  email: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  first_name?: string;
  last_name?: string;
  profile?: any;
  groups?: string[];
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  checkAuthStatus: () => void;
  refreshUserData: () => Promise<void>;
  invalidatePermissionsCache: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  forceRefreshUserPermissions: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para fazer login via JWT
async function jwtLogin(username: string, password: string) {
  const API_BASE = getApiBase();
  
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Credenciais inválidas: ${errorText}`);
  }
  
  const data = await res.json();
  
  // Buscar dados do usuário
  const userRes = await fetch(`${API_BASE}/auth/user/`, {
    headers: {
      'Authorization': `Bearer ${data.access}`,
      'Content-Type': 'application/json',
    },
  });
  
  let userData;
  if (userRes.ok) {
    userData = await userRes.json();
  } else {
    // Fallback para dados básicos
    userData = {
      id: 1,
      username: username,
      is_staff: true,
      is_superuser: false
    };
  }
  
  return {
    token: data.access,
    refresh: data.refresh,
    user: userData
  };
}

// Função para refresh do token
async function jwtRefresh(refreshToken: string) {
  const API_BASE = getApiBase();
  
  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  
  if (!res.ok) throw new Error('Token inválido');
  return res.json();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && (typeof user.id === 'number' ? user.id >= 0 : !!user.username);
  const isStaff = !!user && (user.is_staff || user.is_superuser);

  const checkAuthStatus = async () => {
    
    // 🔄 DETECÇÃO DE RELOAD DA PÁGINA
    const pageReloadKey = 'auth_page_reload_timestamp';
    const lastReloadTime = localStorage.getItem(pageReloadKey);
    const currentTime = Date.now();
    const isPageReload = !lastReloadTime || (currentTime - parseInt(lastReloadTime)) > 5000; // 5 segundos
    
    if (isPageReload) {
      console.log('🔄 PÁGINA RECARREGADA - Forçando limpeza de cache para atualizar permissões...');
      localStorage.setItem(pageReloadKey, currentTime.toString());
      
      // Limpar cache relacionado a permissões
      invalidatePermissionsCache();
      
      // Marcar que precisamos de dados frescos
      localStorage.removeItem('userData');
      localStorage.removeItem('authUser');
    }
    
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Para reloads da página, sempre buscar dados frescos
    // Para navegação normal, pode usar cache se disponível
    if (!isPageReload && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUser(userData);
        setLoading(false);
        return;
      } catch (error) {
        // Erro ao parsear userData
      }
    }

    try {
      // Para reloads, forçar busca de dados completamente frescos
      const API_BASE = getApiBase();
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      // Adicionar headers anti-cache se for reload da página
      if (isPageReload) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
        headers['X-Force-Fresh'] = 'true';
        headers['X-Page-Reload'] = 'true';
      }
      
      const response = await fetch(`${API_BASE}/auth/user/`, {
        method: 'GET',
        headers,
        ...(isPageReload && { cache: 'no-store' }) // Força no-cache para reloads
      });

      if (response.ok) {
        const userData = await response.json();
        
        setUser(userData);
        // Armazenar dados do usuário no localStorage
        // Salvar com timestamp de reload se aplicável
        const dataToStore = {
          ...userData,
          _lastReload: isPageReload ? currentTime : userData._lastReload,
          _isFromReload: isPageReload
        };
        
        localStorage.setItem('userData', JSON.stringify(dataToStore));
      } else {
        if (refreshToken) {
          try {
            const refreshResponse = await jwtRefresh(refreshToken);
            localStorage.setItem('authToken', refreshResponse.access);
            localStorage.setItem('refreshToken', refreshResponse.refresh);
            
            // Buscar dados atualizados do usuário
            const userResponse = await fetch(`${API_BASE}/auth/user/`, {
              headers: {
                'Authorization': `Bearer ${refreshResponse.access}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
              localStorage.setItem('userData', JSON.stringify(userData));
            } else {
              logout();
            }
          } catch (refreshError) {
            logout();
          }
        } else {
          logout();
        }
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    setLoading(true);
    console.log('🔐 Iniciando processo de login para:', username);
    
    try {
      const response = await jwtLogin(username, password);
      console.log('✅ Login bem-sucedido:', response);
      
      // Salvar tokens
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refresh);
      localStorage.setItem('userData', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      setError('Credenciais inválidas. Verifique seu usuário e senha.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    // Limpar qualquer token antigo
    localStorage.removeItem('access_token');
    setUser(null);
  };

  // Métodos de permissão
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.is_staff) return false;
    // Para admin/superuser, permitir tudo
    if (user.is_superuser) return true;
    
    // Verificar permissões específicas baseadas nos grupos
    const userGroups = user.groups || [];
    
    // Mapear permissões baseadas em grupos
    const groupPermissions: Record<string, string[]> = {
      'Super Admin': ['*'], // Todas as permissões
      'Gestor de Blog': ['blog.view', 'blog.create', 'blog.edit', 'blog.delete'],
      'Gestor de Projetos': ['projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'project-categories.view', 'project-categories.create', 'project-categories.edit', 'project-categories.delete'],
      'Gestor de Comunidade': ['community.view', 'volunteers.view', 'volunteers.create', 'volunteers.edit', 'volunteers.delete', 'beneficiaries.view', 'beneficiaries.create', 'beneficiaries.edit', 'beneficiaries.delete'],
      'Visualizador': ['view.all'] // Apenas visualização
    };
    
    // Verificar se o usuário tem a permissão através de seus grupos
    for (const group of userGroups) {
      const groupName = typeof group === 'string' ? group : (group as any)?.name || group;
      const perms = groupPermissions[groupName] || [];
      
      // Se o grupo tem permissão total (*) ou a permissão específica
      if (perms.includes('*') || perms.includes(permission)) {
        return true;
      }
    }
    
    // Fallback: se é staff, permitir permissões básicas
    return user.is_staff && ['view.all', 'basic.access'].includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    
    const userGroups = user.groups || [];
    const groupNames = userGroups.map(group => 
      typeof group === 'string' ? group : (group as any)?.name || group
    );
    
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrator':
      case 'super_admin':
        return user.is_superuser || groupNames.includes('Super Admin');
      case 'staff':
        return user.is_staff || false;
      case 'blog_manager':
        return groupNames.includes('Gestor de Blog');
      case 'project_manager':
        return groupNames.includes('Gestor de Projetos');
      case 'community_manager':
        return groupNames.includes('Gestor de Comunidade');
      case 'viewer':
        return groupNames.includes('Visualizador');
      case 'user':
        return true; // Qualquer usuário autenticado
      default:
        return groupNames.includes(role);
    }
  };

  // Cache de permissões para invalidar quando necessário
  const [permissionsCache, setPermissionsCache] = useState<Map<string, boolean>>(new Map());

  const invalidatePermissionsCache = () => {
    setPermissionsCache(new Map());
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        logout();
        throw new Error('No token found');
      }
      
      const API_BASE = getApiBase();
      
      // 🚀 NOVA ABORDAGEM: Buscar dados frescos direto do banco
      const response = await fetch(`${API_BASE}/auth/user/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          // Forçar bypass de todos os caches
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        // Garantir que não use cache do navegador
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const userData = await response.json();

      // 🔄 Atualizar estado local com dados frescos
      setUser(userData);
      
      // 🗃️ Atualizar localStorage com dados frescos (com timestamp)
      const userDataWithTimestamp = {
        ...userData,
        _lastUpdated: Date.now()
      };
      localStorage.setItem('userData', JSON.stringify(userDataWithTimestamp));
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar dados do usuário');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 NOVA FUNÇÃO: Forçar atualização completa das permissões direto do banco
  const forceRefreshUserPermissions = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return null;
      }

      // 1. Invalidar cache local primeiro
      invalidatePermissionsCache();

      // 2. Chamar endpoint de limpeza de cache do backend PRIMEIRO
      try {
        const API_BASE = getApiBase();
        const cacheResponse = await fetch(`${API_BASE}/auth/sessions/force_user_cache_clear/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });

        if (cacheResponse.ok) {
          const cacheResult = await cacheResponse.json();
        } else {
          // Falha na limpeza de cache
        }
      } catch (cacheError) {
        // Erro na limpeza de cache
      }

      // 3. Buscar dados completamente frescos do banco (com cache já limpo)
      const API_BASE = getApiBase();
      const userResponse = await fetch(`${API_BASE}/auth/user/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Force-Refresh': 'true',
          'X-Cache-Busted': 'true',
        },
        cache: 'no-store',
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch fresh user data: ${userResponse.status}`);
      }

      const freshUserData = await userResponse.json();
      
      console.log('🎯 DADOS ULTRA-FRESCOS (cache limpo):', {
        id: freshUserData.id,
        username: freshUserData.username,
        is_staff: freshUserData.is_staff,
        is_superuser: freshUserData.is_superuser,
        groups: freshUserData.groups,
        permissions: freshUserData.permissions,
        fresh_data: freshUserData.fresh_data,
        cache_busted: freshUserData.cache_busted,
        timestamp: new Date().toISOString()
      });

      // 4. Atualizar estado imediatamente
      setUser(freshUserData);

      // 5. Limpar e recriar localStorage
      localStorage.removeItem('userData');
      localStorage.removeItem('authUser');
      
      const timestampedData = {
        ...freshUserData,
        _forceRefreshed: Date.now(),
        _refreshReason: 'cache_cleared_permission_update',
        _cacheBusted: true
      };
      
      localStorage.setItem('userData', JSON.stringify(timestampedData));

      console.log('🎉 PERMISSÕES ATUALIZADAS COM CACHE LIMPO - DEVE FUNCIONAR AGORA!');
      
      return freshUserData;
      
    } catch (error) {
      console.error('❌ Erro na atualização forçada:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      error, 
      isAuthenticated, 
      isStaff, 
      checkAuthStatus,
      refreshUserData,
      invalidatePermissionsCache,
      hasPermission,
      hasAnyPermission,
      hasRole,
      forceRefreshUserPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (import.meta.env.DEV) {
    console.log('🔍 useAuth chamado:', { 
      contextExists: !!context, 
      contextType: typeof context,
      user: context?.user ? {
        id: context.user.id,
        username: context.user.username,
        is_staff: context.user.is_staff
      } : null
    });
  }
  
  if (context === undefined) {
    console.error('❌ useAuth: AuthContext não encontrado na árvore de componentes');
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};