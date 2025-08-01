import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { login as apiLogin } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há um token salvo no localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Aqui você poderia validar o token com o backend
      // Por enquanto, vamos assumir que o token é válido
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  // Adicione: se não houver usuário autenticado, defina um usuário anônimo
  useEffect(() => {
    if (!user && !loading) {
      setUser({
        id: 0,
        username: "anonimo",
        email: "anonimo@mozsolidaria.org"
      });
    }
    // eslint-disable-next-line
  }, [loading]);

  const login = async (username: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiLogin(username, password);
      localStorage.setItem('authToken', response.access);
      
      // Simulando dados do usuário (em um caso real, você obteria do backend)
      const userData = {
        id: 1,
        username: username,
        email: `${username}@example.com`
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      setError('Credenciais inválidas. Verifique seu usuário e senha.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
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
