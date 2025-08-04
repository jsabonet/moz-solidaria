# Sistema de Área do Cliente - Moz Solidária

## Visão Geral

O sistema de área do cliente da Moz Solidária é uma plataforma completa que permite aos utilizadores gerir as suas atividades, acompanhar o impacto das suas ações e conectar-se com a comunidade. O sistema suporta quatro tipos de perfis diferentes:

- **Doadores**: Gerem doações e acompanham o impacto
- **Voluntários**: Encontram oportunidades e gerem atividades
- **Beneficiários**: Acedem a apoio e acompanham progresso
- **Parceiros**: Gerem parcerias e projetos

## Funcionalidades Implementadas

### ✅ Frontend React Completo

- **Área do Cliente Principal** (`/client-area`)
  - Interface com abas para Dashboard, Notificações, Perfil e Configurações
  - Detecção automática do tipo de utilizador
  - Navegação responsiva e intuitiva

- **Dashboards Especializados**
  - `DonorDashboard`: Estatísticas de doações, metas mensais, causas favoritas
  - `VolunteerDashboard`: Horas de voluntariado, oportunidades, competências
  - `BeneficiaryDashboard`: Ajuda recebida, pedidos ativos, progresso
  - `PartnerDashboard`: Projetos, métricas de impacto, recursos

- **Sistema de Notificações**
  - Centro de notificações com filtragem
  - Marcar como lido/não lido
  - Configurações de preferências

- **Gestão de Perfil**
  - Edição de informações pessoais
  - Configurações de comunicação
  - Definições de segurança

- **Sistema de Matching**
  - Conexão entre voluntários e necessidades
  - Criação e aceitação de pedidos
  - Filtragem por competências e localização

### ✅ Camada de API

- **Integração Backend** (`src/lib/clientAreaApi.ts`)
  - Gestão de perfis de utilizadores
  - Sistema de notificações
  - Matching entre utilizadores
  - Autenticação JWT

### ✅ Sistema de Autenticação

- **Página de Autenticação** (`/login`)
  - Login e registo integrados
  - Suporte para múltiplos tipos de utilizador
  - Validação de formulários
  - Redirecionamento inteligente

### ✅ PWA (Progressive Web App)

- **Capacidades Móveis**
  - Service Worker para cache offline
  - Manifest para instalação nativa
  - Prompt de instalação automático
  - Otimização para dispositivos móveis

## Estrutura do Projeto

```
src/
├── pages/
│   ├── ClientArea.tsx          # Página principal da área do cliente
│   └── AuthPage.tsx            # Página de login/registo
├── components/
│   ├── clientArea/
│   │   ├── DonorDashboard.tsx
│   │   ├── VolunteerDashboard.tsx
│   │   ├── BeneficiaryDashboard.tsx
│   │   ├── PartnerDashboard.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── ProfileSettings.tsx
│   │   └── MatchingSystem.tsx
│   ├── QuickAccessSection.tsx  # Seção de acesso rápido na homepage
│   └── PWAInstallPrompt.tsx    # Prompt de instalação PWA
├── lib/
│   └── clientAreaApi.ts        # API layer para área do cliente
├── types/
│   └── clientArea.ts           # Definições TypeScript
└── hooks/
    └── usePWA.ts               # Hook para funcionalidades PWA
```

## Como Usar

### 1. Configuração Inicial

```bash
# Instalar dependências
npm install

# Executar o servidor de desenvolvimento
npm run dev
```

### 2. Navegação do Sistema

1. **Registo/Login**: Acesse `/login` para criar conta ou fazer login
2. **Área do Cliente**: Após autenticação, acesse `/client-area`
3. **Dashboards**: O sistema detecta automaticamente o tipo de utilizador
4. **Perfil**: Configure suas informações e preferências
5. **Matching**: Use o sistema para encontrar conexões relevantes

### 3. Tipos de Utilizador

#### Doador
- Visualiza estatísticas de doações
- Define metas mensais
- Explora causas favoritas
- Faz novas doações

#### Voluntário
- Vê horas de voluntariado
- Encontra oportunidades
- Gere competências
- Aceita pedidos de matching

#### Beneficiário
- Acompanha ajuda recebida
- Submete pedidos de apoio
- Vê progresso das necessidades
- Conecta-se com voluntários

#### Parceiro
- Gere projetos ativos
- Visualiza métricas de impacto
- Controla recursos disponíveis
- Estabelece parcerias

### 4. Funcionalidades PWA

O sistema funciona como uma aplicação móvel nativa:

- **Instalação**: Prompt automático para instalar no dispositivo
- **Offline**: Funcionalidade básica disponível sem internet
- **Notificações**: Alertas push (requer configuração backend)
- **Performance**: Cache inteligente para carregamento rápido

## Integração com Backend

### Endpoints Esperados

```typescript
// Autenticação
POST /api/auth/login/
POST /api/auth/register/

// Perfis de Utilizador
GET /api/client-area/profile/
PUT /api/client-area/profile/

// Dashboards
GET /api/client-area/dashboard/stats/

// Notificações
GET /api/client-area/notifications/
POST /api/client-area/notifications/{id}/mark-read/

// Sistema de Matching
GET /api/client-area/matching/requests/
POST /api/client-area/matching/requests/
POST /api/client-area/matching/requests/{id}/accept/

// Dados Auxiliares
GET /api/client-area/causes/
GET /api/client-area/skills/
```

### Modelos de Dados

O frontend espera que o backend forneça dados nos formatos definidos em `src/types/clientArea.ts`:

- `UserProfile`: Perfil completo do utilizador
- `DashboardStats`: Estatísticas do dashboard
- `Notification`: Notificações do sistema
- `MatchingRequest`: Pedidos de matching
- `Cause`: Causas disponíveis
- `Skill`: Competências dos utilizadores

## Próximos Passos

### Backend
1. Implementar endpoints da API do cliente area
2. Configurar sistema de notificações push
3. Criar modelos de dados no Django
4. Implementar lógica de matching

### Frontend
1. Testes unitários e de integração
2. Otimização de performance
3. Melhorias de acessibilidade
4. Funcionalidades avançadas de PWA

### Mobile
1. Notificações push
2. Sincronização offline
3. Geolocalização para matching
4. Camera para upload de imagens

## Tecnologias Utilizadas

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para styling
- **shadcn/ui** para componentes
- **TanStack Query** para gestão de estado
- **React Router** para navegação
- **PWA** com Service Workers

## Contribuição

Para contribuir com o projeto:

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Implemente as alterações
4. Execute os testes
5. Submeta um pull request

## Suporte

Para questões técnicas ou sugestões, contacte a equipa de desenvolvimento através dos canais oficiais da Moz Solidária.
