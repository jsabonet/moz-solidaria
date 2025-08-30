# INTEGRAÇÃO FRONTEND - SISTEMA RBAC

## 🎯 COMO INTEGRAR O SISTEMA DE PERMISSÕES NO FRONTEND

### 1. **Hook de Autenticação e Permissões**

Crie um hook personalizado para gerenciar permissões:

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, useContext, createContext } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  groups: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/rbac/my-profile/', {
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
          groups: userData.groups,
          permissions: userData.permissions,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasRole = (role: string): boolean => {
    return user?.groups.includes(role) || false;
  };

  const value = {
    user,
    permissions: user?.permissions || [],
    hasPermission,
    hasAnyPermission,
    hasRole,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 2. **Componente de Proteção de Rotas**

```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requiredRole?: string;
  fallbackComponent?: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  requiredRole,
  fallbackComponent: FallbackComponent,
}) => {
  const { user, hasPermission, hasAnyPermission, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permissão específica
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return FallbackComponent ? <FallbackComponent /> : <div>Acesso negado</div>;
  }

  // Verificar qualquer permissão da lista
  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return FallbackComponent ? <FallbackComponent /> : <div>Acesso negado</div>;
  }

  // Verificar papel/grupo
  if (requiredRole && !hasRole(requiredRole)) {
    return FallbackComponent ? <FallbackComponent /> : <div>Acesso negado</div>;
  }

  return <>{children}</>;
};
```

### 3. **Componente Condicional de Permissões**

```typescript
// src/components/PermissionGate.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  role,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasRole } = useAuth();

  // Verificar permissão específica
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Verificar qualquer permissão da lista
  if (permissions && !hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  // Verificar papel/grupo
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

### 4. **Dashboard.tsx Atualizado com Permissões**

```typescript
// src/components/Dashboard.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { PermissionGate } from './PermissionGate';

export const Dashboard: React.FC = () => {
  const { user, hasPermission, hasRole } = useAuth();

  return (
    <div className="dashboard">
      <h1>Dashboard - Moz Solidária Hub</h1>
      
      {/* Seção de Usuários - Apenas para Super Admin e quem pode gerenciar usuários */}
      <PermissionGate permission="users.view_all">
        <section className="users-section">
          <h2>Gestão de Usuários</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <PermissionGate permission="users.create">
              <button className="btn btn-primary">Criar Usuário</button>
            </PermissionGate>
            
            <PermissionGate permission="users.change_permissions">
              <button className="btn btn-secondary">Gerenciar Permissões</button>
            </PermissionGate>
            
            <PermissionGate permission="system.view_logs">
              <button className="btn btn-info">Ver Logs de Auditoria</button>
            </PermissionGate>
            
          </div>
        </section>
      </PermissionGate>

      {/* Seção do Blog - Para Gestores de Blog */}
      <PermissionGate permissions={['blog.create_post', 'blog.edit_own_post', 'blog.view_posts']}>
        <section className="blog-section">
          <h2>Gestão do Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <PermissionGate permission="blog.create_post">
              <button className="btn btn-success">Criar Post</button>
            </PermissionGate>
            
            <PermissionGate permission="blog.edit_any_post">
              <button className="btn btn-warning">Editar Qualquer Post</button>
            </PermissionGate>
            
            <PermissionGate permission="blog.manage_categories">
              <button className="btn btn-info">Gerenciar Categorias</button>
            </PermissionGate>
            
            <PermissionGate permission="blog.view_analytics">
              <button className="btn btn-primary">Analytics do Blog</button>
            </PermissionGate>
            
          </div>
        </section>
      </PermissionGate>

      {/* Seção de Projetos - Para Gestores de Projetos */}
      <PermissionGate permissions={['projects.create', 'projects.view_all', 'projects.edit_own']}>
        <section className="projects-section">
          <h2>Gestão de Projetos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <PermissionGate permission="projects.create">
              <button className="btn btn-success">Criar Projeto</button>
            </PermissionGate>
            
            <PermissionGate permission="projects.approve">
              <button className="btn btn-warning">Aprovar Projetos</button>
            </PermissionGate>
            
            <PermissionGate permission="projects.manage_budget">
              <button className="btn btn-info">Gerenciar Orçamento</button>
            </PermissionGate>
            
            <PermissionGate permission="projects.generate_reports">
              <button className="btn btn-primary">Relatórios de Projetos</button>
            </PermissionGate>
            
          </div>
        </section>
      </PermissionGate>

      {/* Seção da Comunidade - Para Gestores de Comunidade */}
      <PermissionGate permissions={['community.approve_volunteers', 'community.view_volunteer_list']}>
        <section className="community-section">
          <h2>Gestão da Comunidade</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <PermissionGate permission="community.approve_volunteers">
              <button className="btn btn-success">Aprovar Voluntários</button>
            </PermissionGate>
            
            <PermissionGate permission="community.register_beneficiaries">
              <button className="btn btn-info">Registrar Beneficiários</button>
            </PermissionGate>
            
            <PermissionGate permission="community.manage_partnerships">
              <button className="btn btn-warning">Gerenciar Parcerias</button>
            </PermissionGate>
            
            <PermissionGate permission="community.generate_community_reports">
              <button className="btn btn-primary">Relatórios da Comunidade</button>
            </PermissionGate>
            
          </div>
        </section>
      </PermissionGate>

      {/* Seção de Relatórios - Para todos com permissões básicas */}
      <PermissionGate permissions={['reports.view_summary_reports', 'reports.view_public_analytics']}>
        <section className="reports-section">
          <h2>Centro de Relatórios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <PermissionGate permission="reports.view_summary_reports">
              <button className="btn btn-info">Relatórios Resumidos</button>
            </PermissionGate>
            
            <PermissionGate permission="reports.generate_all">
              <button className="btn btn-warning">Todos os Relatórios</button>
            </PermissionGate>
            
            <PermissionGate permission="reports.export_sensitive">
              <button className="btn btn-danger">Exportar Dados Sensíveis</button>
            </PermissionGate>
            
          </div>
        </section>
      </PermissionGate>

      {/* Informações do Usuário */}
      <section className="user-info mt-8 p-4 bg-gray-100 rounded">
        <h3>Meu Perfil</h3>
        <p><strong>Usuário:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Grupos:</strong> {user?.groups.join(', ')}</p>
        <p><strong>Permissões:</strong> {user?.permissions.length} atribuídas</p>
        
        {/* Mostrar papel específico */}
        {hasRole('Super Admin') && <span className="badge badge-danger">Super Administrador</span>}
        {hasRole('Gestor de Blog') && <span className="badge badge-primary">Gestor de Blog</span>}
        {hasRole('Gestor de Projetos') && <span className="badge badge-success">Gestor de Projetos</span>}
        {hasRole('Gestor de Comunidade') && <span className="badge badge-info">Gestor de Comunidade</span>}
        {hasRole('Visualizador') && <span className="badge badge-secondary">Visualizador</span>}
      </section>
    </div>
  );
};
```

### 5. **Configuração de Rotas com Proteção**

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requiredPermission="users.view_all">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/blog/create" 
            element={
              <ProtectedRoute requiredPermission="blog.create_post">
                <CreateBlogPost />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/projects/create" 
            element={
              <ProtectedRoute requiredPermission="projects.create">
                <CreateProject />
              </ProtectedRoute>
            } 
          />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 6. **Service para Chamadas da API**

```typescript
// src/services/rbacService.ts
import { apiCall } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  groups: string[];
  permissions: string[];
  profile: {
    phone?: string;
    department?: string;
    position?: string;
    location?: string;
  };
}

