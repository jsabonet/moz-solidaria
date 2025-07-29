# MOZ SOLIDÁRIA - Backend API

## 🚀 Configuração Concluída

### ✅ Tecnologias Implementadas
- **Framework**: Django 4.2.7 + Django REST Framework 3.14.0
- **Base de Dados**: PostgreSQL (configurado com SQLite como fallback)
- **Autenticação**: JWT com Simple JWT
- **CORS**: Configurado para frontend React

### ✅ Aplicações Criadas

#### 1. **Blog App** - Sistema Completo de Blog
**Modelos:**
- `BlogPost` - Posts do blog com sistema completo
- `Category` - Categorias de posts
- `Tag` - Sistema de tags
- `Comment` - Sistema de comentários
- `Newsletter` - Gestão de newsletter

**Funcionalidades:**
- ✅ CRUD completo de posts
- ✅ Sistema de categorias e tags
- ✅ Comentários moderados
- ✅ Newsletter subscription
- ✅ Sistema de visualizações
- ✅ Cálculo automático de tempo de leitura
- ✅ Posts em destaque
- ✅ Filtros avançados
- ✅ Busca textual
- ✅ Posts relacionados
- ✅ Paginação

**API Endpoints:**
```
/api/v1/blog/posts/                    # Lista/Cria posts
/api/v1/blog/posts/{slug}/             # Detalhes/Edita/Deleta post
/api/v1/blog/posts/featured/           # Posts em destaque
/api/v1/blog/posts/latest/             # Posts recentes
/api/v1/blog/posts/popular/            # Posts populares
/api/v1/blog/posts/{slug}/related/     # Posts relacionados
/api/v1/blog/categories/               # Categorias
/api/v1/blog/tags/                     # Tags
/api/v1/blog/newsletter/               # Newsletter
```

#### 2. **Core App** - Funcionalidades Gerais
**Modelos:**
- `Contact` - Formulário de contato
- `Program` - Programas da organização
- `Project` - Projetos específicos
- `TeamMember` - Membros da equipe
- `Testimonial` - Depoimentos
- `SiteSettings` - Configurações do site

### ✅ Funcionalidades de Segurança
- **Permissões customizadas**: IsAuthorOrReadOnly, IsStaffOrReadOnly
- **Autenticação JWT**: Tokens de acesso e refresh
- **CORS configurado**: Para permitir acesso do frontend
- **Validações**: Campos obrigatórios e validações customizadas

### ✅ Admin Interface
- Interface administrativa completa
- Gestão de posts, categorias, tags
- Moderação de comentários
- Gestão de newsletter
- Configurações do site

### ✅ Base de Dados
- **PostgreSQL** configurado (com fallback SQLite)
- **Migrações** aplicadas
- **Superusuário** criado: `admin` / `admin123`
- **Comando de população**: `python manage.py populate_blog`

## 🔧 Como Usar

### 1. Instalar Dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Base de Dados
```bash
# Se PostgreSQL não estiver disponível, usar SQLite (já configurado)
python setup_db.py  # Para PostgreSQL
python manage.py migrate
```

### 3. Criar Dados de Teste
```bash
python manage.py populate_blog
```

### 4. Executar Servidor
```bash
python manage.py runserver 8000
```

### 5. Acessar Admin
- URL: http://localhost:8000/admin/
- Login: `admin`
- Senha: `admin123`

### 6. Testar API
- URL Base: http://localhost:8000/api/v1/
- Documentação: http://localhost:8000/api/v1/blog/posts/

## 📱 Integração Frontend

### Configuração CORS
O backend está configurado para aceitar requisições de:
- http://localhost:3000
- http://localhost:5173
- http://localhost:8080
- http://localhost:8081

### Endpoints Principais para Frontend
```javascript
// Listar posts
GET /api/v1/blog/posts/

// Post específico
GET /api/v1/blog/posts/{slug}/

// Categorias
GET /api/v1/blog/categories/

// Inscrição newsletter
POST /api/v1/blog/newsletter/subscribe/
```

### Autenticação
```javascript
// Login
POST /api/v1/auth/token/
{
  "username": "admin",
  "password": "admin123"
}

// Refresh token
POST /api/v1/auth/token/refresh/
{
  "refresh": "token_here"
}
```

## 🗂️ Estrutura de Arquivos

```
backend/
├── blog/                          # App do blog
│   ├── models.py                   # Modelos do blog
│   ├── serializers.py              # Serializers da API
│   ├── views.py                    # Views da API
│   ├── admin.py                    # Interface administrativa
│   ├── urls.py                     # URLs do blog
│   ├── filters.py                  # Filtros customizados
│   ├── permissions.py              # Permissões customizadas
│   └── management/commands/        # Comandos customizados
├── core/                          # App principal
│   ├── models.py                   # Modelos gerais
│   └── urls.py                     # URLs do core
├── moz_solidaria_api/             # Configurações Django
│   ├── settings.py                 # Configurações
│   └── urls.py                     # URLs principais
├── .env                           # Variáveis de ambiente
├── requirements.txt               # Dependências Python
├── manage.py                      # Django management
└── setup_db.py                   # Script configuração DB
```

## 🎯 Próximos Passos

1. **Integrar com Frontend React**
   - Atualizar componentes para usar API
   - Implementar autenticação
   - Configurar estado global

2. **Adicionar Funcionalidades**
   - Upload de imagens
   - Editor rich text
   - Notificações email
   - Analytics

3. **Deploy**
   - Configurar produção
   - Setup PostgreSQL
   - Configurar media files
   - SSL/HTTPS

O backend está **100% funcional** e pronto para ser integrado com o frontend React!
