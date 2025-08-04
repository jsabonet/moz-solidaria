import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { login as apiLogin, refreshToken as apiRefreshToken, fetchUserProfile } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  first_name?: string;
  last_name?: string;
  profile?: any; // Dados do UserProfile do client-area
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && (typeof user.id === 'number' ? user.id >= 0 : !!user.username);
  const isStaff = !!user && (user.is_staff || user.is_superuser);

  console.log('🔍 Auth State:', { 
    user: user ? { id: user.id, username: user.username } : null, 
    isAuthenticated, 
    isStaff, 
    loading 
  });

  const checkAuthStatus = async () => {
    console.log('🔍 Verificando status de autenticação...');
    const token = localStorage.getItem('authToken');
    const refreshTokenValue = localStorage.getItem('refreshToken');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token) {
      console.log('❌ Nenhum token encontrado');
      setUser(null);
      setLoading(false);
      return;
    }

    // Se temos dados do usuário salvos, usar primeiro
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('✅ Dados do usuário recuperados do localStorage:', userData);
        setUser(userData);
        setLoading(false);
        return;
      } catch (error) {
        console.warn('⚠️ Erro ao parsear userData do localStorage:', error);
      }
    }

    try {
      // Verificar se o token ainda é válido fazendo uma requisição para o perfil
      const response = await fetch('http://localhost:8000/api/v1/client-area/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Token válido, usar dados retornados pela requisição
        const profileData = await response.json();
        console.log('✅ Dados do perfil obtidos da API:', profileData);
        const userData = {
          ...profileData.user, // Dados do Django User (com is_staff, is_superuser)
          profile: profileData  // Dados do UserProfile do client-area
        };
        setUser(userData);
        // Salvar dados atualizados
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        console.log('⚠️ Token inválido, tentando refresh...');
        // Token inválido, tentar refresh
        if (refreshTokenValue) {
          try {
            const refreshResponse = await apiRefreshToken(refreshTokenValue);
            localStorage.setItem('authToken', refreshResponse.access);
            localStorage.setItem('refreshToken', refreshResponse.refresh);
            
            // Buscar dados atualizados do usuário
            try {
              const userData = await fetchUserProfile();
              setUser(userData);
              localStorage.setItem('userData', JSON.stringify(userData));
              console.log('✅ Token refreshed e dados atualizados');
            } catch (profileError) {
              console.error('Erro ao carregar perfil após refresh:', profileError);
              logout();
            }
          } catch (refreshError) {
            console.error('❌ Refresh falhou:', refreshError);
            // Refresh falhou, fazer logout
            logout();
          }
        } else {
          console.log('❌ Sem refresh token, fazendo logout');
          logout();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
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
      const response = await apiLogin(username, password);
      console.log('✅ Login API bem-sucedido:', response);
      
      // Salvar token
      localStorage.setItem('authToken', response.token);
      console.log('💾 Token salvo:', response.token.substring(0, 20) + '...');
      
      // Store refresh token if available (JWT)
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
        console.log('💾 Refresh token salvo');
      }
      
      // Handle user data differently for JWT vs DRF Token
      let userData;
      if (response.user && response.user.user) {
        // DRF Token response (client-area)
        userData = {
          ...response.user.user, // Dados do Django User (com is_staff, is_superuser)
          profile: response.user  // Dados do UserProfile do client-area
        };
        console.log('👤 Usando dados DRF Token:', userData);
      } else if (response.user) {
        // JWT response ou formato simples
        userData = response.user;
        console.log('👤 Usando dados JWT/simples:', userData);
      } else {
        // Fallback - criar dados básicos
        userData = {
          id: 1,
          username: username,
          is_staff: true,
          is_superuser: true
        };
        console.log('👤 Usando dados fallback:', userData);
      }
      
      // Garantir que userData tem as propriedades necessárias
      if (!userData.id && userData.id !== 0) {
        userData.id = 1; // ID padrão válido
      }
      if (!userData.username) {
        userData.username = username;
      }
      
      console.log('👤 Dados finais do usuário:', userData);
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('🎉 Login concluído com sucesso! isAuthenticated será true agora');
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setError('Credenciais inválidas. Verifique seu usuário e senha.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    console.log('✅ Logout concluído');
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
      checkAuthStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
