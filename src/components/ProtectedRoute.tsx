import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, UserX } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireStaff?: boolean;
  blockStaff?: boolean; // Nova prop para bloquear administradores
  fallbackPath?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireStaff = false,
  blockStaff = false, // Nova prop
  fallbackPath = '/login'
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isStaff, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Verificando acesso...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Verificar se requer autenticação
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Bloquear administradores do Portal de Comunidade
  if (blockStaff && isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar se requer privilégios de staff
  if (requireStaff && !isStaff) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <UserX className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Acesso Negado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Você não tem permissão para acessar esta área. 
                  {isAuthenticated 
                    ? ' Esta seção é restrita para administradores.'
                    : ' Faça login para continuar.'
                  }
                </p>
                <div className="flex flex-col gap-2">
                  {!isAuthenticated ? (
                    <Button asChild>
                      <a href="/login">
                        <Lock className="mr-2 h-4 w-4" />
                        Fazer Login
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <a href="/">Voltar ao Início</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
