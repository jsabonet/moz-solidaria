# Sistema RBAC - Moz Solidária Hub

## 📋 Visão Geral

O sistema RBAC (Role-Based Access Control) foi implementado com sucesso na plataforma Moz Solidária Hub, fornecendo controle granular de acesso e auditoria completa das ações dos usuários.

## 🏗️ Arquitetura do Sistema

### Backend (Django)

#### 1. Modelos de Dados (`backend/core/models.py`)

**AuditLog**
```python
- id: Primary key
- user: ForeignKey para User
- action: Tipo de ação (CREATE, UPDATE, DELETE, VIEW, LOGIN)
- resource_type: Tipo do recurso afetado
- resource_id: ID do recurso
- ip_address: Endereço IP do usuário
- user_agent: User agent do navegador
- timestamp: Data/hora da ação
- changes: JSONField com mudanças realizadas
- success: Boolean indicando sucesso/falha
- error_message: Mensagem de erro (se houver)
```

**UserProfile**
```python
- user: OneToOneField para User (related_name='profile')
- phone: CharField opcional para telefone
- address: TextField opcional para endereço
- date_of_birth: DateField para data de nascimento
- profile_picture: ImageField para foto de perfil
- department, position, location: Campos administrativos
- is_active_admin: Boolean para administradores ativos
- last_permission_change: Timestamp da última mudança de permissão
- admin_notes: TextField para notas administrativas
- last_activity: Timestamp da última atividade
- created_at, updated_at: Timestamps de criação e atualização
```

**LoginAttempt**
```python
- username: Nome do usuário da tentativa
- ip_address: IP da tentativa
- timestamp: Data/hora da tentativa
- success: Boolean de sucesso/falha
- user_agent: User agent usado
- failure_reason: Motivo da falha (se houver)
```

#### 2. Sistema de Permissões (`backend/core/permissions.py`)

**102 Permissões Organizadas em 6 Módulos:**

- **Sistema (17 permissões)**: Dashboard, logs, configurações, backups
- **Blog (19 permissões)**: Criação, edição, publicação, moderação
- **Projetos (20 permissões)**: Gestão completa de projetos e categorias
- **Comunidade (26 permissões)**: Voluntários, beneficiários, parceiros
- **Doações (10 permissões)**: Processamento e aprovação de doações
- **Relatórios (10 permissões)**: Visualização e exportação de dados

#### 3. Middlewares de Segurança (`backend/core/middleware.py`)

**AuditMiddleware**
- Registra automaticamente todas as ações dos usuários
- Captura IP, user agent e detalhes da requisição

**SecurityMiddleware**
- Monitora tentativas de login
- Implementa bloqueio por IP após falhas consecutivas
- Timeout automático de sessões (8 horas)

**PermissionLoggingMiddleware**
- Registra acessos negados por falta de permissão
- Monitora tentativas de acesso não autorizado

#### 4. Views RBAC (`backend/core/views.py`)

- `UserManagementView`: Gestão de usuários e grupos
- `audit_logs_view`: Visualização de logs de auditoria
- `system_stats_view`: Estatísticas do sistema
- `my_profile_view`: Perfil do usuário autenticado

### Frontend (React/TypeScript)

#### 1. Hook de Autenticação (`src/hooks/useAuth.ts`)

**Funcionalidades:**
```typescript
- login(username, password): Autenticação do usuário
- logout(): Logout e limpeza de dados
- hasPermission(permission): Verifica permissão específica
- hasAnyPermission(permissions): Verifica múltiplas permissões
- hasRole(role): Verifica papel/grupo do usuário
- getCurrentUser(): Dados do usuário atual
- refreshUserData(): Atualiza dados do usuário
```

#### 2. Componente PermissionGate (`src/components/PermissionGate.tsx`)

**Props:**
```typescript
- permissions?: string[]: Lista de permissões necessárias
- roles?: string[]: Lista de papéis necessários
- requireAll?: boolean: Requer todas as permissões (default: false)
- fallback?: ReactNode: Componente alternativo se sem acesso
- children: ReactNode: Componente a ser renderizado se autorizado
```

#### 3. Rota Protegida (`src/components/ProtectedRoute.tsx`)

Integrada com RBAC para controlar acesso a rotas baseado em permissões.

#### 4. Constantes de Permissões (`src/constants/permissions.ts`)

Todas as 102 permissões organizadas em módulos com funções utilitárias.

## 👥 Perfis de Usuário

### 1. Super Admin (32 permissões)
- Acesso total ao sistema
- Gestão de usuários e grupos
- Visualização de logs e auditoria
- Configurações avançadas do sistema

### 2. Gestor de Blog (19 permissões)
- Criação e edição de posts
- Gestão de categorias e tags
- Moderação de comentários
- Publicação de conteúdo

### 3. Gestor de Projetos (20 permissões)
- Criação e gestão de projetos
- Controle de categorias de projetos
- Acompanhamento de marcos
- Gestão de evidências

### 4. Gestor de Comunidade (26 permissões)
- Gestão de voluntários
- Administração de beneficiários
- Controle de parcerias
- Aprovação de inscrições

### 5. Visualizador (16 permissões)
- Acesso limitado para visualização
- Relatórios básicos
- Consulta de informações

## 🔧 Configurações do Sistema

### Settings Django (`backend/moz_solidaria_api/settings.py`)

