# Sistema de Categorias de Projetos

Este documento descreve o sistema completo de categorias de projetos implementado para a plataforma Moz Solidária.

## 🎯 Objetivo

Transformar a galeria estática de projetos em um sistema dinâmico e gerenciável pelo administrador, com categorização avançada, progresso em tempo real e interface responsiva.

## 📊 Componentes Implementados

### Backend (Django)

#### Modelos de Dados

1. **ProjectCategory** - Categorias específicas de projetos
   - Nome, slug, descrição
   - Cor e ícone personalizáveis
   - Relacionamento com programas
   - Status ativo/inativo e ordenação

2. **Project** (expandido) - Modelo de projetos aprimorado
   - Novos campos: progresso, beneficiários atuais/meta, prioridade
   - Relacionamento com categorias
   - Campos SEO e configurações de visibilidade
   - Campos financeiros (orçamento/arrecadado)

3. **ProjectUpdate** - Atualizações e marcos dos projetos
   - Títulos, conteúdo e imagens
   - Marco importante (milestone)
   - Usuário criador e timestamps

4. **ProjectGallery** - Galeria de imagens dos projetos
   - Múltiplas imagens por projeto
   - Ordenação e imagem destaque
   - Títulos e descrições

#### APIs REST

**Endpoints Administrativos** (`/api/v1/projects/admin/`)
- `categories/` - CRUD completo de categorias
- `projects/` - CRUD completo de projetos
- `project-updates/` - Gestão de atualizações
- `project-gallery/` - Gestão de galeria

**Endpoints Públicos** (`/api/v1/projects/public/`)
- `categories/` - Listagem pública de categorias
- `projects/` - Listagem pública de projetos
- `projects/featured/` - Projetos em destaque
- `projects/by_category/` - Projetos agrupados por categoria

#### Funcionalidades da API

- Filtros avançados (programa, categoria, status, prioridade)
- Busca por texto (nome, descrição, localização)
- Ordenação personalizável
- Paginação automática
- Otimização de queries com select_related/prefetch_related

### Frontend (React/TypeScript)

#### Componentes Principais

1. **ProjectGallery.tsx** - Galeria dinâmica de projetos
   - Cards responsivos com hover effects
   - Filtros por categoria em tempo real
   - Modal de visualização rápida
   - Barra de progresso visual
   - Loading states e estados vazios
   - Links para páginas de detalhes

2. **ProjectCategoryManagement.tsx** - Gestão administrativa
   - Interface completa de CRUD
   - Formulários com validação
   - Filtros por programa
   - Estatísticas em tempo real
   - Tabela ordenável e editável
   - Modais de confirmação

3. **Dashboard.tsx** (atualizado)
   - Nova aba "Categorias" integrada
   - Layout responsivo de 8 colunas
   - Navegação consistente

#### Funcionalidades do Frontend

- **Responsividade**: Layout adaptativo para mobile/desktop
- **Estados de Loading**: Skeleton screens e spinners
- **Validação**: Formulários com validação em tempo real
- **Acessibilidade**: Labels, ARIA e navegação por teclado
- **UX Otimizada**: Feedback visual, confirmações e mensagens de sucesso/erro

## 🚀 Fluxo de Trabalho

### Para Administradores

1. **Gestão de Categorias**
   - Acesse Dashboard → Tab "Categorias"
   - Crie/edite categorias vinculadas a programas
   - Configure cores, ícones e descrições
   - Defina ordem de exibição

2. **Gestão de Projetos**
   - Acesse Dashboard → Tab "Projetos"
   - Crie projeto selecionando programa e categoria
   - Configure progresso, beneficiários e status
   - Adicione imagens e atualizações
   - Publique para visualização pública

### Para Usuários Finais

1. **Visualização de Projetos**
   - Acesse a galeria pública
   - Filtre por categorias de interesse
   - Visualize progresso e impacto
   - Clique para ver detalhes completos
   - Acesse histórico de atualizações

## 📋 Configuração e Instalação

### 1. Migrações do Banco de Dados

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 2. Criação de Dados Iniciais

```bash
python create_project_categories.py
```

Este script criará:
- Categorias padrão para cada programa
- Relacionamento entre projetos existentes e categorias
- Dados de exemplo para teste

### 3. Configuração do Admin Django

As novas classes foram registradas no admin:
- ProjectCategoryAdmin
- ProjectAdmin (expandido)
- ProjectUpdateAdmin
- ProjectGalleryAdmin

### 4. Instalação de Dependências Frontend

Certifique-se de que as dependências estão instaladas:
- React Router Dom (navegação)
- Lucide React (ícones)
- Sonner (notificações)
- Componentes UI existentes

## 🎨 Design System

### Cores de Categorias
- Azul (`blue`) - Educação, Infraestrutura
- Verde (`green`) - Formação, Sustentabilidade
- Vermelho (`red`) - Apoio Humanitário, Emergência
- Roxo (`purple`) - Saúde, Inovação
- Laranja (`orange`) - Infraestrutura, Energia
- Rosa (`pink`) - Apoio Social, Mulheres
- Amarelo (`yellow`) - Educação, Energia
- Cinza (`gray`) - Outros, Administrativo

### Ícones Disponíveis
- Building, Heart, Users, GraduationCap
- Stethoscope, Hammer, Lightbulb, Leaf
- Shield, Globe, BookOpen, Home

## 📊 Estrutura de Dados

### Hierarquia

```
Programa
├── Educação
│   ├── Construção de Escolas
│   ├── Formação de Professores
│   ├── Material Escolar
│   └── Bolsas de Estudo
├── Apoio Humanitário
│   ├── Distribuição de Alimentos
│   ├── Abrigos Temporários
│   ├── Vestuário e Cobertores
│   └── Apoio Psicossocial
└── [outros programas...]
```

### Status de Projetos
- `planning` - Planejamento (não público)
- `active` - Ativo (público)
- `completed` - Concluído (público)
- `suspended` - Suspenso (administração)

## 🔧 Manutenção

### Adicionando Novas Categorias
1. Acesse o Dashboard administrativo
2. Tab "Categorias" → "Nova Categoria"
3. Selecione programa pai
4. Configure nome, cor e ícone
5. Defina ordem de exibição

### Monitoramento
- Acompanhe estatísticas no Dashboard
- Verifique projetos sem categoria
- Monitore performance das APIs
- Analise engajamento por categoria

## 📈 Melhorias Futuras

### Funcionalidades Pendentes
- [ ] Sistema de tags adicional
- [ ] Filtros avançados (localização, orçamento)
- [ ] Relatórios automáticos
- [ ] Integração com doações por categoria
- [ ] Dashboard público de impacto
- [ ] Notificações de progresso
- [ ] Sistema de favoritos para usuários

### Otimizações Técnicas
- [ ] Cache de estatísticas
- [ ] Compressão de imagens automática
- [ ] Lazy loading de componentes
- [ ] Service Worker para offline
- [ ] Metrics e analytics
- [ ] Testes automatizados

## 📞 Suporte

Para questões técnicas ou sugestões de melhorias, consulte:
- Documentação da API em `/admin/doc/`
- Logs do sistema em desenvolvimento
- Interface administrativa Django em `/admin/`

---

**Status**: ✅ Implementado e funcional
**Versão**: 1.0.0
**Data**: Janeiro 2025
