# Proposta de Níveis de Permissão Administrativos - Dashboard Moz Solidária Hub

## 📋 Análise da Natureza do Projeto

O **Moz Solidária Hub** é uma plataforma de impacto social em Moçambique que conecta:
- **Doadores**: Pessoas/organizações que contribuem financeiramente
- **Voluntários**: Indivíduos que oferecem tempo e habilidades
- **Beneficiários**: Comunidades e pessoas que recebem ajuda
- **Parceiros**: Organizações colaboradoras

## 🏗️ Estrutura de Permissões Proposta

### 1. **Super Administrador** (`is_superuser = True`)
**Acesso Total ao Sistema**

#### Permissões Dashboard:
- ✅ **Visão Completa**: Todas as abas e funcionalidades
- ✅ **Gestão de Usuários**: Criar/editar/deletar qualquer usuário
- ✅ **Configurações do Sistema**: Modificar parâmetros globais
- ✅ **Auditoria e Logs**: Acesso a registros completos
- ✅ **Backup e Recuperação**: Exportações críticas do sistema

#### Acesso no Dashboard.tsx:
```typescript
// Todas as abas visíveis
- Overview (Estatísticas Gerais)
- Blog (Gestão de Conteúdo)
- Projects (Todos os Projetos)
- Community (Gestão Completa)
  - Volunteers (CRUD completo)
  - Beneficiaries (CRUD completo) 
  - Partners (CRUD completo)
- Reports (Relatórios Executivos)
- Settings (Configurações do Sistema)
```

### 2. **Administrador Regional** (`is_staff = True + profile.user_type = 'admin_regional'`)
**Gestão Operacional por Região**

#### Permissões Dashboard:
- ✅ **Projetos**: CRUD completo para sua região
- ✅ **Doações**: Monitoramento e aprovação
- ✅ **Beneficiários**: Gestão local (verificação, cadastro)
- ✅ **Voluntários**: Coordenação regional
- ✅ **Relatórios**: Dados da região + consolidados
- ❌ **Configurações**: Apenas configurações locais

#### Acesso no Dashboard.tsx:
```typescript
// Abas visíveis com restrições regionais
- Overview (Dados da região)
- Projects (Projetos da região)
- Community (Gestão regional)
  - Volunteers (CRUD na região)
  - Beneficiaries (CRUD na região)
  - Partners (Visualização + aprovação)
- Reports (Relatórios regionais)
```

### 3. **Coordenador de Projetos** (`is_staff = True + profile.user_type = 'project_coordinator'`)
**Foco em Gestão de Projetos**

#### Permissões Dashboard:
- ✅ **Projetos**: CRUD completo
- ✅ **Categorias**: Gestão de categorias de projetos
- ✅ **Beneficiários**: Associação a projetos
- ✅ **Voluntários**: Coordenação para projetos
- ✅ **Relatórios**: Impacto e progresso dos projetos
- ❌ **Doações**: Apenas visualização
- ❌ **Configurações**: Sem acesso

#### Acesso no Dashboard.tsx:
```typescript
// Foco em projetos e impacto
- Overview (Métricas de projetos)
- Projects (CRUD completo)
- Project Categories (Gestão de categorias)
- Community (Coordenação limitada)
  - Volunteers (Associação a projetos)
  - Beneficiaries (Associação a projetos)
- Reports (Relatórios de impacto)
```

### 4. **Gerente Financeiro** (`is_staff = True + profile.user_type = 'financial_manager'`)
**Foco em Doações e Finanças**

#### Permissões Dashboard:
- ✅ **Doações**: CRUD completo + aprovações
- ✅ **Relatórios**: Financeiros e contábeis
- ✅ **Projetos**: Visualização (contexto financeiro)
- ✅ **Beneficiários**: Visualização (impacto das doações)
- ❌ **Voluntários**: Apenas visualização
- ❌ **Blog**: Sem acesso
- ❌ **Configurações**: Apenas preferências financeiras

#### Acesso no Dashboard.tsx:
```typescript
// Foco financeiro
- Overview (Métricas financeiras)
- Projects (Visualização + orçamentos)
- Community (Visualização limitada)
  - Donations (CRUD completo)
  - Beneficiaries (Impacto financeiro)
- Reports (Relatórios financeiros)
```

### 5. **Moderador de Conteúdo** (`is_staff = True + profile.user_type = 'content_moderator'`)
**Gestão de Comunicação e Blog**

#### Permissões Dashboard:
- ✅ **Blog**: CRUD completo
- ✅ **Comunicação**: Gestão de mensagens
- ✅ **Projetos**: Visualização (para contexto do conteúdo)
- ✅ **Relatórios**: Métricas de engajamento
- ❌ **Doações**: Apenas visualização
- ❌ **Configurações**: Sem acesso

#### Acesso no Dashboard.tsx:
```typescript
// Foco em conteúdo e comunicação
- Overview (Métricas de engajamento)
- Blog (CRUD completo)
- Projects (Visualização)
- Community (Comunicação)
  - Partners (Comunicação)
- Reports (Métricas de conteúdo)
```