```python
# Middlewares RBAC
MIDDLEWARE = [
    'core.middleware.SecurityMiddleware',
    'core.middleware.AuditMiddleware', 
    'core.middleware.PermissionLoggingMiddleware',
    # ... outros middlewares
]

# Configurações RBAC
RBAC_SETTINGS = {
    'ENABLE_AUDIT_LOG': True,
    'ENABLE_LOGIN_ATTEMPTS': True,
    'MAX_LOGIN_ATTEMPTS': 5,
    'LOGIN_ATTEMPT_TIMEOUT': 900,  # 15 minutos
    'SESSION_TIMEOUT': 28800,  # 8 horas
    'ENABLE_IP_BLOCKING': True,
}

# Sistema de Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'audit_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'audit.log',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'security.log',
        },
    },
    'loggers': {
        'audit': {'handlers': ['audit_file'], 'level': 'INFO'},
        'security': {'handlers': ['security_file'], 'level': 'WARNING'},
    },
}
```

### URLs (`backend/moz_solidaria_api/urls.py`)

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/rbac/', include('core.permissions_urls')),
    # ... outras URLs
]
```

## 📊 Endpoints da API RBAC

### Autenticação e Perfil
- `GET /api/v1/rbac/my-profile/`: Dados do usuário atual
- `POST /api/v1/rbac/refresh-permissions/`: Atualizar permissões

### Gestão de Usuários (Apenas Super Admin)
- `GET /api/v1/rbac/users/`: Lista de usuários
- `POST /api/v1/rbac/users/`: Criar usuário
- `PUT /api/v1/rbac/users/{id}/`: Editar usuário
- `DELETE /api/v1/rbac/users/{id}/`: Deletar usuário

### Auditoria e Logs
- `GET /api/v1/rbac/audit-logs/`: Logs de auditoria
- `GET /api/v1/rbac/login-attempts/`: Tentativas de login
- `GET /api/v1/rbac/system-stats/`: Estatísticas do sistema

## 🔒 Segurança Implementada

### 1. Controle de Acesso
- Permissões granulares (102 permissões)
- Grupos de usuários organizados
- Controle baseado em papéis (RBAC)

### 2. Auditoria Completa
- Log de todas as ações dos usuários
- Rastreamento de mudanças em dados
- Monitoramento de tentativas de acesso

### 3. Segurança de Sessão
- Timeout automático (8 horas)
- Bloqueio por IP após tentativas falhas
- Monitoramento de user agents

### 4. Proteção contra Ataques
- Rate limiting para tentativas de login
- Validação de permissões em tempo real
- Logs de segurança detalhados

## 🚀 Implementação no Dashboard

### Controle de Abas
Cada aba do dashboard é protegida por permissões específicas:

```tsx
<PermissionGate permissions={['blog.view_posts', 'blog.create_post']}>
  <TabsTrigger value="blog">Blog</TabsTrigger>
</PermissionGate>
```

### Informações do Usuário
O dashboard exibe informações contextuais do usuário:
- Nome e grupos do usuário
- Total de permissões ativas
- Controles baseados em papel

### Cards Estatísticos Protegidos
Cada estatística é exibida apenas para usuários com permissões adequadas.

## 📁 Estrutura de Arquivos

```
backend/
├── core/
│   ├── models.py              # Modelos RBAC
│   ├── permissions.py         # Definições de permissões
│   ├── decorators.py         # Decoradores de permissão
│   ├── middleware.py         # Middlewares de segurança
│   ├── views.py              # Views RBAC
│   ├── permissions_urls.py   # URLs RBAC
│   └── admin.py              # Configuração do admin
├── moz_solidaria_api/
│   ├── settings.py           # Configurações Django
│   └── urls.py               # URLs principais
└── logs/                     # Diretório de logs
    ├── audit.log
    ├── security.log
    └── django.log

frontend/src/
├── hooks/
│   └── useAuth.ts            # Hook de autenticação
├── components/
│   ├── PermissionGate.tsx    # Componente de controle
│   └── ProtectedRoute.tsx    # Rota protegida
├── constants/
│   └── permissions.ts        # Constantes de permissões
└── pages/
    └── Dashboard.tsx         # Dashboard integrado com RBAC
```

## 🔄 Fluxo de Autenticação

1. **Login**: Usuário fornece credenciais
2. **Validação**: Sistema verifica no banco de dados
3. **Token**: Geração de token de autenticação
4. **Permissões**: Carregamento das permissões do usuário
5. **Sessão**: Criação de sessão com timeout
6. **Auditoria**: Log da ação de login

## 📝 Comandos de Gestão

### Criar Grupos e Permissões
```bash
python manage.py create_rbac_groups
```

### Listar Usuários e Permissões
```bash
python manage.py list_user_permissions <username>
```

### Backup de Configurações RBAC
```bash
python manage.py backup_rbac_config
```

## 🎯 Status da Implementação

✅ **Concluído:**
- Modelos de dados completos
- Sistema de permissões (102 permissões)
- Middlewares de segurança
- Views e endpoints RBAC
- Componentes frontend
- Integração no Dashboard
- Sistema de auditoria
- Logging e monitoramento

✅ **Testado:**
- Autenticação e autorização
- Controle de acesso baseado em permissões
- Logs de auditoria funcionais
- Dashboard com controles RBAC

## 🔮 Próximos Passos

1. **Testes de Performance**: Otimização de consultas de permissões
2. **Interface de Gestão**: Criação de interface para gestão de usuários
3. **Relatórios de Segurança**: Dashboard específico para auditoria
4. **Integração 2FA**: Implementação de autenticação de dois fatores
5. **API Rate Limiting**: Implementação de controle de taxa

---

## 📞 Suporte

Para questões sobre o sistema RBAC, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

**Sistema implementado com sucesso! 🎉**
