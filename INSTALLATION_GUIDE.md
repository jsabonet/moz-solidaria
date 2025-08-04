# 🚀 Guia de Instalação e Configuração - Sistema de Segurança

## 📋 **Pré-requisitos**

- Python 3.8+
- Node.js 16+
- Git

## 🔧 **Configuração do Backend**

### 1. Instalar dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar banco de dados

```bash
# Aplicar migrações
python manage.py migrate

# Criar superusuário (se não existir)
python manage.py createsuperuser
# Usuário sugerido: admin
# Senha sugerida: admin123
```

### 3. Popular dados de teste (opcional)

```bash
python manage.py populate_blog
```

### 4. Iniciar servidor

```bash
python manage.py runserver
```

O backend estará disponível em `http://localhost:8000`

## 🎨 **Configuração do Frontend**

### 1. Instalar dependências

```bash
cd .. # voltar para raiz do projeto
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 🔐 **Testando o Sistema**

### Opção 1: Script Automático (Windows)

```powershell
.\test_auth.ps1
```

### Opção 2: Script Automático (Linux/Mac)

```bash
chmod +x test_auth.sh
./test_auth.sh
```

### Opção 3: Teste Manual

1. **Login no frontend:**
   - Acesse `http://localhost:5173/login`
   - Use: `admin` / `admin123`

2. **Teste de rotas protegidas:**
   - Tente acessar `/dashboard` sem login
   - Faça login e acesse `/dashboard` novamente

3. **Teste API diretamente:**
   ```bash
   # Login
   curl -X POST http://localhost:8000/api/v1/auth/token/ \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   
   # Usar token
   curl -X GET http://localhost:8000/api/v1/core/profile/ \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

## 🛠️ **Configurações Adicionais**

### Configurar CORS para produção

Em `backend/moz_solidaria_api/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://seu-dominio.com",
    "https://www.seu-dominio.com",
]
```

### Configurar SECRET_KEY para produção

```python
SECRET_KEY = os.environ.get('SECRET_KEY', 'sua-chave-super-secreta')
```

### Configurar banco de dados PostgreSQL

```python
DATABASES = {
    'default': dj_database_url.config(
        default='postgresql://user:password@localhost:5432/mozsolidaria'
    )
}
```

## 🔍 **Verificação de Funcionamento**

### ✅ **Backend OK se:**
- `http://localhost:8000/admin/` carrega a interface admin
- `http://localhost:8000/api/v1/blog/posts/` retorna lista de posts
- Login JWT funciona em `http://localhost:8000/api/v1/auth/token/`

### ✅ **Frontend OK se:**
- `http://localhost:5173` carrega a página inicial
- Header mostra botão "Entrar" quando não logado
- Rota `/dashboard` redireciona para login quando não autenticado
- Após login, header mostra dropdown com nome do usuário

### ✅ **Permissões OK se:**
- Usuários não autenticados não conseguem criar posts
- Apenas autores podem editar seus próprios posts
- Apenas staff pode gerenciar categorias
- Rotas de dashboard são protegidas

## 🐛 **Solução de Problemas**

### Erro de CORS
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solução:** Verificar configuração CORS no `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Erro JWT "Token is blacklisted"
**Solução:** Limpar localStorage e fazer login novamente:
```javascript
localStorage.clear()
```

### Erro 403 ao criar posts
**Solução:** Verificar se usuário está autenticado e tem permissões adequadas.

### Frontend não conecta com backend
**Solução:** Verificar se:
1. Backend está rodando na porta 8000
2. Variável `VITE_API_URL` está configurada
3. Não há firewall bloqueando

## 📚 **Documentação Adicional**

- [Sistema de Permissões Detalhado](./SECURITY_PERMISSIONS.md)
- [API Endpoints](./backend/README.md)
- [Estrutura do Frontend](./src/README.md)

## 🤝 **Suporte**

Em caso de problemas:
1. Verifique os logs do backend: `python manage.py runserver --verbosity=2`
2. Verifique o console do browser (F12)
3. Execute os scripts de teste para validar configuração
4. Consulte a documentação de cada componente
