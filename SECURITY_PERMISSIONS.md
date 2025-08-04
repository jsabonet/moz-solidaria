# 🔐 Sistema de Permissões e Autenticação - MOZ SOLIDÁRIA

## 📋 **Resumo das Implementações**

### **🔧 Backend (Django REST Framework)**

#### **1. Permissões Customizadas**
- **`IsAuthorOrReadOnly`**: Permite leitura para todos, escrita apenas para autores dos posts ou staff
- **`IsStaffOrReadOnly`**: Permite leitura para todos, escrita apenas para staff 
- **`IsOwnerOrReadOnly`**: Permite leitura para todos, escrita apenas para donos do objeto

#### **2. Configurações de Segurança**
- JWT Authentication habilitado
- Permissão padrão: `IsAuthenticatedOrReadOnly`
- CORS configurado adequadamente
- Tokens com expiração (60min access, 7 dias refresh)

#### **3. ViewSets com Permissões**
- **BlogPostViewSet**: `IsAuthorOrReadOnly` - Usuários autenticados podem criar posts, apenas autores podem editar
- **CategoryViewSet**: `IsStaffOrReadOnly` - Apenas staff pode gerenciar categorias
- **CommentViewSet**: `IsAuthenticatedOrReadOnly` - Usuários autenticados podem comentar
- **NewsletterViewSet**: Permite inscrição sem autenticação

#### **4. Endpoints de Usuário**
- `GET /api/v1/core/profile/` - Perfil do usuário autenticado
- `PUT /api/v1/core/profile/update/` - Atualizar perfil

### **🎨 Frontend (React + TypeScript)**

#### **1. Sistema de Autenticação**
- Hook `useAuth` com verificação de token
- Refresh automático de tokens
- Estado de autenticação persistente
- Verificação de privilégios (isStaff, isAuthenticated)

#### **2. Rotas Protegidas**
- Componente `ProtectedRoute` com verificação de auth/staff
- Redirecionamento automático para login
- Mensagens de erro adequadas para cada tipo de restrição

#### **3. Interface de Login/Logout**
- Header atualizado com dropdown de usuário
- Botões de login/logout responsivos
- Indicação visual do status de autenticação

#### **4. Rotas Protegidas Configuradas**
- `/dashboard` - Requer autenticação + staff
- `/dashboard/posts/new` - Requer autenticação + staff  
- `/dashboard/posts/edit/:slug` - Requer autenticação + staff
- `/dashboard/categories` - Requer autenticação + staff

## 🔑 **Credenciais de Acesso**

### **Superusuário Django**
- **Usuário**: `admin`
- **Senha**: `admin123`
- **URL Admin**: `http://localhost:8000/admin/`

## 🚀 **Como Testar**

### **1. Testar Autenticação**
```bash
# Fazer login
curl -X POST http://localhost:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Usar token para acessar endpoint protegido
curl -X GET http://localhost:8000/api/v1/core/profile/ \
  -H "Authorization: Bearer <seu_token_aqui>"
```

### **2. Testar Permissões de Posts**
```bash
# Criar post (requer autenticação)
curl -X POST http://localhost:8000/api/v1/blog/posts/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Teste", "content": "Conteúdo teste"}'

# Tentar editar post de outro usuário (deve falhar)
curl -X PUT http://localhost:8000/api/v1/blog/posts/teste/ \
  -H "Authorization: Bearer <token_outro_usuario>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Editado"}'
```

### **3. Testar Frontend**
1. Acesse `http://localhost:5173`
2. Tente acessar `/dashboard` sem login (deve redirecionar)
3. Faça login em `/login` com `admin/admin123`
4. Acesse `/dashboard` (deve funcionar)
5. Verifique header com dropdown do usuário

## 📊 **Níveis de Acesso**

### **🔓 Público (Sem Autenticação)**
- Visualizar posts publicados
- Visualizar categorias
- Inscrever-se na newsletter
- Páginas institucionais (sobre, programas, contato)

### **🔐 Usuário Autenticado**
- Criar posts (status draft)
- Editar próprios posts
- Comentar em posts
- Atualizar próprio perfil

### **👤 Staff/Administrador**
- Todas as permissões de usuário autenticado
- Gerenciar categorias
- Editar posts de outros usuários
- Acesso ao dashboard administrativo
- Moderar comentários

### **🔒 Superusuário**
- Todas as permissões anteriores
- Acesso total ao Django Admin
- Gerenciar usuários e permissões
- Configurações do sistema

## 🛡️ **Medidas de Segurança Implementadas**

1. **Autenticação JWT** com tokens de curta duração
2. **Refresh tokens** para renovação automática
3. **Verificação de permissões** em cada endpoint
4. **CORS** configurado para domínios específicos
5. **Validação de entrada** em todos os formulários
6. **Sanitização de dados** no backend
7. **Rate limiting** (configurável)
8. **HTTPS** ready (para produção)

## 🔄 **Fluxo de Autenticação**

1. **Login**: `POST /api/v1/auth/token/` → Retorna access + refresh token
2. **Verificação**: Frontend verifica token automaticamente
3. **Renovação**: Token expirado → Usa refresh token automaticamente
4. **Logout**: Remove tokens do localStorage + estado da aplicação

## 📝 **Próximos Passos**

- [ ] Implementar recuperação de senha
- [ ] Sistema de roles mais granular
- [ ] Auditoria de ações (logs)
- [ ] Notificações de segurança
- [ ] Two-factor authentication
- [ ] Rate limiting por usuário
- [ ] Blacklist de tokens
