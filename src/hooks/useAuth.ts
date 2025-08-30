// src/hooks/useAuth.ts
import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: string[];
  permissions: string[];
  profile: {
    phone?: string;
    department?: string;
    position?: string;
    location?: string;
    is_active_admin?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      await fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/v1/rbac/my-profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.user.id,
          username: userData.user.username,
          email: userData.user.email,
          first_name: userData.user.first_name,
          last_name: userData.user.last_name,
          groups: userData.groups,
          permissions: userData.permissions,
          profile: userData.profile || {},
        });
      } else if (response.status === 401) {
        // Token inválido, fazer logout
        logout();
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/v1/auth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Salvar token
        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        // Buscar dados do usuário
        await fetchUserProfile();
        
        return true;
      } else {
        const error = await response.json();
        console.error('Erro no login:', error);
        return false;
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
  };

  const refreshUserData = async () => {
    await fetchUserProfile();
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super users têm todas as permissões
    if (user.groups.includes('Super Admin')) return true;
    
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    
    // Super users têm todas as permissões
    if (user.groups.includes('Super Admin')) return true;
    
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.groups.includes(role);
  };

  const value: AuthContextType = {
    user,
    permissions: user?.permissions || [],
    hasPermission,
    hasAnyPermission,
    hasRole,
    isLoading,
    login,
    logout,
    refreshUserData,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