export const rbacService = {
  // Obter perfil do usuário
  async getMyProfile(): Promise<User> {
    return apiCall('/api/rbac/my-profile/');
  },

  // Listar usuários (apenas para admins)
  async getUsers(): Promise<User[]> {
    const response = await apiCall('/api/rbac/users/');
    return response.users;
  },

  // Criar usuário
  async createUser(userData: any): Promise<any> {
    return apiCall('/api/rbac/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Obter logs de auditoria
  async getAuditLogs(page = 1, filters: any = {}): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      ...filters,
    });
    return apiCall(`/api/rbac/audit-logs/?${params}`);
  },

  // Obter estatísticas do sistema
  async getSystemStats(): Promise<any> {
    return apiCall('/api/rbac/system-stats/');
  },

  // Obter grupos e permissões
  async getGroupsAndPermissions(): Promise<any> {
    return apiCall('/api/rbac/groups-permissions/');
  },
};
```

### 7. **Constantes de Permissões**

```typescript
// src/constants/permissions.ts
export const PERMISSIONS = {
  // Sistema
  SYSTEM: {
    MANAGE_SETTINGS: 'system.manage_settings',
    VIEW_LOGS: 'system.view_logs',
    BACKUP_RESTORE: 'system.backup_restore',
    MAINTENANCE_MODE: 'system.maintenance_mode',
  },

  // Usuários
  USERS: {
    CREATE: 'users.create',
    EDIT: 'users.edit',
    DELETE: 'users.delete',
    VIEW_ALL: 'users.view_all',
    CHANGE_PERMISSIONS: 'users.change_permissions',
    IMPERSONATE: 'users.impersonate',
  },

  // Blog
  BLOG: {
    CREATE_POST: 'blog.create_post',
    EDIT_OWN_POST: 'blog.edit_own_post',
    EDIT_ANY_POST: 'blog.edit_any_post',
    DELETE_ANY_POST: 'blog.delete_any_post',
    PUBLISH_POST: 'blog.publish_post',
    MANAGE_CATEGORIES: 'blog.manage_categories',
    VIEW_ANALYTICS: 'blog.view_analytics',
  },

  // Projetos
  PROJECTS: {
    CREATE: 'projects.create',
    EDIT_ANY: 'projects.edit_any',
    DELETE_ANY: 'projects.delete_any',
    APPROVE: 'projects.approve',
    MANAGE_BUDGET: 'projects.manage_budget',
    GENERATE_REPORTS: 'projects.generate_reports',
  },

  // Comunidade
  COMMUNITY: {
    APPROVE_VOLUNTEERS: 'community.approve_volunteers',
    REGISTER_BENEFICIARIES: 'community.register_beneficiaries',
    MANAGE_PARTNERSHIPS: 'community.manage_partnerships',
    VIEW_SENSITIVE_DATA: 'community.view_sensitive_data',
  },

  // Relatórios
  REPORTS: {
    GENERATE_ALL: 'reports.generate_all',
    EXPORT_SENSITIVE: 'reports.export_sensitive',
    VIEW_FINANCIAL: 'reports.view_financial',
    VIEW_SUMMARY: 'reports.view_summary_reports',
  },
} as const;

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  BLOG_MANAGER: 'Gestor de Blog',
  PROJECT_MANAGER: 'Gestor de Projetos',
  COMMUNITY_MANAGER: 'Gestor de Comunidade',
  VIEWER: 'Visualizador',
} as const;
```

### 8. **Exemplo de Uso com Alertas**

```typescript
// src/components/PermissionAlert.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const PermissionAlert: React.FC = () => {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  const criticalPermissions = [
    'users.create',
    'system.manage_settings',
    'reports.export_sensitive',
  ];

  const hasCriticalPermissions = criticalPermissions.some(perm => 
    hasPermission(perm)
  );

  if (hasCriticalPermissions) {
    return (
      <div className="alert alert-warning">
        ⚠️ Você possui permissões administrativas. Use com responsabilidade!
      </div>
    );
  }

  return null;
};
```

---

## ✅ RESUMO DA INTEGRAÇÃO

O sistema RBAC está totalmente integrado e pronto para uso no frontend com:

1. **Hook personalizado** para gerenciamento de estado de autenticação
2. **Componentes de proteção** para rotas e elementos condicionais
3. **Dashboard adaptativo** baseado em permissões
4. **Service layer** para comunicação com a API
5. **Constantes** para facilitar o uso de permissões
6. **Exemplos práticos** de implementação

O sistema permite controle granular de acesso em toda a aplicação, garantindo que cada usuário veja apenas as funcionalidades para as quais tem permissão.