## 🔐 Implementação no Dashboard.tsx

### 1. **Hook de Permissões**
```typescript
// src/hooks/use-permissions.tsx
export const usePermissions = () => {
  const { user } = useAuth();
  
  const permissions = {
    isSuperAdmin: user?.is_superuser,
    isStaff: user?.is_staff,
    userType: user?.profile?.user_type,
    
    // Permissões calculadas
    canManageUsers: user?.is_superuser,
    canManageProjects: user?.is_staff,
    canManageFinances: user?.is_superuser || user?.profile?.user_type === 'financial_manager',
    canManageContent: user?.is_staff && ['content_moderator', 'admin_regional'].includes(user?.profile?.user_type),
    canViewReports: user?.is_staff,
    canExportData: user?.is_staff,
    canManageSettings: user?.is_superuser || user?.profile?.user_type === 'admin_regional'
  };
  
  return permissions;
};
```

### 2. **Componente de Proteção de Aba**
```typescript
// src/components/ProtectedTab.tsx
interface ProtectedTabProps {
  requiredPermission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedTab: React.FC<ProtectedTabProps> = ({ 
  requiredPermission, 
  children, 
  fallback 
}) => {
  const permissions = usePermissions();
  
  if (!permissions[requiredPermission]) {
    return fallback || <div>Acesso negado</div>;
  }
  
  return <>{children}</>;
};
```

### 3. **Dashboard com Permissões**
```typescript
// src/pages/Dashboard.tsx (estrutura atualizada)
const Dashboard: React.FC = () => {
  const permissions = usePermissions();
  
  // Definir abas baseadas em permissões
  const availableTabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3, permission: 'isStaff' },
    { id: 'blog', label: 'Blog', icon: FileText, permission: 'canManageContent' },
    { id: 'projects', label: 'Projetos', icon: FolderOpen, permission: 'canManageProjects' },
    { id: 'community', label: 'Comunidade', icon: Users, permission: 'isStaff' },
    { id: 'reports', label: 'Relatórios', icon: PieChart, permission: 'canViewReports' },
    { id: 'settings', label: 'Configurações', icon: Settings, permission: 'canManageSettings' }
  ].filter(tab => permissions[tab.permission]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {availableTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Conteúdo das abas com proteção */}
        <ProtectedTab requiredPermission="isStaff">
          <TabsContent value="overview">
            <OverviewTab permissions={permissions} />
          </TabsContent>
        </ProtectedTab>
        
        <ProtectedTab requiredPermission="canManageContent">
          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>
        </ProtectedTab>
        
        <ProtectedTab requiredPermission="canManageProjects">
          <TabsContent value="projects">
            <ProjectManagement permissions={permissions} />
          </TabsContent>
        </ProtectedTab>
        
        <ProtectedTab requiredPermission="isStaff">
          <TabsContent value="community">
            <CommunityManagement permissions={permissions} />
          </TabsContent>
        </ProtectedTab>
        
        <ProtectedTab requiredPermission="canViewReports">
          <TabsContent value="reports">
            <ReportsCenter permissions={permissions} />
          </TabsContent>
        </ProtectedTab>
        
        <ProtectedTab requiredPermission="canManageSettings">
          <TabsContent value="settings">
            <SystemSettings permissions={permissions} />
          </TabsContent>
        </ProtectedTab>
      </Tabs>
    </div>
  );
};
```

## 📊 Tabela de Permissões por Funcionalidade

| Funcionalidade | Super Admin | Admin Regional | Coord. Projetos | Ger. Financeiro | Moderador |
|---|---|---|---|---|---|
| **Usuários** | CRUD | Read | Read | Read | Read |
| **Projetos** | CRUD | CRUD (região) | CRUD | Read | Read |
| **Doações** | CRUD | Read + Approve | Read | CRUD | Read |
| **Voluntários** | CRUD | CRUD (região) | Coordinate | Read | Read |
| **Beneficiários** | CRUD | CRUD (região) | Associate | Read | Read |
| **Blog** | CRUD | Read | Read | Read | CRUD |
| **Relatórios** | All | Regional | Projects | Financial | Content |
| **Configurações** | All | Regional | None | Financial | None |

## 🚀 Benefícios da Implementação

1. **Segurança**: Cada usuário acessa apenas o necessário
2. **Escalabilidade**: Fácil adição de novos níveis
3. **Auditoria**: Rastreamento de ações por nível
4. **Performance**: Carregamento otimizado por permissão
5. **UX**: Interface limpa e relevante para cada usuário

## 🛠️ Próximos Passos

1. **Implementar hook de permissões**
2. **Criar componente ProtectedTab**
3. **Atualizar Dashboard.tsx com sistema de permissões**
4. **Testar cada nível de acesso**
5. **Implementar auditoria de ações**

---

**Esta estrutura garante que o Moz Solidária Hub tenha um sistema robusto de permissões adequado à natureza social do projeto.**
