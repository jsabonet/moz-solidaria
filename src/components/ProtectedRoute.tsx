import { ReactNode, ComponentType } from 'react';
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
  // Novas props para RBAC
  requiredPermission?: string;
  requiredPermissions?: string[];
  requiredRole?: string;
  requireAll?: boolean;
  fallbackComponent?: ComponentType;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireStaff = false,
  blockStaff = false,
  fallbackPath = '/login',
  requiredPermission,
  requiredPermissions,
  requiredRole,
  requireAll = false,
  fallbackComponent: FallbackComponent
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isStaff, loading } = useAuth();
  const location = useLocation();

  // Verificar se o hook tem as funções RBAC
  const hasPermission = (user as any)?.hasPermission || (() => false);
  const hasAnyPermission = (user as any)?.hasAnyPermission || (() => false);
  const hasRole = (user as any)?.hasRole || (() => false);

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

  // === VERIFICAÇÕES RBAC ===

  // Verificar permissão específica
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return FallbackComponent ? (
      <FallbackComponent />
    ) : (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Lock className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Permissão Insuficiente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  Você não tem a permissão necessária para acessar esta página.
                </p>
                <p className="text-sm text-muted-foreground">
                  Permissão necessária: <code className="bg-muted px-2 py-1 rounded text-xs">{requiredPermission}</code>
                </p>
                <Button variant="outline" asChild>
                  <a href="/dashboard">Voltar ao Dashboard</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Verificar lista de permissões
  if (requiredPermissions && requiredPermissions.length > 0) {
    let hasAccess = false;
    
    if (requireAll) {
      hasAccess = requiredPermissions.every(perm => hasPermission(perm));
    } else {
      hasAccess = hasAnyPermission(requiredPermissions);
    }

    if (!hasAccess) {
      return FallbackComponent ? (
        <FallbackComponent />
      ) : (
        <div className="min-h-screen">
          <Header />
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <Lock className="h-6 w-6 text-destructive" />
                  </div>
                  <CardTitle className="text-destructive">Permissões Insuficientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    Você não tem as permissões necessárias para acessar esta página.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Permissões necessárias:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {requiredPermissions.map(perm => (
                        <li key={perm}>
                          <code className="bg-muted px-2 py-1 rounded text-xs">{perm}</code>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs">
                      {requireAll ? 'Todas as permissões são necessárias' : 'Pelo menos uma permissão é necessária'}
                    </p>
                  </div>
                  <div className="text-center">
                    <Button variant="outline" asChild>
                      <a href="/dashboard">Voltar ao Dashboard</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <Footer />
        </div>
      );
    }
  }

  // Verificar papel/grupo
  if (requiredRole && !hasRole(requiredRole)) {
    return FallbackComponent ? (
      <FallbackComponent />
    ) : (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <UserX className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Papel Insuficiente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  Você não tem o papel necessário para acessar esta página.
                </p>
                <p className="text-sm text-muted-foreground">
                  Papel necessário: <code className="bg-muted px-2 py-1 rounded text-xs">{requiredRole}</code>
                </p>
                <Button variant="outline" asChild>
                  <a href="/dashboard">Voltar ao Dashboard</a>
                </Button>
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
